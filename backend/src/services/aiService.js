const { detectAssistantIntent } = require("./aiIntentService");

const SYSTEM_PROMPT = `You are Strive Assistant, a ChatGPT-like personal fitness assistant inside the Strive web application.

Your role is to help users with workouts, exercise form, home and gym alternatives, sets, reps, rest, tempo, recovery, meal planning, basic nutrition, weight management, progress tracking, and how to use Strive.

Always answer the user's actual question first. Read the full sentence, recent history, and relevant Strive context before responding. Do not answer a different saved template just because one keyword appears.

Use relevant user context when available: profile, workout location, experience, goals, dietary preference, current page, current exercise, saved workout plan, saved meal plan, and progress records. Never invent user data.

Keep answers conversational, direct, supportive, and beginner-friendly. Adjust length to the question: short questions can get short answers; plan requests can get structured plans.

Use conversation context for follow-ups such as "this", "that", "second one", or "how about dumbbells?" If the reference is unclear, ask one concise clarifying question and still offer a useful next step.

If the user asks for alternatives, match the same movement pattern and muscles when possible, and consider equipment, location, difficulty, goal, and limitations.

If the user asks about meals, suggest balanced and realistic food options. Prefer affordable and Filipino-friendly examples when appropriate.

Do not give medical diagnosis, treatment, or extreme diet advice.

If the user mentions pain, injury, dizziness, illness, pregnancy, eating disorder, or serious medical conditions, advise them to stop the painful activity and consult a qualified healthcare professional when severe, sharp, recurring, or unclear.

If the user asks something unrelated to fitness, meals, progress, or Strive, politely redirect them back to fitness support.

Do not give long overwhelming answers. Be helpful but concise.

When helpful, format the response as a short plan with bullets or numbered steps.`;

const MAX_MESSAGE_LENGTH = 1000;
const REQUEST_TIMEOUT_MS = 25000;

const buildContextLine = (context = {}) => {
  const parts = [];
  if (context.userName) parts.push(`User name: ${context.userName}`);
  if (context.fitnessGoal) parts.push(`Goal: ${context.fitnessGoal}`);
  if (context.workoutLocation) parts.push(`Workout location: ${context.workoutLocation}`);
  if (context.workoutExperience) parts.push(`Experience: ${context.workoutExperience}`);
  if (context.dietaryPreference) parts.push(`Dietary preference: ${context.dietaryPreference}`);
  if (context.targetBodyFocus) parts.push(`Target body focus: ${context.targetBodyFocus}`);
  if (context.currentExercise) parts.push(`Current exercise: ${context.currentExercise}`);
  if (context.currentPage) parts.push(`Current page: ${context.currentPage}`);
  if (context.intent) parts.push(`Detected intent: ${context.intent}`);
  return parts.length ? `\n\nUser context - ${parts.join(", ")}.` : "";
};

const buildStructuredContext = (context = {}) =>
  JSON.stringify(
    {
      profile: {
        userName: context.userName,
        fitnessGoal: context.fitnessGoal,
        workoutLocation: context.workoutLocation,
        workoutExperience: context.workoutExperience,
        dietaryPreference: context.dietaryPreference,
        targetBodyFocus: context.targetBodyFocus,
        workoutDaysPerWeek: context.workoutDaysPerWeek,
        workoutDuration: context.workoutDuration,
      },
      page: context.currentPage,
      currentExercise: context.currentExercise,
      intent: context.intent,
      currentWorkout: context.currentWorkout,
      currentMealPlan: context.currentMealPlan,
      progress: context.progress,
    },
    null,
    2
  );

// --- Rule-based fallback ------------------------------------------------------

// Gym exercise -> beginner-friendly home alternatives.
const ALT_MAP = [
  { keys: ["leg press"], name: "Leg Press", alts: ["Bodyweight Squats", "Step-ups", "Reverse Lunges"] },
  { keys: ["hip thrust"], name: "Hip Thrust Machine", alts: ["Glute Bridges", "Bodyweight Hip Thrust"] },
  { keys: ["cable kickback", "kickback"], name: "Cable Kickbacks", alts: ["Side-Lying Leg Raises", "Glute Bridges"] },
  { keys: ["lat pulldown", "pulldown"], name: "Lat Pulldown", alts: ["Resistance Band Rows", "Dumbbell Rows"] },
  { keys: ["seated row", "cable row"], name: "Seated Row", alts: ["Resistance Band Rows", "Dumbbell Rows"] },
  { keys: ["chest press", "bench press"], name: "Chest Press", alts: ["Wall Push-ups", "Push-ups"] },
  { keys: ["shoulder press", "overhead press"], name: "Shoulder Press", alts: ["Dumbbell Shoulder Press", "Pike Push-ups"] },
  { keys: ["leg extension"], name: "Leg Extension", alts: ["Step-ups", "Bodyweight Squats"] },
  { keys: ["hamstring curl", "leg curl"], name: "Hamstring Curl", alts: ["Dumbbell Romanian Deadlift", "Glute Bridges"] },
  { keys: ["abductor"], name: "Abductor Machine", alts: ["Side-Lying Leg Raises", "Band Lateral Walks"] },
  { keys: ["tricep", "pushdown"], name: "Tricep Pushdown", alts: ["Chair Dips", "Close-Grip Wall Push-ups"] },
  { keys: ["bicep curl", "bicep"], name: "Bicep Curl", alts: ["Resistance Band Curls", "Water Bottle Curls"] },
];

