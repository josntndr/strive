const test = require("node:test");
const assert = require("node:assert/strict");
const {
  attachExerciseMetadata,
  exerciseDatabase,
  estimateExerciseMinutes,
  providedExerciseCatalog,
  validateWorkoutPlan,
} = require("../src/services/workoutSafety");
const { getAssistantReply, ruleBasedReply } = require("../src/services/aiService");
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

test("assistant fallback gives a contextual workout session", () => {
  const reply = ruleBasedReply("What should I train today?", {
    workoutLocation: "Home",
    workoutExperience: "Beginner",
    targetBodyFocus: "Glutes and legs",
  });

  assert.match(reply, /simple home session/);
  assert.match(reply, /Bodyweight Squats/);
  assert.match(reply, /Glute Bridges/);
  assert.doesNotMatch(reply, /Head to the Workouts page/);
});

test("assistant fallback answers no-equipment beginner workout requests", () => {
  const reply = ruleBasedReply("Can you send me at least 5 beginner workouts without equipment?", {
    workoutExperience: "Beginner",
  });

  assert.match(reply, /5 beginner-friendly no-equipment workouts/);
  assert.match(reply, /Bodyweight squats/);
  assert.match(reply, /Forearm plank/);
});

test("assistant fallback answers one-week workout requests with a weekly plan", () => {
  const reply = ruleBasedReply("how about a 1 week workout", {
    workoutLocation: "Home",
    workoutExperience: "Beginner",
  });

  assert.match(reply, /1-week workout plan/);
  assert.match(reply, /Day 1/);
  assert.match(reply, /Day 7/);
  assert.doesNotMatch(reply, /here are 5 beginner-friendly no-equipment workouts/);
});

test("assistant fallback gives practical meal guidance", () => {
  const reply = ruleBasedReply("What should I eat after a workout?", {
    fitnessGoal: "Build muscle",
    dietaryPreference: "Filipino",
  });

  assert.match(reply, /protein source/);
  assert.match(reply, /chicken adobo|tofu sisig|grilled fish/);
  assert.match(reply, /consistency/);
});

test("assistant fallback answers one-week meal plan requests with a full plan", () => {
  const reply = ruleBasedReply("how about a meal plan good for 1 week", {
    fitnessGoal: "Lose fat",
  });

  assert.match(reply, /1-week/);
  assert.match(reply, /Day 1/);
  assert.match(reply, /Day 7/);
  assert.doesNotMatch(reply, /For a balanced meal, build your plate/);
});

test("assistant fallback explains calorie deficit directly", () => {
  const reply = ruleBasedReply("What is calorie deficit?");

  assert.match(reply, /eat fewer calories than your body uses/);
  assert.match(reply, /fat loss/);
  assert.doesNotMatch(reply, /Tell me the exercise or muscle group/);
});

test("assistant fallback explains what-does questions directly", () => {
  const reply = ruleBasedReply("what does calorie deficit mean?");

  assert.match(reply, /eat fewer calories than your body uses/);
  assert.doesNotMatch(reply, /I hear you/);
});

test("assistant fallback uses recent context for short follow-up questions", () => {
  const reply = ruleBasedReply("what does that mean?", {}, [
    { role: "user", content: "how about a meal for calorie deficit" },
    { role: "assistant", content: "A meal can support a calorie deficit." },
  ]);

  assert.match(reply, /eat fewer calories than your body uses/);
});

test("assistant fallback defines workout instead of generating one for definition questions", () => {
  const reply = ruleBasedReply("what is workout");

  assert.match(reply, /planned training session/);
  assert.match(reply, /exercises, sets, reps, and rest periods/);
  assert.doesNotMatch(reply, /here are 5 beginner-friendly/);
});

test("assistant fallback still answers today's workout as a session", () => {
  const reply = ruleBasedReply("what is my workout today?", {
    workoutLocation: "Home",
    workoutExperience: "Beginner",
  });

  assert.match(reply, /do not see a saved workout session/);
  assert.doesNotMatch(reply, /simple home session/);
});

