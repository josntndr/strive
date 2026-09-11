const fs = require("fs/promises");
const path = require("path");
const mongoose = require("mongoose");

mongoose.set("bufferCommands", false);

const DEFAULT_DB = {
  users: [],
  fitnessProfiles: [],
  workoutPlans: [],
  mealPlans: [],
  workoutLogs: [],
  mealLogs: [],
  progressRecords: [],
};

const dataDir = path.join(__dirname, "..", "..", "data");
const dataFile = path.join(dataDir, "db.json");

const getDatabaseMode = () => {
  const mode = (process.env.DB_MODE || "json").trim().toLowerCase();
  return mode === "mongo" ? "mongo" : "json";
};

const validateEnv = () => {
  if (!process.env.JWT_SECRET) {
    console.error("Missing JWT_SECRET in backend/.env. Please add a secure JWT secret.");
    throw new Error("Missing JWT_SECRET in backend/.env. Please add a secure JWT secret.");
  }

  const secret = process.env.JWT_SECRET.trim();
  const weakSecrets = ["replace_this_with_a_secure_secret", "secret", "changeme", "your_jwt_secret", "jwt_secret"];
  if (weakSecrets.includes(secret.toLowerCase()) || secret.length < 16) {
    throw new Error("Insecure JWT_SECRET. Set a strong, unique secret (at least 16 characters) in backend/.env.");
  }

  if (getDatabaseMode() !== "mongo") {
    return;
  }

  if (!process.env.MONGO_URI) {
    console.error("Missing MONGO_URI in backend/.env. Please add your MongoDB Atlas connection string.");
    throw new Error("Missing MONGO_URI in backend/.env. Please add your MongoDB Atlas connection string.");
  }

  const uri = process.env.MONGO_URI.trim();
  const placeholderPatterns = [
    "USERNAME:PASSWORD@CLUSTER",
    "your_mongodb_atlas_connection_string_here",
    "<username>",
    "<password>",
    "<cluster-host>",
    "cluster0.xxxxx.mongodb.net",
  ];

  if (placeholderPatterns.some((pattern) => uri.includes(pattern))) {
    throw new Error("MongoDB connection failed. Please check your MongoDB Atlas connection string in backend/.env.");
  }
};

const ensureJsonDatabaseFile = async () => {
  await fs.mkdir(dataDir, { recursive: true });

  try {
    const file = await fs.readFile(dataFile, "utf8");
    if (!file.trim()) {
      await fs.writeFile(dataFile, JSON.stringify(DEFAULT_DB, null, 2));
      return;
    }

    JSON.parse(file);
  } catch {
    await fs.writeFile(dataFile, JSON.stringify(DEFAULT_DB, null, 2));
  }
};

const connectDB = async () => {
  validateEnv();

  if (getDatabaseMode() === "json") {
    await ensureJsonDatabaseFile();
    console.log("Using JSON fallback database");
    return { mode: "json", file: dataFile };
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("MongoDB connected successfully");
    return mongoose.connection;
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw new Error("MongoDB connection failed. Please check your MongoDB Atlas connection string in backend/.env.");
  }
};

// --- Object-database storage backend -----------------------------------------
// Uses Vercel Blob (private, token-gated) when BLOB_READ_WRITE_TOKEN is set
// (i.e. on Vercel), so the JSON database persists on a read-only serverless
// filesystem. Locally it falls back to the on-disk db.json file.
//
// CRITICAL: each collection is stored in its OWN blob (strive-db/<name>.json),
// never one big DB blob. Vercel Blob is eventually consistent, so a read can
// briefly return a stale copy. With one combined blob, a read-modify-write of
// (say) the profile would read a stale DB that is missing a just-registered
// user, then write the whole thing back and ERASE that user. Splitting per
// collection means a profile write only ever touches the profiles blob, so it
// can never clobber the users blob. Each writer persists only its collection.
const useBlobStorage = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);
const COLLECTIONS = Object.keys(DEFAULT_DB);
const blobPathFor = (name) => `strive-db/${name}.json`;
const cloneDefault = () => JSON.parse(JSON.stringify(DEFAULT_DB));

let blobLib;
const getBlob = () => blobLib || (blobLib = require("@vercel/blob"));

// Write-through cache to paper over Blob's eventual consistency. Vercel reuses
// a warm function instance for a user's rapid sequential requests, so when this
// instance has written a collection in the last RECENT_TTL_MS we overlay those
// records on top of the (possibly still-stale) blob read. This makes the common
// flow — register → save profile → immediately generate a plan — read its own
// fresh writes instead of briefly missing them.
const RECENT_TTL_MS = 60000;
const recentWrites = new Map(); // name -> { items, at }

const rememberWrite = (name, items) => {
  recentWrites.set(name, { items: items || [], at: Date.now() });
};

