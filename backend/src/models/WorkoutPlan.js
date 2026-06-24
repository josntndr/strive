const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sets: { type: Number, required: true },
    reps: { type: String, required: true, trim: true },
    rest: { type: String, required: true, trim: true },
    equipment: { type: String, required: true, trim: true },
    instruction: { type: String, required: true, trim: true },
    locationType: { type: String, enum: ["Gym", "Home", "Both"], default: "Both" },
    targetMuscle: { type: String, default: "", trim: true },
    difficulty: { type: String, default: "Beginner", trim: true },
    steps: { type: [String], default: [] },
    safetyTips: { type: [String], default: [] },
    commonMistakes: { type: [String], default: [] },
    visualDemo: { type: String, default: "", trim: true },
    animationUrl: { type: String, default: "", trim: true },
    animationKey: { type: String, default: "", trim: true },
    youtubeEmbedUrl: { type: String, default: "", trim: true },
    alternativeExercise: {
      name: { type: String, default: "", trim: true },
      equipment: { type: String, default: "", trim: true },
      locationType: { type: String, enum: ["Gym", "Home", "Both"], default: "Both" },
      summary: { type: String, default: "", trim: true },
      youtubeEmbedUrl: { type: String, default: "", trim: true },
    },
  },
  { _id: false }
);

const workoutDaySchema = new mongoose.Schema(
  {
    day: { type: String, required: true, trim: true },
    focus: { type: String, required: true, trim: true },
    exercises: [exerciseSchema],
    completed: { type: Boolean, default: false },
    notes: { type: String, default: "" },
  },
  { _id: false }
);

const workoutPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    planName: {
      type: String,
      default: "Workout Plan",
      trim: true,
    },
    workoutLocation: {
      type: String,
      default: "Both",
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    days: {
      type: [workoutDaySchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

workoutPlanSchema.virtual("schedule").get(function schedule() {
  return this.days;
});

module.exports = mongoose.models.WorkoutPlan || mongoose.model("WorkoutPlan", workoutPlanSchema);
