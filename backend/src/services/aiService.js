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

Do not give long overwhelming answers. Be helpful but concise.`;

const MAX_MESSAGE_LENGTH = 1000;
const REQUEST_TIMEOUT_MS = 15000;

const buildContextLine = (context = {}) => {
  const parts = [];
  if (context.fitnessGoal) parts.push(`Goal: ${context.fitnessGoal}`);
  if (context.workoutLocation) parts.push(`Workout location: ${context.workoutLocation}`);
  if (context.workoutExperience) parts.push(`Experience: ${context.workoutExperience}`);
  if (context.dietaryPreference) parts.push(`Dietary preference: ${context.dietaryPreference}`);
  if (context.targetBodyFocus) parts.push(`Target body focus: ${context.targetBodyFocus}`);
  if (context.currentExercise) parts.push(`Current exercise: ${context.currentExercise}`);
  if (context.currentPage) parts.push(`Current page: ${context.currentPage}`);
  return parts.length ? `\n\nUser context — ${parts.join(", ")}.` : "";
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

const listWords = (items) => {
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(", ")}, or ${items[items.length - 1]}`;
};

const ruleBasedReply = (message, context = {}) => {
  const text = String(message || "").toLowerCase();
  const current = String(context.currentExercise || "").toLowerCase();
  const experience = String(context.workoutExperience || "").toLowerCase();
  const diet = String(context.dietaryPreference || "").toLowerCase();

  // 1. Safety always comes first.
  if (/(pain|hurts?|injur|sprain|illness|sick|pregnan|dizzy|faint|chest pain|eating disorder|anorexi|bulimi|disease|medical|condition|surgery)/.test(text)) {
    return "Please stop the activity and consult a qualified healthcare professional before continuing. I can only give general fitness guidance, not medical advice.";
  }

  // 2. Greeting.
  if (/^(hi|hello|hey|yo|sup|good (morning|afternoon|evening))\b/.test(text.trim())) {
    return "Hi! I'm Strive Assistant. I can help with workouts, exercise form, home or gym alternatives, meals, progress tracking, and using Strive. What would you like help with?";
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
    const filipino = diet.includes("filipino") ? " Filipino-style, think rice with grilled chicken, fish, or tofu plus vegetables like pinakbet or ensaladang talong." : "";
    return `For a beginner-friendly meal, try rice with chicken or fish, vegetables, and a piece of fruit. Good protein options include eggs, tuna, tofu, chicken, fish, yogurt, or milk. Keep portions reasonable and stay hydrated.${filipino}`;
  }

  // 6. Progress tracking.
  if (/(progress|track|measurement|results|photos|plateau|not seeing|scale)/.test(text)) {
    return "Track your workout consistency, completed workouts, strength improvements, energy level, weight, waist and hip measurements, and progress photos. Don't rely only on the scale — improvements in strength and energy count too.";
  }

  // 7. Schedule / how often.
  if (/(how many days|days a week|days per week|how often|schedule|routine|split|rest day)/.test(text)) {
    const base = experience.includes("inter") || experience.includes("adv") ? "4 to 5" : "3";
    return `A great starting point is ${base} days per week with rest days in between so your body can recover. Mix in some full-body or split sessions, and add more days gradually as you get stronger.`;
  }

  // 8. Motivation / consistency.
  if (/(motivat|consistent|consistency|give up|lazy|stick|habit|discourag|keep going|stay on track)/.test(text)) {
    return "Consistency beats intensity. Start small, schedule workouts like appointments, track your wins, and aim for progress not perfection. Missing one day is fine — just pick it back up the next day. You've got this!";
  }

  // 9. App usage.
  if (/(how.*(use|work|start|navigate).*(app|strive|system)|generate.*(plan|workout|meal)|where.*(find|is)|complete.*profile)/.test(text)) {
    return "In Strive: complete your profile, then generate a workout and meal plan tailored to you. Tap any exercise to see steps, a demo video or animation, setup tips, and home alternatives. Use the tracker to log workouts and the progress page to see how you're improving.";
  }

  // 10. General fitness question (keyword present) -> helpful, context-aware reply.
  if (FITNESS_KEYWORDS.test(text)) {
    const where = context.workoutLocation ? ` Since you train at ${context.workoutLocation.toLowerCase()}, I can tailor suggestions to that.` : "";
    return `I can help with that. Tell me the muscle group or exercise you're working on and I'll suggest beginner-friendly steps, form tips, or alternatives.${where} For example, ask "How do I do a squat?" or "What can I do instead of leg press at home?"`;
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
