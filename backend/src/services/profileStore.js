const fs = require("fs/promises");
const { randomUUID } = require("crypto");
const FitnessProfile = require("../models/FitnessProfile");
const connectDB = require("../config/db");

const getMode = () => connectDB.getDatabaseMode();

const normalizeText = (value) => (value == null ? "" : String(value).trim());
const normalizeNumber = (value) => {
  if (value === "" || value == null) return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const dataFile = connectDB.dataFile;

const readJsonDb = async () => {
  await connectDB.ensureJsonDatabaseFile();
  const file = await fs.readFile(dataFile, "utf8");
  return JSON.parse(file);
};

const writeJsonDb = async (db) => {
  await fs.writeFile(dataFile, JSON.stringify(db, null, 2));
};

const mapProfileInput = (profileData) => {
  const fitnessGoal = Array.isArray(profileData.goals)
    ? profileData.goals.filter(Boolean).join(", ")
    : normalizeText(profileData.fitnessGoal || profileData.goal);

  return {
    age: normalizeNumber(profileData.age),
    gender: normalizeText(profileData.gender),
    height: normalizeNumber(profileData.height),
    weight: normalizeNumber(profileData.weight),
    fitnessGoal,
    workoutExperience: normalizeText(profileData.workoutExperience || profileData.experienceLevel),
    workoutLocation: normalizeText(profileData.workoutLocation || profileData.location),
    workoutDaysPerWeek: normalizeNumber(profileData.workoutDaysPerWeek || profileData.daysPerWeek),
    workoutDuration: normalizeNumber(profileData.workoutDuration || profileData.duration),
    targetBodyFocus: normalizeText(profileData.targetBodyFocus || profileData.focus),
    dietaryPreference: normalizeText(profileData.dietaryPreference),
    foodRestrictions: normalizeText(profileData.foodRestrictions || profileData.restrictions),
  };
};

const validateProfile = (profile) => {
  const requiredFields = [
    "age",
    "gender",
    "height",
    "weight",
    "fitnessGoal",
    "workoutExperience",
    "workoutLocation",
    "workoutDaysPerWeek",
    "workoutDuration",
    "targetBodyFocus",
    "dietaryPreference",
  ];

  return requiredFields.every((field) => profile[field] !== undefined && profile[field] !== "");
};

const formatProfile = (profile) => {
  if (!profile) return null;

  return {
    id: profile._id || profile.id,
    user: profile.user,
    age: profile.age,
    gender: profile.gender,
    height: profile.height,
    weight: profile.weight,
    fitnessGoal: profile.fitnessGoal,
    goal: profile.fitnessGoal,
    workoutExperience: profile.workoutExperience,
    experienceLevel: profile.workoutExperience,
    workoutLocation: profile.workoutLocation,
    location: profile.workoutLocation,
    workoutDaysPerWeek: profile.workoutDaysPerWeek,
    daysPerWeek: profile.workoutDaysPerWeek,
    workoutDuration: profile.workoutDuration,
    duration: profile.workoutDuration,
    targetBodyFocus: profile.targetBodyFocus,
    focus: profile.targetBodyFocus,
    dietaryPreference: profile.dietaryPreference,
    foodRestrictions: profile.foodRestrictions,
    restrictions: profile.foodRestrictions,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
};

const getProfileByUserId = async (userId) => {
  if (getMode() === "json") {
    const db = await readJsonDb();
    return formatProfile(db.fitnessProfiles.find((profile) => String(profile.user) === String(userId)) || null);
  }

  const profile = await FitnessProfile.findOne({ user: userId });
  return formatProfile(profile);
};

const createOrUpdateProfile = async (userId, profileData) => {
  const normalized = mapProfileInput(profileData);

  if (!validateProfile(normalized)) {
    const error = new Error("Please complete all required profile fields.");
    error.statusCode = 400;
    throw error;
  }

  if (getMode() === "json") {
    const db = await readJsonDb();
    const now = new Date().toISOString();
    const index = db.fitnessProfiles.findIndex((profile) => String(profile.user) === String(userId));

    const existing = index >= 0 ? db.fitnessProfiles[index] : null;
    const record = {
      _id: existing?._id || randomUUID(),
      user: String(userId),
      ...normalized,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };

    if (index >= 0) {
      db.fitnessProfiles[index] = record;
    } else {
      db.fitnessProfiles.push(record);
    }

    await writeJsonDb(db);
    return formatProfile(record);
  }

  const profile = await FitnessProfile.findOneAndUpdate(
    { user: userId },
    { $set: { ...normalized, user: userId } },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );

  return formatProfile(profile);
};

module.exports = {
  getProfileByUserId,
  createOrUpdateProfile,
};
