export type LocalAssistantContext = {
  fitnessGoal?: string;
  workoutLocation?: string;
  workoutExperience?: string;
  dietaryPreference?: string;
  targetBodyFocus?: string;
  currentExercise?: string;
  currentPage?: string;
};

const has = (text: string, pattern: RegExp) => pattern.test(text);

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

export const getLocalAssistantReply = (message: string, context: LocalAssistantContext = {}) => {
  const text = message.toLowerCase();
  const beginner = !context.workoutExperience || String(context.workoutExperience).toLowerCase().includes("begin");

  if (has(text, /pain|injur|dizzy|faint|chest pain|pregnan|medical|surgery|illness/)) {
    return "Please stop the activity and check with a qualified healthcare professional before continuing. I can help with general fitness guidance, but not medical diagnosis or treatment.";
  }

  if (has(text, /no equipment|without equipment|bodyweight|at home|home workout/) && has(text, /workout|exercise|beginner|send|give|list|routine/)) {
    return noEquipmentWorkout(beginner);
  }

  if (has(text, /instead of|alternative|replace|substitute|swap/)) {
    return alternativeReply(text);
  }

  if (has(text, /meal|food|eat|protein|breakfast|lunch|dinner|snack|nutrition/)) {
    return mealReply(context);
  }

  if (has(text, /workout|routine|train|exercise|today/)) {
    return noEquipmentWorkout(beginner);
  }

  return "I can help with workouts, exercise form, alternatives, meals, and progress tracking. Ask me the exercise, goal, or equipment you have, and I will give you a practical answer.";
};
