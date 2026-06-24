const fs = require("fs/promises");
const { randomUUID } = require("crypto");
const connectDB = require("../config/db");
const { getProfileByUserId } = require("../services/profileStore");
const MealPlan = require("../models/MealPlan");

const balancedMeals = [
  {
    breakfast: ["Oatmeal with banana and milk", 420, 18],
    lunch: ["Chicken adobo, rice, and vegetables", 620, 42],
    snack: ["Yogurt with fruit", 220, 12],
    dinner: ["Grilled fish, rice, and pinakbet", 560, 38],
  },
  {
    breakfast: ["Eggs, pandesal, and fruit", 430, 22],
    lunch: ["Tuna rice bowl with cucumber", 540, 36],
    snack: ["Milk and banana", 210, 10],
    dinner: ["Chicken tinola with rice", 560, 40],
  },
  {
    breakfast: ["Oatmeal with peanut butter and fruit", 460, 20],
    lunch: ["Sardines with rice and vegetables", 560, 34],
    snack: ["Boiled eggs", 160, 12],
    dinner: ["Tofu and vegetable stir-fry with rice", 520, 28],
  },
];

const vegetarianMeals = [
  {
    breakfast: ["Oatmeal with milk and mango", 420, 16],
    lunch: ["Tofu sisig bowl with rice and vegetables", 610, 32],
    snack: ["Yogurt and fruit", 220, 12],
    dinner: ["Monggo with malunggay and rice", 540, 30],
  },
  {
    breakfast: ["Egg and vegetable omelet with rice", 430, 24],
    lunch: ["Vegetable curry with tofu and rice", 590, 30],
    snack: ["Milk and banana", 210, 10],
    dinner: ["Chopsuey with tofu and rice", 500, 26],
  },
];

const chooseMeals = (preference) => {
  const value = (preference || "").toLowerCase();
  if (value.includes("vegetarian")) return vegetarianMeals;
  return balancedMeals;
};

const adjustForGoal = (meal, goal) => {
  const value = (goal || "").toLowerCase();
  if (value.includes("gain") || value.includes("muscle")) {
    return [meal[0], meal[1] + 80, meal[2] + 8];
  }
  if (value.includes("lose") || value.includes("fat")) {
    return [meal[0], Math.max(meal[1] - 70, 150), meal[2]];
  }
  return meal;
};

const buildMeal = (type, mealTuple, goal) => {
  const [name, calories, protein] = adjustForGoal(mealTuple, goal);
  return { type, name, calories, protein };
};

const generateMealDays = (profile) => {
  const mealTemplates = chooseMeals(profile.dietaryPreference);

  return Array.from({ length: 7 }, (_, index) => {
    const template = mealTemplates[index % mealTemplates.length];
    const meals = [
      buildMeal("Breakfast", template.breakfast, profile.fitnessGoal),
      buildMeal("Lunch", template.lunch, profile.fitnessGoal),
      buildMeal("Snack", template.snack, profile.fitnessGoal),
      buildMeal("Dinner", template.dinner, profile.fitnessGoal),
    ];
    const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
    const totalProtein = meals.reduce((sum, meal) => sum + meal.protein, 0);

    return {
      day: `Day ${index + 1}`,
      breakfast: meals[0].name,
      lunch: meals[1].name,
      snack: meals[2].name,
      dinner: meals[3].name,
      meals,
      estimatedCalories: totalCalories,
      estimatedProtein: totalProtein,
      totalCalories,
      totalProtein,
      completed: false,
    };
  });
};

const readJsonDb = async () => {
  await connectDB.ensureJsonDatabaseFile();
  const file = await fs.readFile(connectDB.dataFile, "utf8");
  return JSON.parse(file);
};

const writeJsonDb = async (db) => {
  await fs.writeFile(connectDB.dataFile, JSON.stringify(db, null, 2));
};

const generateMealPlan = async (req, res, next) => {
  try {
    const profile = await getProfileByUserId(req.user.id);
    if (!profile) return res.status(400).json({ message: "Create your fitness profile before generating a meal plan." });

    if (connectDB.getDatabaseMode() === "json") {
      const db = await readJsonDb();
      const now = new Date().toISOString();

      db.mealPlans = db.mealPlans.map((plan) =>
        String(plan.user) === String(req.user.id) ? { ...plan, isActive: false, updatedAt: now } : plan
      );

      const mealPlan = {
        _id: randomUUID(),
        user: String(req.user.id),
        planName: "Meal Plan",
        days: generateMealDays(profile),
        isActive: true,
        createdAt: now,
        updatedAt: now,
      };

      db.mealPlans.push(mealPlan);
      await writeJsonDb(db);

      return res.status(201).json({
        message: "Meal plan generated successfully.",
        mealPlan,
        plan: mealPlan,
      });
    }

    await MealPlan.updateMany({ user: req.user.id }, { $set: { isActive: false } });
    const mealPlan = await MealPlan.create({
      user: req.user.id,
      days: generateMealDays(profile),
      isActive: true,
    });

    res.status(201).json({
      message: "Meal plan generated successfully.",
      mealPlan,
      plan: mealPlan,
    });
  } catch (error) {
    next(error);
  }
};

const getMealPlans = async (req, res, next) => {
  try {
    if (connectDB.getDatabaseMode() === "json") {
      const db = await readJsonDb();
      const plans = db.mealPlans.filter((plan) => String(plan.user) === String(req.user.id)).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return res.json(plans);
    }

    const plans = await MealPlan.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(plans);
  } catch (error) {
    next(error);
  }
};

const updateMealPlan = async (req, res, next) => {
  try {
    if (connectDB.getDatabaseMode() === "json") {
      const db = await readJsonDb();
      const index = db.mealPlans.findIndex((plan) => String(plan._id) === String(req.params.id) && String(plan.user) === String(req.user.id));
      if (index === -1) return res.status(404).json({ message: "Meal plan not found." });

      db.mealPlans[index] = { ...db.mealPlans[index], ...req.body, updatedAt: new Date().toISOString() };
      await writeJsonDb(db);
      return res.json({ message: "Meal plan updated successfully.", mealPlan: db.mealPlans[index] });
    }

    const plan = await MealPlan.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!plan) return res.status(404).json({ message: "Meal plan not found." });
    res.json({ message: "Meal plan updated successfully.", mealPlan: plan });
  } catch (error) {
    next(error);
  }
};

const deleteMealPlan = async (req, res, next) => {
  try {
    if (connectDB.getDatabaseMode() === "json") {
      const db = await readJsonDb();
      const before = db.mealPlans.length;
      db.mealPlans = db.mealPlans.filter((plan) => !(String(plan._id) === String(req.params.id) && String(plan.user) === String(req.user.id)));
      if (db.mealPlans.length === before) return res.status(404).json({ message: "Meal plan not found." });
      await writeJsonDb(db);
      return res.json({ message: "Meal plan deleted successfully." });
    }

    const plan = await MealPlan.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!plan) return res.status(404).json({ message: "Meal plan not found." });
    res.json({ message: "Meal plan deleted successfully." });
  } catch (error) {
    next(error);
  }
};

module.exports = { generateMealPlan, getMealPlans, updateMealPlan, deleteMealPlan };
