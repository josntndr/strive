const connectDB = require("../config/db");
const WorkoutPlan = require("../models/WorkoutPlan");
const MealPlan = require("../models/MealPlan");
const { getProfileByUserId } = require("./profileStore");
const { getProgressRecordsByUserId } = require("./progressStore");
const { detectAssistantIntent } = require("./aiIntentService");

const PROFILE_CONTEXT_FIELDS = [
  "fitnessGoal",
  "workoutLocation",
  "workoutExperience",
  "dietaryPreference",
  "targetBodyFocus",
  "workoutDaysPerWeek",
  "workoutDuration",
];

const ACTIVE_WORKOUT_INTENTS = new Set([
  "current_workout",
  "session_progress",
  "exercise_alternative",
  "equipment_followup",
  "exercise_form",
  "rest_period",
  "weekly_workout_plan",
  "general_fitness",
]);

const MEAL_INTENTS = new Set(["current_meal", "weekly_meal_plan", "nutrition"]);

const compactProfileContext = (profile) => {
  if (!profile) return {};
  return PROFILE_CONTEXT_FIELDS.reduce((acc, field) => {
    if (profile[field] !== undefined && profile[field] !== "") acc[field] = profile[field];
    return acc;
  }, {});
};

const sameUser = (record, userId) => String(record?.user || "") === String(userId || "");

const sortNewest = (a, b) => new Date(b?.updatedAt || b?.createdAt || 0) - new Date(a?.updatedAt || a?.createdAt || 0);

const asPlain = (record) => {
  if (!record) return null;
  if (typeof record.toObject === "function") return record.toObject({ virtuals: true });
  return record;
};

const activeOrLatest = (items = []) =>
  [...items]
    .sort(sortNewest)
    .find((item) => item?.isActive) || [...items].sort(sortNewest)[0] || null;

const summarizeExercise = (exercise = {}) => ({
  name: exercise.name || "",
  sets: exercise.sets || "",
  reps: exercise.reps || "",
  rest: exercise.rest || "",
  equipment: exercise.equipment || "",
  targetMuscle: exercise.targetMuscle || "",
  locationType: exercise.locationType || "",
  instruction: exercise.instruction || "",
  alternatives: (exercise.alternativeExercises || [])
    .slice(0, 5)
    .map((alt) => ({
      name: alt.name || "",
      equipment: alt.equipment || "",
      locationType: alt.locationType || "",
      reason: alt.reason || "",
      youtubeEmbedUrl: alt.youtubeEmbedUrl || "",
    }))
    .filter((alt) => alt.name),
  youtubeEmbedUrl: exercise.youtubeEmbedUrl || "",
});

const summarizeWorkoutPlan = (plan) => {
  const plain = asPlain(plan);
  if (!plain) return null;
  const days = Array.isArray(plain.days) ? plain.days : [];
  const nextDay = days.find((day) => !day.completed) || days[0] || null;
  const completedDays = days.filter((day) => day.completed).length;
  const exercises = (nextDay?.exercises || []).slice(0, 10).map(summarizeExercise).filter((exercise) => exercise.name);

  return {
    planName: plain.planName || "Workout Plan",
    workoutLocation: plain.workoutLocation || "",
    isActive: Boolean(plain.isActive),
    completedDays,
    totalDays: days.length,
    todaySession: nextDay
      ? {
          day: nextDay.day || "",
          focus: nextDay.focus || "",
          completed: Boolean(nextDay.completed),
          exercises,
        }
      : null,
  };
};

const summarizeMealPlan = (plan) => {
  const plain = asPlain(plan);
  if (!plain) return null;
  const days = Array.isArray(plain.days) ? plain.days : [];
  const nextDay = days.find((day) => !day.completed) || days[0] || null;

  return {
    planName: plain.planName || "Meal Plan",
    isActive: Boolean(plain.isActive),
    completedDays: days.filter((day) => day.completed).length,
    totalDays: days.length,
    todayMeals: nextDay
      ? {
          day: nextDay.day || "",
          breakfast: nextDay.breakfast || "",
          lunch: nextDay.lunch || "",
          snack: nextDay.snack || "",
          dinner: nextDay.dinner || "",
          estimatedCalories: nextDay.estimatedCalories || nextDay.totalCalories || 0,
          estimatedProtein: nextDay.estimatedProtein || nextDay.totalProtein || 0,
        }
      : null,
  };
};

const getActiveWorkoutPlan = async (userId) => {
  if (!userId) return null;
  if (connectDB.getDatabaseMode() === "json") {
    const db = await connectDB.readDatabase();
    return summarizeWorkoutPlan(activeOrLatest((db.workoutPlans || []).filter((plan) => sameUser(plan, userId))));
  }
  return summarizeWorkoutPlan(await WorkoutPlan.findOne({ user: userId, isActive: true }).sort({ updatedAt: -1, createdAt: -1 }));
};

const getActiveMealPlan = async (userId) => {
  if (!userId) return null;
  if (connectDB.getDatabaseMode() === "json") {
    const db = await connectDB.readDatabase();
    return summarizeMealPlan(activeOrLatest((db.mealPlans || []).filter((plan) => sameUser(plan, userId))));
  }
  return summarizeMealPlan(await MealPlan.findOne({ user: userId, isActive: true }).sort({ updatedAt: -1, createdAt: -1 }));
};

const getProgressSummary = async (userId) => {
  if (!userId) return null;
  const records = await getProgressRecordsByUserId(userId);
  const latest = records?.[0];
  if (!latest) return null;
  return {
    latestWeight: latest.weight || null,
    latestWaist: latest.waistMeasurement || latest.waist || null,
    latestHips: latest.hipMeasurement || latest.hips || null,
    latestNotes: latest.notes || "",
    latestDate: latest.date || latest.createdAt || "",
    recordCount: records.length,
  };
};

const buildAssistantContext = async ({ userId, user = {}, clientContext = {}, message, history = [] }) => {
  const intent = detectAssistantIntent(message, history);
  const profile = await getProfileByUserId(userId).catch(() => null);
  const context = {
    userName: user.fullName || user.name || clientContext.userName,
    ...compactProfileContext(profile),
    ...clientContext,
    intent: intent.intent,
  };

  const tasks = [];
  if (ACTIVE_WORKOUT_INTENTS.has(intent.intent)) {
    tasks.push(
      getActiveWorkoutPlan(userId)
        .then((workout) => {
          if (workout) context.currentWorkout = workout;
        })
        .catch(() => {})
    );
  }
  if (MEAL_INTENTS.has(intent.intent)) {
    tasks.push(
      getActiveMealPlan(userId)
        .then((mealPlan) => {
          if (mealPlan) context.currentMealPlan = mealPlan;
        })
        .catch(() => {})
    );
  }
  if (intent.intent === "progress") {
    tasks.push(
      getProgressSummary(userId)
        .then((progress) => {
          if (progress) context.progress = progress;
        })
        .catch(() => {})
    );
  }

  await Promise.all(tasks);
  return context;
};

module.exports = {
  buildAssistantContext,
  compactProfileContext,
  summarizeWorkoutPlan,
  summarizeMealPlan,
};
