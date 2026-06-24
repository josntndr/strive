const mongoose = require("mongoose");

const fitnessProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    age: Number,
    gender: String,
    height: Number,
    weight: Number,
    fitnessGoal: {
      type: String,
      default: "Improve overall fitness",
    },
    workoutExperience: {
      type: String,
      default: "Beginner",
    },
    workoutLocation: {
      type: String,
      default: "Gym",
    },
    workoutDaysPerWeek: {
      type: Number,
      default: 3,
      min: 1,
      max: 7,
    },
    workoutDuration: {
      type: Number,
      default: 60,
    },
    targetBodyFocus: {
      type: String,
      default: "Full body",
    },
    dietaryPreference: {
      type: String,
      default: "Balanced",
    },
    foodRestrictions: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.FitnessProfile || mongoose.model("FitnessProfile", fitnessProfileSchema);