const findAlternativeTarget = (text) => {
  for (const entry of ALT_MAP) {
    if (entry.keys.some((k) => text.includes(k))) return entry;
  }
  return null;
};

const FITNESS_KEYWORDS = /(workout|exercise|gym|home|muscle|fitness|train|rep|set|warm|stretch|cardio|strength|fat|tone|squat|lunge|plank|push|pull|glute|leg|arm|chest|back|shoulder|core|abs|run|walk|weight|diet|meal|food|protein|nutrition|calorie|deficit|progress|motivat|consistent|plan|strive|beginner|rest|recover)/;
const EXPLAIN_INTENT = /(what('?s| is| are| does)|meaning|means?\b|define|explain|how does|tell me about)/;

const listWords = (items) => {
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(", ")}, or ${items[items.length - 1]}`;
};

const firstName = (name) => String(name || "").trim().split(/\s+/)[0] || "";

const greetingReply = (context = {}) => {
  const name = firstName(context.userName);
  const opener = name ? `Hey ${name}, I'm here.` : "Hey, I'm here.";

  return `${opener} What would you like help with today: workouts, meals, form, progress, or recovery?`;
};

const recentUserText = (history = []) =>
  (Array.isArray(history) ? history : [])
    .filter((m) => m?.role === "user" && typeof m.content === "string")
    .slice(-3)
    .map((m) => m.content.toLowerCase())
    .join(" ");

const getTrainingContext = (context = {}) => {
  const location = String(context.workoutLocation || "").toLowerCase().includes("gym") ? "gym" : "home";
  const experience = String(context.workoutExperience || "beginner").toLowerCase();
  const focus = String(context.targetBodyFocus || context.fitnessGoal || "full body").toLowerCase();
  const beginner = !experience || experience.includes("begin");

  return {
    location,
    beginner,
    focus,
    sets: beginner ? 2 : 3,
    reps: beginner ? "8-10" : "10-12",
    rest: beginner ? "75-90 seconds" : "60-75 seconds",
  };
};

const buildSessionReply = (context = {}) => {
  const plan = getTrainingContext(context);
  const lower = plan.location === "gym"
    ? ["Leg Press Machine", "Hip Thrust Machine", "Seated Hamstring Curl", "Cable Pallof Press"]
    : ["Bodyweight Squats", "Glute Bridges", "Reverse Lunges", "Dead Bug"];
  const upper = plan.location === "gym"
    ? ["Lat Pulldown Machine", "Chest Press Machine", "Seated Cable Row", "Cable Tricep Pushdown"]
    : ["Incline Push-ups", "Resistance Band Rows", "Dumbbell Shoulder Press", "Plank Shoulder Taps"];
  const full = plan.focus.includes("leg") || plan.focus.includes("glute")
    ? lower
    : plan.focus.includes("upper") || plan.focus.includes("arm") || plan.focus.includes("chest") || plan.focus.includes("back")
      ? upper
      : [lower[0], upper[0], lower[1], upper[1], "Plank"];

  return [
    `Here is a simple ${plan.location} session matched to your profile:`,
    ...full.map((exercise, index) => `${index + 1}. ${exercise} - ${plan.sets} sets of ${plan.reps} reps`),
    `Rest ${plan.rest} between sets. Start lighter than you think, keep every rep controlled, and stop if anything feels sharp or painful.`,
  ].join("\n");
};

const buildNoEquipmentWorkoutReply = (context = {}) => {
  const plan = getTrainingContext(context);
  const rounds = plan.beginner ? "2 rounds" : "3 rounds";

  return [
    `Yes - here are 5 ${plan.beginner ? "beginner-friendly" : "simple"} no-equipment workouts you can do at home. Do ${rounds}, resting 45-75 seconds between moves:`,
    "1. Bodyweight squats - 10 to 12 reps",
    "2. Glute bridges - 12 to 15 reps",
    "3. Incline or wall push-ups - 8 to 10 reps",
    "4. Reverse lunges - 8 reps each leg",
    "5. Forearm plank - 20 to 30 seconds",
    "Move slowly, keep your breathing steady, and stop if anything feels sharp or painful.",
  ].join("\n");
};

const buildWeeklyWorkoutPlanReply = (context = {}) => {
  const plan = getTrainingContext(context);
  const home = plan.location !== "gym";
  const level = plan.beginner ? "beginner-friendly" : "balanced";
  const lowerStrength = home
    ? "Bodyweight squats, reverse lunges, glute bridges, calf raises"
    : "Leg press, hip thrust machine, hamstring curl, calf raises";
  const upperStrength = home
    ? "Incline push-ups, resistance band rows, shoulder taps, plank"
    : "Chest press, lat pulldown, seated row, cable tricep pushdown";
  const fullBody = home
    ? "Squats, push-ups, glute bridges, dead bug, plank"
    : "Goblet squat, chest press, lat pulldown, cable Pallof press, treadmill walk";

  return [
    `Absolutely. Here is a ${level} 1-week workout plan for ${plan.location} training:`,
    "",
    `Day 1 - Full body: ${fullBody}. Do ${plan.sets} sets of ${plan.reps} reps.`,
    "Day 2 - Recovery: 20-30 minutes easy walking plus light stretching.",
    `Day 3 - Lower body and glutes: ${lowerStrength}. Do ${plan.sets} sets of ${plan.reps} reps.`,
    "Day 4 - Rest or mobility: hip circles, hamstring stretch, shoulder rolls, and easy walking.",
    `Day 5 - Upper body and core: ${upperStrength}. Do ${plan.sets} sets of ${plan.reps} reps.`,
    "Day 6 - Light cardio: 20-30 minutes brisk walk, bike, or treadmill at a comfortable pace.",
    "Day 7 - Rest: focus on sleep, hydration, and preparing for next week.",
    "",
    `Keep rests around ${plan.rest}. If a set feels too hard, reduce reps first before forcing form.`,
  ].join("\n");
};

const buildMealReply = (message, context = {}) => {
  const goal = String(context.fitnessGoal || "").toLowerCase();
  const diet = String(context.dietaryPreference || "").toLowerCase();
  const proteinFocus = /protein|muscle|bulk|gain|build/.test(message) || /muscle|build|gain/.test(goal);
  const fatLoss = /calorie deficit|lose|fat|cut|weight loss/.test(message) || /lose|fat|cut/.test(goal);
  const filipino = diet.includes("filipino");

  const plate = fatLoss
    ? "half vegetables, one palm of protein, and one cupped-hand portion of rice or carbs"
    : "one palm of protein, one fist of carbs, vegetables, and a little healthy fat";
  const examples = filipino
    ? "Examples: chicken adobo with rice and vegetables, tuna with egg and rice, tofu sisig with vegetables, or grilled fish with saba and greens."
    : "Examples: eggs and toast, chicken rice bowl, tuna sandwich, Greek yogurt with fruit, tofu bowl, or fish with potatoes and vegetables.";
  const protein = proteinFocus ? " Aim for a protein source at each meal so recovery is easier." : "";

  return `A good Strive-style meal is simple: ${plate}.${protein}\n${examples}\nKeep water nearby and avoid extreme restrictions - consistency matters more than perfect eating.`;
};

const buildWeeklyMealPlanReply = (message, context = {}) => {
  const goal = String(context.fitnessGoal || message || "").toLowerCase();
  const deficit = /deficit|lose|fat|cut|weight loss/.test(goal);
  const intro = deficit
    ? "Absolutely. Here is a simple 1-week calorie-deficit meal plan that still keeps protein high:"
    : "Absolutely. Here is a simple balanced 1-week meal plan:";
  const note = deficit
    ? "Keep portions moderate: use 1 palm of protein, plenty of vegetables, and a smaller serving of rice or carbs at each main meal."
    : "Adjust portions up or down based on hunger, training days, and your goal.";

  return [
    intro,
    "",
    "Day 1: Eggs with toast | Chicken rice bowl | Greek yogurt with fruit | Fish with vegetables",
    "Day 2: Oats with milk and banana | Tuna sandwich | Apple with peanut butter | Chicken adobo with vegetables",
    "Day 3: Yogurt, fruit, and nuts | Tofu rice bowl | Boiled eggs | Grilled fish with rice and greens",
    "Day 4: Scrambled eggs and fruit | Chicken salad wrap | Cottage cheese or yogurt | Lean beef or tofu with vegetables",
    "Day 5: Oatmeal with protein | Tuna rice bowl | Banana | Chicken breast with sweet potato and vegetables",
    "Day 6: Egg sandwich | Fish or tofu bowl | Yogurt | Turkey, chicken, or tofu stir-fry",
    "Day 7: Omelet with vegetables | Chicken or tuna salad | Fruit | Grilled fish, tofu, or chicken with vegetables",
    "",
    note,
  ].join("\n");
};

const buildCurrentWorkoutReply = (context = {}) => {
  const session = context.currentWorkout?.todaySession;
  if (!session?.exercises?.length) {
    return "I do not see a saved workout session in your Strive account yet. If you want, I can make a beginner session now, or you can generate a plan from the Workouts page.";
  }

  return [
    `Today in your saved Strive plan: ${session.day || "Next session"} - ${session.focus || "Workout"}.`,
    "",
    ...session.exercises.slice(0, 8).map((exercise, index) => {
      const sets = exercise.sets ? `${exercise.sets} sets` : "sets as listed";
      const reps = exercise.reps ? ` x ${exercise.reps}` : "";
      const rest = exercise.rest ? `, rest ${exercise.rest}` : "";
      return `${index + 1}. ${exercise.name} - ${sets}${reps}${rest}`;
    }),
    "",
    "Start with the first exercise, keep the pace controlled, and use the exercise tutorial button if you need a form check.",
  ].join("\n");
};

const buildCurrentMealReply = (context = {}) => {
  const meals = context.currentMealPlan?.todayMeals;
  if (!meals) {
    return "I do not see a saved meal plan in your Strive account yet. A simple balanced plate is protein, vegetables, a carb source, and water.";
  }

  const details = [
    meals.breakfast && `Breakfast: ${meals.breakfast}`,
    meals.lunch && `Lunch: ${meals.lunch}`,
    meals.snack && `Snack: ${meals.snack}`,
    meals.dinner && `Dinner: ${meals.dinner}`,
  ].filter(Boolean);

  return [
    `For ${meals.day || "today"}, your saved Strive meal plan is:`,
    ...details,
    meals.estimatedCalories ? `Estimated calories: ${meals.estimatedCalories}` : "",
    meals.estimatedProtein ? `Estimated protein: ${meals.estimatedProtein}g` : "",
  ]
    .filter(Boolean)
    .join("\n");
};

const buildNextExerciseReply = (context = {}) => {
  const exercises = context.currentWorkout?.todaySession?.exercises || [];
  if (exercises.length < 2) {
    return "Nice work finishing that. I do not see the next saved exercise here, so take 60-90 seconds, breathe, and check your Workouts page for the next move.";
  }

  const next = exercises[1];
  return [
    `Nice work. Your next exercise is ${next.name}.`,
    `${next.sets || 3} sets${next.reps ? ` of ${next.reps}` : ""}${next.rest ? `, resting ${next.rest}` : ""}.`,
    next.instruction ? `Form cue: ${next.instruction}` : "Keep the reps controlled and stop if anything feels sharp or painful.",
  ].join("\n");
};

const buildRestReply = (text, context = {}) => {
  const sessionExercise = (context.currentWorkout?.todaySession?.exercises || []).find((exercise) =>
    text.includes(String(exercise.name || "").toLowerCase())
  );
  const rest = sessionExercise?.rest;
  const namedExercise = sessionExercise?.name || context.currentExercise || (text.match(/squat|lunge|push.?up|plank|press|row|deadlift|curl|bridge/) || [])[0];

  if (rest) {
    return `For ${sessionExercise.name}, use the rest listed in your Strive plan: ${rest}. If your breathing is still heavy or your form would break, take another 15-30 seconds.`;
  }

  if (/squat|leg press|lunge|deadlift|hip thrust|lower/.test(text)) {
    return `For ${namedExercise || "lower-body strength work"}, rest about 60-90 seconds between beginner sets. Use 90-120 seconds if the set feels heavy, and start the next set only when your breathing and form feel steady.`;
  }

  if (/plank|core|abs/.test(text)) {
    return "For core work, rest about 30-60 seconds between sets. If your hips start sagging or your lower back takes over, rest longer or shorten the next hold.";
  }

  return "For most beginner strength exercises, rest 60-90 seconds between sets. For lighter cardio or mobility, rest as needed; for heavier sets, 90-120 seconds is reasonable.";
};

const buildPushupAlternativeReply = () =>
  [
    "Yes. If push-ups are too hard or uncomfortable, use one of these swaps:",
    "1. Wall push-ups - easiest option",
    "2. Incline push-ups on a bench or table - still trains chest, shoulders, and triceps",
    "3. Knee push-ups - good if wrists feel okay",
    "4. Dumbbell floor press - best if you have dumbbells",
    "",
    "Pick the version where you can do 8-12 controlled reps without pain.",
  ].join("\n");

const buildKneeLungeReply = () =>
  [
    "Stop lunges for now if your knee hurts during the movement.",
    "",
    "Try this instead today:",
    "1. Glute bridges - 2-3 sets of 12-15",
    "2. Box squats to a chair - 2-3 sets of 8-10",
    "3. Step-ups only if pain-free - low height, slow control",
    "",
    "Avoid pushing through sharp pain, swelling, or pain that changes how you walk. If it keeps happening, get checked by a physiotherapist or qualified clinician.",
  ].join("\n");

const buildEquipmentFollowupReply = (text, context = {}, history = []) => {
  const previous = recentUserText(history);
  const contextText = `${previous} ${String(context.currentExercise || "")}`.toLowerCase();
  const equipment = text.match(/dumbbells?|barbells?|bands?|machines?|cables?|kettlebells?/)?.[0] || "that equipment";

  if (/workout|routine|plan|exercise|alternative|replace|swap|instead/.test(contextText)) {
    if (/dumbbell/.test(equipment)) {
      return [
        "Yes, dumbbells work well. For a beginner-friendly swap, choose:",
        "1. Goblet squat for legs",
        "2. Dumbbell floor press for chest",
        "3. One-arm dumbbell row for back",
        "4. Dumbbell Romanian deadlift for hamstrings and glutes",
        "",
        "Use 2-3 sets of 8-12 reps and choose a weight you can control with clean form.",
      ].join("\n");
    }
    return `Yes, ${equipment} can work. Tell me the exercise you are replacing, and I will match it to the same muscles and difficulty.`;
  }

  return `Do you mean using ${equipment} for a workout plan, or replacing a specific exercise? Tell me the exercise or goal and I will give you the best option.`;
};

const explainConcept = (text, context = {}) => {
  if (/\bworkout\b/.test(text)) {
    return [
      "A workout is a planned training session made of exercises, sets, reps, and rest periods.",
      "",
      "Example: a beginner full-body workout might include squats, push-ups, rows, glute bridges, and planks. The goal is to train your body safely and consistently, not to exhaust yourself every time.",
    ].join("\n");
  }

  if (/\bexercise\b/.test(text)) {
    return "An exercise is one specific movement used in a workout, like a squat, push-up, plank, row, or glute bridge. A workout is the full session; exercises are the pieces inside it.";
  }

  if (/calorie deficit|caloric deficit/.test(text)) {
    return [
      "A calorie deficit means you eat fewer calories than your body uses in a day.",
      "",
      "Simple example: if your body uses around 2,000 calories and you eat around 1,700 to 1,850, you are in a deficit. Over time, that can help with fat loss.",
      "",
      "For a healthy approach, keep the deficit moderate, eat enough protein, include vegetables and carbs for energy, and keep strength training so you maintain muscle.",
    ].join("\n");
  }

  if (/\bcalorie\b/.test(text)) {
    return "A calorie is a unit of energy from food and drinks. Your body uses calories to move, think, breathe, recover, and train. Eating more than you use tends to increase weight; eating less than you use tends to reduce weight.";
  }

  if (/protein/.test(text)) {
    return "Protein helps repair muscle, supports recovery, and keeps you full. Good beginner-friendly sources include eggs, chicken, fish, tuna, tofu, beans, yogurt, milk, and lean meat.";
  }

  if (/carb|carbohydrate/.test(text)) {
    return "Carbs are your body's quick training fuel. Rice, oats, potatoes, fruit, bread, and pasta can all fit in a healthy plan. The goal is choosing portions that match your activity and fitness goal.";
  }

  if (/progressive overload/.test(text)) {
    return "Progressive overload means gradually making training a little more challenging so your body adapts. You can add reps, add weight, improve control, increase range of motion, or reduce rest slightly.";
  }

  if (/hypertrophy|build muscle|muscle growth/.test(text)) {
    return "Hypertrophy means muscle growth. The basics are consistent strength training, enough challenging sets, good form, enough protein, and recovery. Most muscle-building sets should feel hard but still controlled.";
  }

  if (/macro|macros/.test(text)) {
    return "Macros are protein, carbohydrates, and fats. Protein supports muscle repair, carbs fuel training, and fats support hormones and general health. Calories decide weight change; macros help shape how you feel and perform.";
  }

  if (/bmi/.test(text)) {
    return "BMI is a height-to-weight screening number. It can be useful as a rough population tool, but it does not show muscle mass, body composition, strength, or health by itself.";
  }

  if (/warm.?up/.test(text)) {
    return "A good warm-up raises your heart rate and prepares the joints you will train. Try 3 to 5 minutes of easy movement, then 1 to 2 light sets of your first exercise before working harder.";
  }

  if (/\bset\b|\brep\b|repetition/.test(text)) {
    return "A rep is one complete movement, like one squat. A set is a group of reps done together, like 10 squats. So 3 sets of 10 reps means you do 10 reps, rest, then repeat that two more times.";
  }

  if (/cardio/.test(text)) {
    return "Cardio is training that raises your heart rate for a sustained period. Walking, running, cycling, dancing, jump rope, and treadmill work are common examples. It supports heart health, endurance, and calorie burn.";
  }

  if (/strength training|weight training|resistance training/.test(text)) {
    return "Strength training means using resistance to make muscles stronger. That resistance can be your bodyweight, dumbbells, bands, machines, barbells, or cables.";
  }

  if (/rest day|recovery/.test(text)) {
    return "Recovery is when your body adapts to training. Rest days, sleep, protein, hydration, and lighter movement all help you get stronger without burning out.";
  }

  if (FITNESS_KEYWORDS.test(text)) {
    const goal = context.fitnessGoal ? ` For your goal of ${context.fitnessGoal},` : " In simple terms,";
    return `${goal} the answer is to keep the basics aligned: train consistently, eat in a way that supports your goal, recover well, and make small progress over time.`;
  }

  return null;
};

const ruleBasedReply = (message, context = {}, history = []) => {
  const text = String(message || "").toLowerCase();
  const detected = detectAssistantIntent(message, history);
  const intent = context.intent || detected.intent;
  const previousText = recentUserText(history);
  const conceptText = /(it|that|this|mean|means|explain)/.test(text) && previousText
    ? `${previousText} ${text}`
    : text;
  const current = String(context.currentExercise || "").toLowerCase();
  const experience = String(context.workoutExperience || "").toLowerCase();

  // 1. Safety always comes first.
  if (/(knee|knees).*(pain|hurt|hurts)|(?:pain|hurt|hurts).*(knee|knees)/.test(text) && /lunge|squat|leg|step/.test(text)) {
    return buildKneeLungeReply();
  }

  if (/(pain|hurts?|injur|sprain|illness|sick|pregnan|dizzy|faint|chest pain|eating disorder|anorexi|bulimi|disease|medical|condition|surgery)/.test(text)) {
    return "Stop the activity for now, especially if the pain is sharp, recurring, or changes how you move. I can give general fitness guidance, but a qualified healthcare professional should check pain, injury, dizziness, illness, pregnancy-related concerns, or medical conditions.";
  }

  // 1b. Fear / nervousness / low confidence - reassure supportively first.
  if (/(afraid|scared|nervous|anxious|intimidat|worried|unsure|doubt|embarrass|can'?t do (this|it)|not strong enough|too weak)/.test(text)) {
    const ex = current
      ? ` For ${context.currentExercise}, begin with fewer reps or an easier variation and focus on slow, controlled form.`
      : "";
    return `That's completely okay - feeling nervous is normal and everyone starts somewhere. Go at your own pace, breathe, and you can stop or rest any time. Start with a lighter version and build up as you get comfortable.${ex} I can suggest easier alternatives whenever you'd like.`;
  }

  // 2. Greeting.
  if (/^(hi|hello|hey|yo|sup|good (morning|afternoon|evening))\b/.test(text.trim())) {
    return greetingReply(context);
  }

  if (intent === "session_progress") {
    return buildNextExerciseReply(context);
  }

  if (intent === "rest_period") {
    return buildRestReply(text, context);
  }

  // 2a. "What is my workout today?" is asking for a plan, not a definition.
  if (/(what('?s| is)?\s*(my)?\s*(workout|exercise|session|plan)\s*(today|now|for today)|today'?s\s*(workout|session|plan)|workout today)/.test(text)) {
    return buildCurrentWorkoutReply(context);
  }

  if (intent === "current_meal") {
    return buildCurrentMealReply(context);
  }

  if (intent === "equipment_followup") {
    return buildEquipmentFollowupReply(text, context, history);
  }

  if (EXPLAIN_INTENT.test(text)) {
    const explanation = explainConcept(conceptText, context);
    if (explanation) return explanation;
  }

  if (/(workout|routine|training|exercise plan).*(week|7 days|seven days|1 week|one week)|(week|7 days|seven days|1 week|one week).*(workout|routine|training|exercise plan)/.test(text)) {
    return buildWeeklyWorkoutPlanReply(context);
  }

  // 2b. No-equipment requests should answer with specific bodyweight options.
  if (/(no equipment|without equipment|bodyweight|no machine|no gym)/.test(text) && /(workout|exercise|routine|session|beginner|send|give|list|recommend|suggest)/.test(text)) {
    return buildNoEquipmentWorkoutReply(context);
  }

  // 2c. Build a quick workout directly when the user asks for one.
  if (/(build|make|create|give me|suggest|recommend|need|want).*(workout|routine|session|exercise plan)|what.*(train|do).*today|workout for today|quick workout|home workout|gym workout/.test(text)) {
    return buildSessionReply(context);
  }

  // 2d. Easier / modified version of an exercise.
  if (/(easier|simpler|modif|regression|less intense|beginner version|scale (it )?down|make it easier)/.test(text)) {
    const target = findAlternativeTarget(text) || findAlternativeTarget(current);
    const name = context.currentExercise || (target && target.name) || "this exercise";
    const swaps = target ? ` You can also try ${listWords(target.alts)} as gentler options.` : " You can also use a wall, chair, or just your bodyweight for support.";
    return `To make ${name} easier, reduce the range of motion, lower the reps (try 2 sets of 8), slow the tempo, and rest a little longer between sets.${swaps} Build up gradually as it starts to feel easier.`;
  }

  // 3. Alternative / "instead of" intent (uses current exercise context too).
  const wantsAlternative = /(instead of|alternative|replace|substitute|swap|at home|home version|no gym|without (a )?(machine|gym|equipment)|don'?t have|can'?t go to the gym|home option)/.test(text);
  if (wantsAlternative || (current && /(this|it|alternative|at home|home)/.test(text))) {
    if (/push.?ups?/.test(text) || /push.?ups?/.test(current)) {
      return buildPushupAlternativeReply();
    }

    const sessionExercises = context.currentWorkout?.todaySession?.exercises || [];
    const matchedCurrent = sessionExercises.find((exercise) => {
      const name = String(exercise.name || "").toLowerCase();
      return name && (text.includes(name) || current.includes(name));
    });
    const verifiedAlternatives = matchedCurrent?.alternatives || [];
    if (verifiedAlternatives.length) {
      return [
        `For ${matchedCurrent.name}, the closest Strive alternatives are:`,
        ...verifiedAlternatives.slice(0, 4).map((alt, index) => `${index + 1}. ${alt.name}${alt.equipment ? ` (${alt.equipment})` : ""}${alt.reason ? ` - ${alt.reason}` : ""}`),
        "",
        "Choose the one that matches your equipment and feels pain-free.",
      ].join("\n");
    }

    const target = findAlternativeTarget(text) || findAlternativeTarget(current);
    if (target) {
      return `For a home alternative to ${target.name}, you can do ${listWords(target.alts)}. These train the same muscles without a machine. Start with 3 sets of 10 to 12 reps and move slowly with control.`;
    }
    return "Tell me the exact exercise you want to replace and what equipment you have. I can match the same muscles and difficulty instead of guessing.";
  }

  // 4. Exercise form / how-to.
  if (/(how (do|to)|proper|form|technique|perform).*(squat|lunge|plank|push.?up|bridge|deadlift|row|press|curl|exercise|it|this)/.test(text) || /how (do|to) (i )?(do|perform)/.test(text)) {
    const named = current || (text.match(/(squat|lunge|plank|push.?up|glute bridge|deadlift|row|press|curl)/) || [])[0] || "this exercise";
    const beginnerNote = experience.includes("begin") || !experience
      ? " If you're just starting out, reduce the range of motion and build up slowly."
      : "";
    return `Here's how to do ${named}: 1) Set up with good posture and a stable base. 2) Move through the full range slowly, keeping your core tight and joints aligned. 3) Breathe out on the effort and control the way back. Safety: stop if you feel sharp pain and keep your back neutral.${beginnerNote}`;
  }

  // 5. Meals / nutrition.
  if (/(meal|food|eat|diet|nutrition|protein|carb|calorie|snack|breakfast|lunch|dinner|recipe)/.test(text)) {
    if (/(meal\s*plan|plan).*(week|7 days|seven days)|week.*meal|1 week|one week/.test(text)) {
      return buildWeeklyMealPlanReply(text, context);
    }
    if (/protein/.test(text)) {
      return "Protein helps repair and build muscle and keeps you full. Beginner-friendly sources include eggs, chicken, fish, tuna, tofu, beans, yogurt, and milk. Try to include some protein in each meal.";
    }
    return buildMealReply(text, context);
  }

  // 6. Progress tracking.
  if (/(progress|track|measurement|results|photos|plateau|not seeing|scale)/.test(text)) {
    return "Track your workout consistency, completed workouts, strength improvements, energy level, weight, waist and hip measurements, and progress photos. Do not rely only on the scale - improvements in strength and energy count too.";
  }

  // 7. Schedule / how often.
  if (/(how many days|days a week|days per week|how often|schedule|routine|split|rest day)/.test(text)) {
    const base = experience.includes("inter") || experience.includes("adv") ? "4 to 5" : "3";
    return `A great starting point is ${base} days per week with rest days in between so your body can recover. Mix in some full-body or split sessions, and add more days gradually as you get stronger.`;
  }

  // 7b. Skipping a session / rest days.
  if (/(skip|rest day|day off|too tired|don'?t feel like|not feeling it|take a break|miss(ing)? (a )?(day|workout)|can i skip)/.test(text)) {
    return "It's okay to take a rest day when your body needs it - recovery is part of progress. If you're just feeling unmotivated, try a shorter or lighter session instead of skipping entirely. One missed day will not undo your progress; just pick it back up tomorrow.";
  }

  // 8. Motivation / consistency.
  if (/(motivat|consistent|consistency|give up|lazy|stick|habit|discourag|keep going|stay on track)/.test(text)) {
    return "Consistency beats intensity. Start small, schedule workouts like appointments, track your wins, and aim for progress not perfection. Missing one day is fine - just pick it back up the next day. You've got this!";
  }

  // 9. App usage.
  if (/(how.*(use|work|start|navigate).*(app|strive|system)|generate.*(plan|workout|meal)|where.*(find|is)|complete.*profile)/.test(text)) {
    return "In Strive: complete your profile, then generate a workout and meal plan tailored to you. Tap any exercise to see steps, a demo video or animation, setup tips, and home alternatives. Use the tracker to log workouts and the progress page to see how you're improving.";
  }

  // 10. General fitness question (keyword present) -> helpful, context-aware reply.
  if (FITNESS_KEYWORDS.test(text)) {
    const where = context.workoutLocation ? ` Since you train at ${context.workoutLocation.toLowerCase()}, I can tailor suggestions to that.` : "";
    const plan = getTrainingContext(context);
    return `I can help with that.${where} For a quick starting point, use ${plan.sets} sets of ${plan.reps} reps, rest ${plan.rest}, and keep the movement slow and controlled. Tell me the exercise or muscle group and I will make it more specific.`;
  }

  // 11. Unrelated -> polite redirect.
  return "I hear you. I can help best when your question is about training, meals, recovery, progress, or using Strive. Ask it naturally and I will give you the most useful next step.";
};

// --- Real AI providers (key stays on the backend) -----------------------------

// Normalize prior turns into clean {role, content} pairs for the LLM.
const normalizeHistory = (history = []) =>
  (Array.isArray(history) ? history : [])
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .slice(-10)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_LENGTH) }));

