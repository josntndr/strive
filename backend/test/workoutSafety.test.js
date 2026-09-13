const test = require("node:test");
const assert = require("node:assert/strict");
const {
  attachExerciseMetadata,
  exerciseDatabase,
  estimateExerciseMinutes,
  providedExerciseCatalog,
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

    for (const exercise of days.flatMap((day) => day.exercises)) {
      assert.match(exercise.youtubeEmbedUrl, /^https:\/\/www\.youtube\.com\/embed\//, `${exercise.name} is missing a YouTube tutorial`);
      for (const alternative of exercise.alternativeExercises || []) {
        assert.match(alternative.youtubeEmbedUrl, /^https:\/\/www\.youtube\.com\/embed\//, `${alternative.name} alternative is missing a YouTube tutorial`);
      }
    }
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

test("catalog provides a YouTube tutorial for every workout exercise", () => {
  for (const exercise of Object.values(exerciseDatabase)) {
    assert.match(exercise.video.url, /^https:\/\/www\.youtube\.com\/embed\//, `${exercise.name} is missing a YouTube tutorial`);
    assert.equal(exercise.video.provider, "YouTube");
  }
});

test("user-provided exercise list is fully available in the workout catalog", () => {
  assert.equal(providedExerciseCatalog.length, 540);
  for (const exercise of providedExerciseCatalog) {
    assert.ok(exerciseDatabase[exercise.name], `${exercise.name} is missing from the workout catalog`);
    assert.match(exerciseDatabase[exercise.name].video.url, /^https:\/\/www\.youtube\.com\/embed\//);
  }
});

test("existing exercise video URLs are replaced by the catalog YouTube tutorial", () => {
  const exercise = attachExerciseMetadata({
    name: "Lat Pulldown",
    sets: 3,
    reps: "10-12 reps",
    rest: "75 seconds",
    equipment: "Lat pulldown machine",
    locationType: "Gym",
    youtubeEmbedUrl: "https://www.youtube.com/embed/AOpi-p0cJkc",
  });

  assert.equal(exercise.youtubeEmbedUrl, "https://www.youtube.com/embed/AOpi-p0cJkc");
  assert.equal(exercise.videoStatus, "verified");
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
