const fs = require("fs/promises");
const { randomUUID } = require("crypto");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../models/User");
const connectDB = require("../config/db");

const getMode = () => connectDB.getDatabaseMode();

const normalizeEmail = (email) => (email || "").trim().toLowerCase();
const normalizeName = (fullName) => (fullName || "").trim();

const toSafeUser = (user) => {
  if (!user) return null;

  const raw = typeof user.toObject === "function" ? user.toObject() : { ...user };
  const id = raw._id?.toString?.() || raw.id?.toString?.() || raw._id || raw.id;

  return {
    ...raw,
    _id: id,
    id,
    password: raw.password,
  };
};

const publicUser = (user) => {
  const safe = toSafeUser(user);
  if (!safe) return null;

  delete safe.password;
  return safe;
};

const readJsonDb = async () => {
  await connectDB.ensureJsonDatabaseFile();
  const file = await fs.readFile(connectDB.dataFile, "utf8");
  return JSON.parse(file);
};

const writeJsonDb = async (db) => {
  await fs.writeFile(connectDB.dataFile, JSON.stringify(db, null, 2));
};

const findJsonUserByEmail = async (email) => {
  const db = await readJsonDb();
  return db.users.find((user) => normalizeEmail(user.email) === normalizeEmail(email)) || null;
};

const findJsonUserById = async (id) => {
  const db = await readJsonDb();
  return db.users.find((user) => user._id === String(id) || user.id === String(id)) || null;
};

const findUserByEmail = async (email, options = {}) => {
  const normalizedEmail = normalizeEmail(email);

  if (getMode() === "json") {
    const user = await findJsonUserByEmail(normalizedEmail);
    if (!user) return null;
    return options.includePassword ? user : publicUser(user);
  }

  let query = User.findOne({ email: normalizedEmail });
  if (options.includePassword) {
    query = query.select("+password");
  }

  const user = await query;
  return options.includePassword ? toSafeUser(user) : publicUser(user);
};

const findUserById = async (id, options = {}) => {
  if (getMode() === "json") {
    const user = await findJsonUserById(id);
    if (!user) return null;
    return options.includePassword ? user : publicUser(user);
  }

  let query = User.findById(id);
  if (options.includePassword) {
    query = query.select("+password");
  }

  const user = await query;
  return options.includePassword ? toSafeUser(user) : publicUser(user);
};

const createUser = async (userData) => {
  const fullName = normalizeName(userData.fullName || userData.name);
  const email = normalizeEmail(userData.email);
  const rawPassword = userData.password || "";
  const agreedToTerms = Boolean(userData.agreedToTerms);
  const role = userData.role === "admin" ? "admin" : "user";

  if (getMode() === "json") {
    const db = await readJsonDb();
    const existing = db.users.find((user) => normalizeEmail(user.email) === email);
    if (existing) {
      const error = new Error("Email is already registered.");
      error.statusCode = 409;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    const now = new Date().toISOString();
    const record = {
      _id: randomUUID(),
      fullName,
      email,
      password: hashedPassword,
      role,
      agreedToTerms,
      createdAt: now,
      updatedAt: now,
    };

    db.users.push(record);
    await writeJsonDb(db);
    return publicUser(record);
  }

  const user = await User.create({
    fullName,
    email,
    password: rawPassword,
    agreedToTerms,
    role,
  });

  return publicUser(user);
};

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  getMode,
};
