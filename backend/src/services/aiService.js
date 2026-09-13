const SYSTEM_PROMPT = `You are Strive Assistant, a supportive ChatGPT-style fitness and meal planning assistant inside the Strive web application.

Your role is to help users with workouts, home and gym exercise alternatives, exercise form, beginner fitness concerns, meal planning, basic nutrition, motivation, progress tracking, and how to use the Strive app.

Always answer the user's actual message. Use the user's context when available, including fitness goal, workout location, workout experience, target body focus, dietary preference, current exercise, and current page.

Keep answers conversational, clear, supportive, and beginner-friendly.

If the user feels scared, unsure, or intimidated by a workout, reassure them and suggest easier alternatives or modifications.

If the user asks for a home alternative, suggest exercises that can be done at home with bodyweight, dumbbells, or resistance bands.

If the user asks for a gym alternative, suggest machine-based or equipment-based exercises.

If the user asks about meals, suggest balanced and realistic food options. Prefer affordable and Filipino-friendly examples when appropriate.

Do not give medical diagnosis, treatment, or extreme diet advice.

If the user mentions pain, injury, dizziness, illness, pregnancy, eating disorder, or serious medical conditions, advise them to stop and consult a qualified healthcare professional.

If the user asks something unrelated to fitness, meals, progress, or Strive, politely redirect them back to fitness support.

Do not give long overwhelming answers. Be helpful but concise.

When helpful, format the response as a short plan with bullets or numbered steps.`;

const MAX_MESSAGE_LENGTH = 1000;
const REQUEST_TIMEOUT_MS = 25000;

const buildContextLine = (context = {}) => {
  const parts = [];
  if (context.fitnessGoal) parts.push(`Goal: ${context.fitnessGoal}`);
  if (context.workoutLocation) parts.push(`Workout location: ${context.workoutLocation}`);
  if (context.workoutExperience) parts.push(`Experience: ${context.workoutExperience}`);
  if (context.dietaryPreference) parts.push(`Dietary preference: ${context.dietaryPreference}`);
  if (context.targetBodyFocus) parts.push(`Target body focus: ${context.targetBodyFocus}`);
  if (context.currentExercise) parts.push(`Current exercise: ${context.currentExercise}`);
  if (context.currentPage) parts.push(`Current page: ${context.currentPage}`);
  return parts.length ? `\n\nUser context - ${parts.join(", ")}.` : "";
};

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