// Lazily create a single OpenAI client. The key is read only from the
// environment and never logged or returned to the frontend.
let openaiClient = null;
const getOpenAIClient = () => {
  if (!openaiClient) {
    const OpenAI = require("openai");
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
};

const callOpenAI = async ({ message, context, history = [] }) => {
  const client = getOpenAIClient();

  const completion = await client.chat.completions.create(
    {
      model: process.env.AI_MODEL || "gpt-4o-mini",
      temperature: 0.7,
      max_tokens: 400,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "system",
          content: `Relevant Strive context for this user only. Use it when helpful and say when data is missing:\n${buildStructuredContext(context || {})}`,
        },
        ...normalizeHistory(history).slice(-8),
        { role: "user", content: message },
      ],
    },
    { timeout: REQUEST_TIMEOUT_MS }
  );

  const reply = completion.choices?.[0]?.message?.content?.trim();
  if (!reply) throw new Error("Empty OpenAI response");
  return reply;
};

const callAnthropic = async ({ message, context, history = [] }) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  // Anthropic requires the first message to be from the user, so drop any
  // leading assistant turns.
  let turns = normalizeHistory(history);
  while (turns.length && turns[0].role === "assistant") turns = turns.slice(1);

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: process.env.AI_MODEL || "claude-haiku-4-5-20251001",
        max_tokens: 400,
        system: `${SYSTEM_PROMPT}${buildContextLine(context)}\n\nRelevant Strive context for this user only:\n${buildStructuredContext(context || {})}`,
        messages: [...turns, { role: "user", content: message }],
      }),
    });

    if (!response.ok) throw new Error(`Anthropic responded with ${response.status}`);
    const data = await response.json();
    const reply = data?.content?.[0]?.text?.trim();
    if (!reply) throw new Error("Empty Anthropic response");
    return reply;
  } finally {
    clearTimeout(timeout);
  }
};

