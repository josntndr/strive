const test = require("node:test");
const assert = require("node:assert/strict");
const {
  attachExerciseMetadata,
  estimateExerciseMinutes,
  validateWorkoutPlan,
} = require("../src/services/workoutSafety");
const { _test } = require("../src/controllers/workoutController");

const baseProfile = {
  fitnessGoal: "Build muscle",
  workoutExperience: "Beginner",
  workoutLocation: "Gym",
  workoutDaysPerWeek: 3,
  workoutDuration: 60,
  targetBodyFocus: "Full body",
};

test("generated sessions pass safety validation for core focuses", () => {
  for (const focus of ["Full Body", "Upper Body", "Lower Body", "Glutes & Legs", "Core", "Cardio"]) {
    const days = _test.buildSessionDays(baseProfile, focus, 6);
    const result = validateWorkoutPlan({ workoutLocation: "Gym", days });
    assert.equal(result.valid, true, `${focus}: ${result.issues.join("; ")}`);
  }
});

test("profile-based weekly plan passes safety validation", () => {
  const days = _test.generateWorkoutDays(baseProfile);
  const result = validateWorkoutPlan({ workoutLocation: "Gym", days });
  assert.equal(result.valid, true, result.issues.join("; "));
});

test("duration exercises are labeled as duration and estimated from minutes", () => {
  const exercise = attachExerciseMetadata({
    name: "Treadmill Incline Walk",
    sets: 1,
    reps: "20 minutes",
    rest: "As needed",
    equipment: "Treadmill",
    locationType: "Gym",
  });

  assert.equal(exercise.prescriptionType, "duration");
  assert.equal(exercise.targetUnitLabel, "Duration");
  assert.equal(estimateExerciseMinutes(exercise), 20);
});

test("unverified videos are removed instead of embedded", () => {
  const exercise = attachExerciseMetadata({
    name: "Lat Pulldown",
    sets: 3,
    reps: "10-12 reps",
    rest: "75 seconds",
    equipment: "Lat pulldown machine",
    locationType: "Gym",
    youtubeEmbedUrl: "https://www.youtube.com/embed/AOpi-p0cJkc",
  });

  assert.equal(exercise.youtubeEmbedUrl, "");
  assert.equal(exercise.videoStatus, "unavailable");
});

test("validator catches duplicate exercises", () => {
  const result = validateWorkoutPlan({
    workoutLocation: "Home",
    days: [
      {
        day: "Day 1",
        focus: "Lower Body",
        workoutLocation: "Home",
        exercises: [
          { name: "Bodyweight Squats", sets: 3, reps: "10-12 reps", rest: "60 seconds", equipment: "Bodyweight", locationType: "Home" },
          { name: "Bodyweight Squat", sets: 3, reps: "10-12 reps", rest: "60 seconds", equipment: "Bodyweight", locationType: "Home" },
        ],
      },
    ],
  });

  assert.equal(result.valid, false);
  assert.ok(result.issues.some((issue) => issue.includes("duplicate exercise Bodyweight Squats")));
});
