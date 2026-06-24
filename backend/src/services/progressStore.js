const fs = require("fs/promises");
const { randomUUID } = require("crypto");
const ProgressRecord = require("../models/ProgressRecord");
const connectDB = require("../config/db");

const getMode = () => connectDB.getDatabaseMode();
const dataFile = connectDB.dataFile;

const readJsonDb = async () => {
  await connectDB.ensureJsonDatabaseFile();
  const file = await fs.readFile(dataFile, "utf8");
  return JSON.parse(file);
};

const writeJsonDb = async (db) => {
  await fs.writeFile(dataFile, JSON.stringify(db, null, 2));
};

const formatRecord = (record) => {
  if (!record) return null;

  return {
    id: record._id || record.id,
    user: record.user,
    date: record.date,
    weight: record.weight,
    waist: record.waistMeasurement ?? record.waist,
    hips: record.hipMeasurement ?? record.hips,
    notes: record.notes || "",
    photoUrl: record.photoUrl || "",
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
};

const getProgressRecordsByUserId = async (userId) => {
  if (getMode() === "json") {
    const db = await readJsonDb();
    return db.progressRecords
      .filter((record) => String(record.user) === String(userId))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map(formatRecord);
  }

  const records = await ProgressRecord.find({ user: userId }).sort({ date: -1 });
  return records.map(formatRecord);
};

const createProgressRecord = async (userId, payload) => {
  const recordData = {
    weight: payload.weight === "" || payload.weight == null ? undefined : Number(payload.weight),
    waistMeasurement:
      payload.waistMeasurement ?? payload.waist
        ? Number(payload.waistMeasurement ?? payload.waist)
        : undefined,
    hipMeasurement:
      payload.hipMeasurement ?? payload.hips
        ? Number(payload.hipMeasurement ?? payload.hips)
        : undefined,
    notes: payload.notes || "",
    photoUrl: payload.photoUrl || "",
    date: payload.date ? new Date(payload.date) : new Date(),
  };

  if (!recordData.weight || Number.isNaN(recordData.weight)) {
    const error = new Error("Current weight is required.");
    error.statusCode = 400;
    throw error;
  }

  if (getMode() === "json") {
    const db = await readJsonDb();
    const now = new Date().toISOString();
    const record = {
      _id: randomUUID(),
      user: String(userId),
      ...recordData,
      date: recordData.date.toISOString(),
      createdAt: now,
      updatedAt: now,
    };

    db.progressRecords.push(record);
    await writeJsonDb(db);
    return formatRecord(record);
  }

  const record = await ProgressRecord.create({
    user: userId,
    ...recordData,
  });

  return formatRecord(record);
};

module.exports = {
  getProgressRecordsByUserId,
  createProgressRecord,
};
