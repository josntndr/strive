const fs = require("fs/promises");
const connectDB = require("../config/db");
const { getProfileByUserId } = require("../services/profileStore");
const FitnessProfile = require("../models/FitnessProfile");
const WorkoutPlan = require("../models/WorkoutPlan");
const MealPlan = require("../models/MealPlan");

const messages = [
  "Small progress is still progress.",
  "Consistency builds results.",
  "You showed up today. That matters.",
  "Strive for progress, not perfection.",
];

const getWorkoutStreak = (plan) => {
  if (!plan?.days?.length) return 0;
  let streak = 0;
  for (const day of plan.days) {
    if (!day.completed) break;
    streak += 1;
  }
  return streak;
};

const readJsonDb = async () => {
  await connectDB.ensureJsonDatabaseFile();
  const file = await fs.readFile(connectDB.dataFile, "utf8");
  return JSON.parse(file);
};

const getLatestPlan = (plans, userId) =>
  [...(plans || [])]
    .filter((plan) => String(plan.user) === String(userId))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] || null;

const getDashboard = async (req, res, next) => {
  try {
    if (connectDB.getDatabaseMode() === "json") {
      const db = await readJsonDb();
      const profile = await getProfileByUserId(req.user.id);
      const latestWorkoutPlan = getLatestPlan(db.workoutPlans, req.user.id);
      const latestMealPlan = getLatestPlan(db.mealPlans, req.user.id);

      const totalCompletedWorkouts = latestWorkoutPlan?.days?.filter((day) => day.completed).length || 0;
      const mealCompletionCount = latestMealPlan?.days?.filter((day) => day.completed).length || 0;

      return res.json({
        userName: req.user.fullName,
        currentFitnessGoal: profile?.fitnessGoal || null,
        latestWorkoutPlan,
        latestMealPlan,
        totalCompletedWorkouts,
        workoutStreak: getWorkoutStreak(latestWorkoutPlan),
        mealCompletionCount,
        progressSummary: profile
          ? `Your current goal is ${profile.fitnessGoal}. Keep following your plan at a steady pace.`
          : "Complete your profile to unlock personalized progress tracking.",
        motivationalMessage: messages[Math.floor(Math.random() * messages.length)],
        profile,
      });
    }

    const profile = await getProfileByUserId(req.user.id);
    const [latestWorkoutPlan, latestMealPlan] = await Promise.all([
      WorkoutPlan.findOne({ user: req.user.id, isActive: true }).sort({ createdAt: -1 }),
      MealPlan.findOne({ user: req.user.id, isActive: true }).sort({ createdAt: -1 }),
    ]);

    const totalCompletedWorkouts = latestWorkoutPlan?.days?.filter((day) => day.completed).length || 0;
    const mealCompletionCount = latestMealPlan?.days?.filter((day) => day.completed).length || 0;

    res.json({
      userName: req.user.fullName,
      currentFitnessGoal: profile?.fitnessGoal || null,
      latestWorkoutPlan,
      latestMealPlan,
      totalCompletedWorkouts,
      workoutStreak: getWorkoutStreak(latestWorkoutPlan),
      mealCompletionCount,
      progressSummary: profile
        ? `Your current goal is ${profile.fitnessGoal}. Keep following your plan at a steady pace.`
        : "Complete your profile to unlock personalized progress tracking.",
      motivationalMessage: messages[Math.floor(Math.random() * messages.length)],
      profile,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard };
