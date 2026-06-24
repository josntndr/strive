const User = require("../models/User");
const FitnessProfile = require("../models/FitnessProfile");
const WorkoutPlan = require("../models/WorkoutPlan");
const MealPlan = require("../models/MealPlan");

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
    const users = await User.find()
      .select("fullName email role createdAt updatedAt")
      .sort({ createdAt: -1 });

    res.json({ users });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAnalytics, getUsers };
