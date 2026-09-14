export type LocalAssistantContext = {
  userName?: string;
  fitnessGoal?: string;
  workoutLocation?: string;
  workoutExperience?: string;
  dietaryPreference?: string;
  targetBodyFocus?: string;
  currentExercise?: string;
  currentPage?: string;
};

export type LocalAssistantMessage = {
  role: "user" | "assistant";
  content: string;
};

const has = (text: string, pattern: RegExp) => pattern.test(text);

const firstName = (name?: string) => String(name || "").trim().split(/\s+/)[0] || "";

const greetingReply = (context: LocalAssistantContext) => {
  const name = firstName(context.userName);
  const opener = name ? `Hey ${name}, I'm here.` : "Hey, I'm here.";

  return `${opener} What would you like help with today: workouts, meals, form, progress, or recovery?`;
};

const recentUserText = (history: LocalAssistantMessage[] = []) =>
  history
    .filter((m) => m.role === "user" && typeof m.content === "string")
    .slice(-3)
    .map((m) => m.content.toLowerCase())
    .join(" ");

const noEquipmentWorkout = (beginner: boolean) => {
  const sets = beginner ? "2 rounds" : "3 rounds";
  return [
    `Yes - here are 5 beginner-friendly no-equipment workouts you can do at home. Do ${sets}, resting 45-75 seconds between moves:`,
    "1. Bodyweight squats - 10 to 12 reps",
    "2. Glute bridges - 12 to 15 reps",
    "3. Incline or wall push-ups - 8 to 10 reps",
    "4. Reverse lunges - 8 reps each leg",
    "5. Forearm plank - 20 to 30 seconds",
    "Move slowly, keep your breathing steady, and stop if anything feels sharp or painful.",
  ].join("\n");
};

const mealReply = (context: LocalAssistantContext) => {
  const filipino = String(context.dietaryPreference || "").toLowerCase().includes("filipino");
  const examples = filipino
    ? "chicken adobo with rice and vegetables, tuna with egg and rice, tofu sisig, or grilled fish with vegetables"
    : "eggs and toast, chicken rice bowl, tuna sandwich, tofu bowl, Greek yogurt with fruit, or fish with potatoes";

  return `For a balanced meal, build your plate around protein, carbs, vegetables, and water.\nGood options: ${examples}.\nKeep it realistic and repeatable - that is what makes progress easier.`;
};

const weeklyMealPlanReply = (message: string, context: LocalAssistantContext) => {
  const goal = `${context.fitnessGoal || ""} ${message}`.toLowerCase();
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

const explainConcept = (text: string) => {
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
    return "Protein helps repair muscle, supports recovery, and keeps you full. Good options include eggs, chicken, fish, tuna, tofu, beans, yogurt, milk, and lean meat.";
  }

  if (/carb|carbohydrate/.test(text)) {
    return "Carbs are your body's quick training fuel. Rice, oats, potatoes, fruit, bread, and pasta can all fit in a healthy plan when portions match your goal.";
  }

  if (/macro|macros/.test(text)) {
    return "Macros are protein, carbohydrates, and fats. Protein supports muscle repair, carbs fuel training, and fats support hormones and general health.";
  }

  if (/progressive overload/.test(text)) {
    return "Progressive overload means gradually making training more challenging by adding reps, adding weight, improving control, increasing range of motion, or reducing rest slightly.";
  }

  if (/hypertrophy|build muscle|muscle growth/.test(text)) {
    return "Hypertrophy means muscle growth. The basics are consistent strength training, enough challenging sets, good form, enough protein, and recovery.";
  }

  if (/\bset\b|\brep\b|repetition/.test(text)) {
    return "A rep is one complete movement, like one squat. A set is a group of reps done together, like 10 squats. So 3 sets of 10 reps means you do 10 reps, rest, then repeat that two more times.";
  }

  if (/cardio/.test(text)) {
    return "Cardio is training that raises your heart rate for a sustained period. Walking, running, cycling, dancing, jump rope, and treadmill work are common examples.";
  }

  if (/strength training|weight training|resistance training/.test(text)) {
    return "Strength training means using resistance to make muscles stronger. That resistance can be your bodyweight, dumbbells, bands, machines, barbells, or cables.";
  }

  return null;
};

const alternativeReply = (text: string) => {
  if (text.includes("leg press")) {
    return "For leg press without a machine, use bodyweight squats, step-ups, reverse lunges, or glute bridges. Start with 2 to 3 sets of 10 to 12 reps and keep the movement controlled.";
  }
  if (text.includes("lat pulldown")) {
    return "For lat pulldown without a machine, try resistance band rows, towel rows, dumbbell rows, or assisted pull-up progressions. Keep your shoulders down and pull with your back, not just your arms.";
  }
  if (text.includes("chest press") || text.includes("bench press")) {
    return "For chest press without equipment, use wall push-ups, incline push-ups, knee push-ups, or regular push-ups. Keep your body in a straight line and lower with control.";
  }

  return "Tell me the exercise you want to replace and what equipment you have. I can suggest a home, gym, or no-equipment alternative that trains the same muscles.";
};

export const getLocalAssistantReply = (
  message: string,
  context: LocalAssistantContext = {},
  history: LocalAssistantMessage[] = []
) => {
  const text = message.toLowerCase();
  const previousText = recentUserText(history);
  const conceptText = /(it|that|this|mean|means|explain)/.test(text) && previousText
    ? `${previousText} ${text}`
    : text;
  const beginner = !context.workoutExperience || String(context.workoutExperience).toLowerCase().includes("begin");

  if (has(text, /pain|injur|dizzy|faint|chest pain|pregnan|medical|surgery|illness/)) {
    return "Please stop the activity and check with a qualified healthcare professional before continuing. I can help with general fitness guidance, but not medical diagnosis or treatment.";
  }

  if (has(text.trim(), /^(hi|hello|hey|yo|sup|good (morning|afternoon|evening))\b/)) {
    return greetingReply(context);
  }

  if (has(text, /what('?s| is)?\s*(my)?\s*(workout|exercise|session|plan)\s*(today|now|for today)|today'?s\s*(workout|session|plan)|workout today/)) {
    return noEquipmentWorkout(beginner);
  }

  if (has(text, /what('?s| is| are| does)|meaning|means?\b|define|explain|how does|tell me about/)) {
    const explanation = explainConcept(conceptText);
    if (explanation) return explanation;
  }

  if (has(text, /no equipment|without equipment|bodyweight|at home|home workout/) && has(text, /workout|exercise|beginner|send|give|list|routine/)) {
    return noEquipmentWorkout(beginner);
  }

  if (has(text, /instead of|alternative|replace|substitute|swap/)) {
    return alternativeReply(text);
  }

  if (has(text, /meal|food|eat|protein|breakfast|lunch|dinner|snack|nutrition/)) {
    if (has(text, /(meal\s*plan|plan).*(week|7 days|seven days)|week.*meal|1 week|one week/)) {
      return weeklyMealPlanReply(text, context);
    }
    return mealReply(context);
  }

  if (has(text, /workout|routine|train|exercise|today/)) {
    return noEquipmentWorkout(beginner);
  }

  return "I hear you. I can help best when your question is about training, meals, recovery, progress, or using Strive. Ask it naturally and I will give you the most useful next step.";
};
