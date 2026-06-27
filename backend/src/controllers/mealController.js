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

const highProteinMeals = [
  {
    breakfast: ["Eggs, chicken tapa, and rice", 520, 40],
    lunch: ["Grilled chicken breast, rice, and vegetables", 640, 52],
    snack: ["Greek yogurt and boiled eggs", 260, 24],
    dinner: ["Bangus, rice, and pinakbet", 600, 46],
  },
  {
    breakfast: ["Tuna and egg scramble with rice", 500, 38],
    lunch: ["Beef and broccoli with rice", 660, 48],
    snack: ["Milk or protein shake", 220, 25],
    dinner: ["Chicken adobo with rice", 620, 50],
  },
];

const budgetMeals = [
  {
    breakfast: ["Egg and garlic fried rice", 380, 14],
    lunch: ["Monggo with malunggay and rice", 480, 20],
    snack: ["Banana and peanuts", 200, 8],
    dinner: ["Sardines with rice and kangkong", 470, 24],
  },
  {
    breakfast: ["Oatmeal with banana", 350, 10],
    lunch: ["Tortang talong with rice", 470, 16],
    snack: ["Boiled saba banana", 160, 2],
    dinner: ["Tofu and egg with rice", 460, 22],
  },
];

const lowSugarMeals = [
  {
    breakfast: ["Eggs and sauteed vegetables", 320, 20],
    lunch: ["Grilled chicken and green salad", 480, 42],
    snack: ["Boiled eggs and nuts", 220, 14],
    dinner: ["Baked fish with vegetables", 430, 38],
  },
  {
    breakfast: ["Vegetable omelet", 300, 18],
    lunch: ["Tuna salad with olive oil", 460, 36],
    snack: ["Unsweetened yogurt", 150, 15],
    dinner: ["Chicken and steamed vegetables", 450, 40],
  },
];

const filipinoMeals = [
  {
    breakfast: ["Tapsilog (tapa, egg, rice)", 560, 30],
    lunch: ["Chicken adobo with rice and vegetables", 640, 42],
    snack: ["Fresh mango", 180, 3],
    dinner: ["Sinigang na isda with rice", 540, 34],
  },
  {
    breakfast: ["Longsilog (longganisa, egg, rice)", 580, 26],
    lunch: ["Pork giniling with rice and carrots", 620, 36],
    snack: ["Saba banana and peanuts", 210, 6],
    dinner: ["Tinolang manok with rice", 560, 40],
  },
];

const chooseMeals = (preference) => {
  const value = (preference || "").toLowerCase();
  if (value.includes("vegetarian")) return vegetarianMeals;
  if (value.includes("filipino")) return filipinoMeals;
  if (value.includes("high") && value.includes("protein")) return highProteinMeals;
  if (value.includes("budget")) return budgetMeals;
  if (value.includes("low") && value.includes("sugar")) return lowSugarMeals;
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
  return { type, name, calories, protein, completed: false };
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