// Pick a provider: an explicit AI_PROVIDER wins, otherwise auto-detect from
// whichever API key is present. So adding just a key is enough to go live.
const resolveProvider = () => {
  const explicit = (process.env.AI_PROVIDER || "").toLowerCase();
  if (explicit === "openai" && process.env.OPENAI_API_KEY) return "openai";
  if (explicit === "anthropic" && process.env.ANTHROPIC_API_KEY) return "anthropic";
  if (!explicit) {
    if (process.env.ANTHROPIC_API_KEY) return "anthropic";
    if (process.env.OPENAI_API_KEY) return "openai";
  }
  return "";
};

/**
 * Returns { reply, source }. Uses a configured AI provider when an API key is
 * present (with conversation history for natural multi-turn chat), and always
 * falls back to the rule-based assistant on any failure so the chat never crashes.
 */
const getAssistantReply = async ({ message, context = {}, history = [] }) => {
  const provider = resolveProvider();

  try {
    if (provider === "openai") {
      return { reply: await callOpenAI({ message, context, history }), source: "openai" };
    }
    if (provider === "anthropic") {
      return { reply: await callAnthropic({ message, context, history }), source: "anthropic" };
    }
  } catch (error) {
    // Fall through to the rule-based assistant on any provider error.
    console.warn("AI provider failed, using rule-based fallback:", error.message);
  }

  return { reply: ruleBasedReply(message, context, history), source: "fallback" };
};

module.exports = { getAssistantReply, ruleBasedReply, SYSTEM_PROMPT, MAX_MESSAGE_LENGTH };