const FITNESS_KEYWORDS = /(workout|exercise|gym|home|muscle|fitness|train|rep|set|warm|stretch|cardio|strength|fat|tone|squat|lunge|plank|push|pull|glute|leg|arm|chest|back|shoulder|core|abs|run|walk|weight|diet|meal|food|protein|nutrition|calorie|progress|motivat|consistent|plan|strive|beginner|rest|recover)/;
const EXPLAIN_INTENT = /(what('?s| is| are)|meaning|define|explain|how does|tell me about)/;

const listWords = (items) => {
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(", ")}, or ${items[items.length - 1]}`;
};

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

const explainConcept = (text, context = {}) => {
  if (/calorie deficit|caloric deficit/.test(text)) {
    return [
      "A calorie deficit means you eat fewer calories than your body uses in a day.",
      "",
      "Simple example: if your body uses around 2,000 calories and you eat around 1,700 to 1,850, you are in a deficit. Over time, that can help with fat loss.",
      "",
      "For a healthy approach, keep the deficit moderate, eat enough protein, include vegetables and carbs for energy, and keep strength training so you maintain muscle.",
    ].join("\n");
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

  if (/rest day|recovery/.test(text)) {
    return "Recovery is when your body adapts to training. Rest days, sleep, protein, hydration, and lighter movement all help you get stronger without burning out.";
  }

  if (FITNESS_KEYWORDS.test(text)) {
    const goal = context.fitnessGoal ? ` For your goal of ${context.fitnessGoal},` : " In simple terms,";
    return `${goal} the key is matching your workouts, meals, and recovery to what you can repeat consistently. Ask me the specific term or exercise and I will explain it clearly.`;
  }

  return null;
};

const ruleBasedReply = (message, context = {}) => {
  const text = String(message || "").toLowerCase();
  const current = String(context.currentExercise || "").toLowerCase();
  const experience = String(context.workoutExperience || "").toLowerCase();

  // 1. Safety always comes first.
  if (/(pain|hurts?|injur|sprain|illness|sick|pregnan|dizzy|faint|chest pain|eating disorder|anorexi|bulimi|disease|medical|condition|surgery)/.test(text)) {
    return "Please stop the activity and consult a qualified healthcare professional before continuing. I can only give general fitness guidance, not medical advice.";
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
    return "Hi! I'm Strive Assistant. I can help with workouts, exercise form, home or gym alternatives, meals, progress tracking, and using Strive. What would you like help with?";
  }

  if (EXPLAIN_INTENT.test(text)) {
    const explanation = explainConcept(text, context);
    if (explanation) return explanation;
  }

  // 2a. No-equipment requests should answer with specific bodyweight options.
  if (/(no equipment|without equipment|bodyweight|no machine|no gym)/.test(text) && /(workout|exercise|routine|session|beginner|send|give|list|recommend|suggest)/.test(text)) {
    return buildNoEquipmentWorkoutReply(context);
  }

  // 2a. Build a quick workout directly when the user asks for one.
  if (/(build|make|create|give me|suggest|recommend|need|want).*(workout|routine|session|exercise plan)|what.*(train|do).*today|workout for today|quick workout|home workout|gym workout/.test(text)) {
    return buildSessionReply(context);
  }

  // 2b. Easier / modified version of an exercise.
  if (/(easier|simpler|modif|regression|less intense|beginner version|scale (it )?down|make it easier)/.test(text)) {
    const target = findAlternativeTarget(text) || findAlternativeTarget(current);
    const name = context.currentExercise || (target && target.name) || "this exercise";
    const swaps = target ? ` You can also try ${listWords(target.alts)} as gentler options.` : " You can also use a wall, chair, or just your bodyweight for support.";
    return `To make ${name} easier, reduce the range of motion, lower the reps (try 2 sets of 8), slow the tempo, and rest a little longer between sets.${swaps} Build up gradually as it starts to feel easier.`;
  }

  // 3. Alternative / "instead of" intent (uses current exercise context too).
  const wantsAlternative = /(instead of|alternative|replace|substitute|swap|at home|home version|no gym|without (a )?(machine|gym|equipment)|don'?t have|can'?t go to the gym|home option)/.test(text);
  if (wantsAlternative || (current && /(this|it|alternative|at home|home)/.test(text))) {
    const target = findAlternativeTarget(text) || findAlternativeTarget(current);
    if (target) {
      return `For a home alternative to ${target.name}, you can do ${listWords(target.alts)}. These train the same muscles without a machine. Start with 3 sets of 10 to 12 reps and move slowly with control.`;
    }
    return "For home workouts you can swap machines for bodyweight moves: bodyweight squats, step-ups, or reverse lunges for legs; glute bridges for glutes; wall push-ups or push-ups for chest; and planks or mountain climbers for core. Aim for 3 sets of 10 to 12 reps with slow, controlled form.";
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

  // 8b. "What is my workout today?" - give a direct starter plan.
  if (/(what('?s| is)?\s*(my)?\s*(workout|exercise|session|plan)\s*(today|now|for today)|today'?s\s*(workout|session|plan)|workout today)/.test(text)) {
    return `${buildSessionReply(context)}\n\nYou can also open the Workouts page for your saved session and tap any exercise for its video tutorial and alternatives.`;
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
  return "I can help with workouts, meal plans, progress tracking, and using Strive. Please ask me something related to your fitness journey.";
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
        { role: "user", content: `User context: ${JSON.stringify(context || {})}` },
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
        system: `${SYSTEM_PROMPT}${buildContextLine(context)}`,
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

  return { reply: ruleBasedReply(message, context), source: "fallback" };
};

module.exports = { getAssistantReply, ruleBasedReply, SYSTEM_PROMPT, MAX_MESSAGE_LENGTH };
