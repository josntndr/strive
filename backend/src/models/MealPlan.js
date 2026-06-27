const mongoose = require("mongoose");

const mealItemSchema = new mongoose.Schema(
  {
    type: { type: String, default: "" },
    name: { type: String, default: "" },
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
  },
  { _id: false }
);

const mealPlanDaySchema = new mongoose.Schema(
  {
    day: { type: String, required: true, trim: true },
    breakfast: { type: String, default: "" },
    lunch: { type: String, default: "" },
    snack: { type: String, default: "" },
    dinner: { type: String, default: "" },
    meals: { type: [mealItemSchema], default: [] },
    estimatedCalories: { type: Number, default: 0 },
    estimatedProtein: { type: Number, default: 0 },
    totalCalories: { type: Number, default: 0 },
    totalProtein: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
  },
  { _id: false }
);

const mealPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    planName: {
      type: String,
      default: "Meal Plan",
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    days: {
      type: [mealPlanDaySchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

module.exports = mongoose.models.MealPlan || mongoose.model("MealPlan", mealPlanSchema);