test("assistant fallback greets like a personal assistant", () => {
  const reply = ruleBasedReply("hello?", {
    userName: "Josephine Santander",
  });

  assert.match(reply, /Hey Josephine, I'm here/);
  assert.doesNotMatch(reply, /Direct answer/);
});

test("assistant fallback avoids robotic catch-all wording", () => {
  const reply = ruleBasedReply("can you help me?");

  assert.match(reply, /I hear you/);
  assert.doesNotMatch(reply, /Direct answer/);
});

test("assistant fallback answers rest timing instead of form for squat rest questions", () => {
  const reply = ruleBasedReply("How long should I rest after squats?");

  assert.match(reply, /60-90 seconds/);
  assert.match(reply, /breathing and form/);
  assert.doesNotMatch(reply, /Here's how to do/);
});

test("assistant fallback uses saved workout context for today's workout", () => {
  const reply = ruleBasedReply("what is my workout today?", {
    currentWorkout: {
      todaySession: {
        day: "Day 2",
        focus: "Upper Body",
        exercises: [
          { name: "Lat Pulldown Machine", sets: 3, reps: "10-12 reps", rest: "75 seconds" },
          { name: "Chest Press Machine", sets: 3, reps: "10-12 reps", rest: "75 seconds" },
        ],
      },
    },
  });

  assert.match(reply, /Day 2 - Upper Body/);
  assert.match(reply, /Lat Pulldown Machine/);
  assert.match(reply, /Chest Press Machine/);
  assert.doesNotMatch(reply, /do not see a saved workout/);
});

test("assistant fallback guides the next saved exercise after progress follow-up", () => {
  const reply = ruleBasedReply("I finished the first exercise", {
    currentWorkout: {
      todaySession: {
        exercises: [
          { name: "Bodyweight Squats", sets: 3, reps: "10 reps", rest: "60 seconds" },
          { name: "Glute Bridges", sets: 3, reps: "12 reps", rest: "60 seconds", instruction: "Squeeze your glutes at the top." },
        ],
      },
    },
  });

  assert.match(reply, /next exercise is Glute Bridges/);
  assert.match(reply, /Squeeze your glutes/);
});

test("assistant fallback handles push-up replacement directly", () => {
  const reply = ruleBasedReply("Can I replace push-ups?");

  assert.match(reply, /Wall push-ups/);
  assert.match(reply, /Dumbbell floor press/);
  assert.doesNotMatch(reply, /Tell me the exact exercise/);
});

test("assistant fallback handles knee pain during lunges safely and specifically", () => {
  const reply = ruleBasedReply("My knee hurts during lunges.");

  assert.match(reply, /Stop lunges/);
  assert.match(reply, /Glute bridges/);
  assert.match(reply, /physiotherapist|clinician/);
});

test("assistant fallback treats dumbbells as a contextual follow-up", () => {
  const reply = ruleBasedReply("How about dumbbells?", {}, [
    { role: "user", content: "Can I replace leg press with something at home?" },
    { role: "assistant", content: "Bodyweight squats can work." },
  ]);

  assert.match(reply, /dumbbells work/);
  assert.match(reply, /Goblet squat/);
});

test("assistant fallback asks one clarifier for unclear equipment follow-up", () => {
  const reply = ruleBasedReply("How about dumbbells?");

  assert.match(reply, /workout plan, or replacing a specific exercise/);
  assert.doesNotMatch(reply, /here are 5 beginner-friendly/);
});

test("assistant fallback redirects unrelated requests politely", () => {
  const reply = ruleBasedReply("Can you write my programming assignment?");

  assert.match(reply, /training, meals, recovery, progress, or using Strive/);
  assert.doesNotMatch(reply, /workout plan/);
});

test("assistant service requires a real AI provider instead of using fallback", async () => {
  const oldOpenAIKey = process.env.OPENAI_API_KEY;
  const oldAnthropicKey = process.env.ANTHROPIC_API_KEY;
  const oldProvider = process.env.AI_PROVIDER;

  delete process.env.OPENAI_API_KEY;
  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.AI_PROVIDER;

  try {
    await assert.rejects(
      () => getAssistantReply({ message: "What does calorie deficit mean?" }),
      /OpenAI API key is not configured/
    );
  } finally {
    if (oldOpenAIKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = oldOpenAIKey;
    if (oldAnthropicKey === undefined) delete process.env.ANTHROPIC_API_KEY;
    else process.env.ANTHROPIC_API_KEY = oldAnthropicKey;
    if (oldProvider === undefined) delete process.env.AI_PROVIDER;
    else process.env.AI_PROVIDER = oldProvider;
  }
});