const idOf = (record) => record?._id ?? record?.id;

const overlayRecent = (name, fromBlob) => {
  const cached = recentWrites.get(name);
  if (!cached || Date.now() - cached.at > RECENT_TTL_MS) return fromBlob;
  // Union by id, preferring this instance's just-written version.
  const merged = new Map();
  for (const item of fromBlob) merged.set(idOf(item), item);
  for (const item of cached.items) merged.set(idOf(item), item);
  return [...merged.values()];
};

let seedDataCache = null;
const getSeedCollection = (name) => {
  if (!seedDataCache) {
    try {
      seedDataCache = require("../../data/db.json");
    } catch {
      try {
        const fsSync = require("fs");
        seedDataCache = JSON.parse(fsSync.readFileSync(dataFile, "utf8"));
      } catch {
        seedDataCache = DEFAULT_DB;
      }
    }
  }
  const items = seedDataCache?.[name];
  return Array.isArray(items) ? JSON.parse(JSON.stringify(items)) : [];
};

const readCollectionFromBlob = async (name) => {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return getSeedCollection(name);

  try {
    let meta;
    try {
      meta = await getBlob().head(blobPathFor(name), { token });
    } catch (error) {
      if (error?.name === "BlobNotFoundError" || /not\s*found/i.test(error?.message || "")) {
        return getSeedCollection(name);
      }
      throw error;
    }

    const targetUrl = meta?.downloadUrl || meta?.url;
    if (!targetUrl) return getSeedCollection(name);

    const res = await fetch(`${targetUrl}${targetUrl.includes("?") ? "&" : "?"}ts=${Date.now()}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (res.status === 404) return getSeedCollection(name);
    if (!res.ok) {
      // If blob store is blocked (403) or inaccessible, fall back to seed data
      console.warn(`[Blob fallback] HTTP ${res.status} reading ${name}, using seed data`);
      return getSeedCollection(name);
    }

    const text = await res.text();
    if (!text) return getSeedCollection(name);
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : getSeedCollection(name);
  } catch (err) {
    console.warn(`[Blob fallback] Error reading ${name} (${err.message}), using seed data`);
    return getSeedCollection(name);
  }
};

const writeCollectionToBlob = async (name, items) => {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  rememberWrite(name, items); // always serve our own fresh write in-memory

  if (token) {
    try {
      await getBlob().put(blobPathFor(name), JSON.stringify(items || []), {
        access: "private",
        token,
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "application/json",
        cacheControlMaxAge: 0,
      });
    } catch (putErr) {
      console.warn(`[Blob write warning] Put failed for ${name} (${putErr.message}), retained in-memory cache`);
    }
  }
};

const readDatabase = async () => {
  if (useBlobStorage()) {
    const db = cloneDefault();
    await Promise.all(
      COLLECTIONS.map(async (name) => {
        db[name] = overlayRecent(name, await readCollectionFromBlob(name));
      })
    );
    return db;
  }

  await ensureJsonDatabaseFile();
  const raw = JSON.parse(await fs.readFile(dataFile, "utf8"));
  // Merge over the default shape so every collection array always exists.
  return { ...cloneDefault(), ...(raw && typeof raw === "object" ? raw : {}) };
};

// Persist a single collection. This is the safe primitive every writer should
// use, so it never rewrites collections it didn't change.
const writeCollection = async (name, items) => {
  if (!COLLECTIONS.includes(name)) throw new Error(`Unknown collection: ${name}`);
  if (useBlobStorage()) return writeCollectionToBlob(name, items);

  await fs.mkdir(dataDir, { recursive: true });
  await ensureJsonDatabaseFile();
  const raw = JSON.parse(await fs.readFile(dataFile, "utf8"));
  const db = { ...cloneDefault(), ...(raw && typeof raw === "object" ? raw : {}) };
  db[name] = items || [];
  await fs.writeFile(dataFile, JSON.stringify(db, null, 2));
};

// Persist the whole DB (only used for seeding/reset). Writes every collection.
const writeDatabase = async (db) => {
  const full = { ...cloneDefault(), ...(db && typeof db === "object" ? db : {}) };
  if (useBlobStorage()) {
    await Promise.all(COLLECTIONS.map((name) => writeCollectionToBlob(name, full[name])));
    return;
  }
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(dataFile, JSON.stringify(full, null, 2));
};

connectDB.validateEnv = validateEnv;
connectDB.getDatabaseMode = getDatabaseMode;
connectDB.ensureJsonDatabaseFile = ensureJsonDatabaseFile;
connectDB.dataFile = dataFile;
connectDB.readDatabase = readDatabase;
connectDB.writeCollection = writeCollection;
connectDB.writeDatabase = writeDatabase;

module.exports = connectDB;
