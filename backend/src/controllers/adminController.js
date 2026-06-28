const fs = require("fs/promises");
const connectDB = require("../config/db");
const User = require("../models/User");
const FitnessProfile = require("../models/FitnessProfile");
const WorkoutPlan = require("../models/WorkoutPlan");
const MealPlan = require("../models/MealPlan");

const readJsonDb = () => connectDB.readDatabase();

const getGoalStats = async () => {
  const stats = await FitnessProfile.aggregate([
    { $group: { _id: "$fitnessGoal", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  return stats.map((item) => ({
    goal: item._id || "Unknown",
    count: item.count,
    _count: { goal: item.count },
  }));
};

const getAnalytics = async (req, res, next) => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 30);

    if (connectDB.getDatabaseMode() === "json") {
      const db = await readJsonDb();
      const goalCounts = {};
      (db.fitnessProfiles || []).forEach((p) => {
        const goal = p.fitnessGoal || "Unknown";
        goalCounts[goal] = (goalCounts[goal] || 0) + 1;
      });
      const goalStats = Object.entries(goalCounts)
        .map(([goal, count]) => ({ goal, count, _count: { goal: count } }))
        .sort((a, b) => b.count - a.count);
      const activeUsers = (db.users || []).filter((u) => u.updatedAt && new Date(u.updatedAt) >= since).length;

      return res.json({
        totalUsers: (db.users || []).length,
        totalWorkoutPlans: (db.workoutPlans || []).length,
        totalMealPlans: (db.mealPlans || []).length,
        mostSelectedFitnessGoals: goalStats,
        goalStats,
        activeUsers,
      });
    }

    const [totalUsers, totalWorkoutPlans, totalMealPlans, goalStats, activeUsers] = await Promise.all([
      User.countDocuments(),
      WorkoutPlan.countDocuments(),
      MealPlan.countDocuments(),
      getGoalStats(),
      User.countDocuments({ updatedAt: { $gte: since } }),
    ]);

    res.json({
      totalUsers,
      totalWorkoutPlans,
      totalMealPlans,
      mostSelectedFitnessGoals: goalStats,
      goalStats,
      activeUsers,
    });
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    if (connectDB.getDatabaseMode() === "json") {
      const db = await readJsonDb();
      const users = (db.users || [])
        .map((u) => ({ _id: u._id, fullName: u.fullName, email: u.email, role: u.role, createdAt: u.createdAt, updatedAt: u.updatedAt }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return res.json({ users });
    }

    const users = await User.find()
      .select("fullName email role createdAt updatedAt")
      .sort({ createdAt: -1 });

    res.json({ users });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAnalytics, getUsers };
