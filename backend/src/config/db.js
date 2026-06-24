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

connectDB.validateEnv = validateEnv;
connectDB.getDatabaseMode = getDatabaseMode;
connectDB.ensureJsonDatabaseFile = ensureJsonDatabaseFile;
connectDB.dataFile = dataFile;

module.exports = connectDB;
