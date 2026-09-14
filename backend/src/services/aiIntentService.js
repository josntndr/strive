const compactText = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^\w\s?'-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const latestUserText = (history = []) =>
  (Array.isArray(history) ? history : [])
    .filter((turn) => turn?.role === "user" && typeof turn.content === "string")
    .slice(-3)
    .map((turn) => compactText(turn.content))
    .join(" ");

const detectAssistantIntent = (message, history = []) => {
  const text = compactText(message);
  const recent = latestUserText(history);
  const combined = `${recent} ${text}`.trim();

  if (!text) return { intent: "empty", text, recent, combined };
  if (/^(hi|hello|hey|yo|sup|good morning|good afternoon|good evening)\b/.test(text)) {
    return { intent: "greeting", text, recent, combined };
  }
  if (/\b(pain|hurt|hurts|injur|sprain|dizzy|faint|chest pain|sick|illness|pregnan|surgery|medical|condition)\b/.test(text)) {
    return { intent: "safety", text, recent, combined };
  }
  if (/\b(finished|done|completed|complete)\b.*\b(first|1st|second|2nd|third|3rd|exercise|set|session)\b/.test(text)) {
    return { intent: "session_progress", text, recent, combined };
  }
  if (/\b(rest|recover|break)\b.*\b(after|between|for|during)\b|\bhow long\b.*\b(rest|break|recover)\b/.test(text)) {
    return { intent: "rest_period", text, recent, combined };
  }
  if (/\b(today|now|current)\b.*\b(workout|exercise|session|plan)\b|\b(workout|exercise|session|plan)\b.*\b(today|now|current)\b/.test(text)) {
    return { intent: "current_workout", text, recent, combined };
  }
  if (/\b(today|now|current)\b.*\b(meal|eat|food|diet)\b|\b(meal|food|diet)\b.*\b(today|now|current)\b/.test(text)) {
    return { intent: "current_meal", text, recent, combined };
  }
  if (/\b(instead of|alternative|replace|substitute|swap|no equipment|without equipment|no gym|home version|home option|don'?t have)\b/.test(text)) {
    return { intent: "exercise_alternative", text, recent, combined };
  }
  if (/^(how about|what about|can i use|with)\b.*\b(dumbbell|dumbbells|barbell|bands?|machine|cable|kettlebell)\b/.test(text)) {
    return { intent: "equipment_followup", text, recent, combined };
  }
  if (/\b(workout|routine|training|exercise plan)\b.*\b(week|7 days|seven days|1 week|one week)\b|\b(week|7 days|seven days|1 week|one week)\b.*\b(workout|routine|training|exercise plan)\b/.test(text)) {
    return { intent: "weekly_workout_plan", text, recent, combined };
  }
  if (/\b(meal plan|diet plan)\b.*\b(week|7 days|seven days|1 week|one week)\b|\b(week|7 days|seven days|1 week|one week)\b.*\b(meal|food|diet)\b/.test(text)) {
    return { intent: "weekly_meal_plan", text, recent, combined };
  }
  if (/\b(meal|food|eat|diet|nutrition|protein|carb|calorie|deficit|snack|breakfast|lunch|dinner|macro)\b/.test(text)) {
    return { intent: "nutrition", text, recent, combined };
  }
  if (/\b(what is|what's|what are|what does|meaning|means|define|explain|how does|tell me about)\b/.test(text)) {
    return { intent: "concept_explanation", text, recent, combined };
  }
  if (/\b(how to|how do|proper|form|technique|perform)\b.*\b(squat|lunge|plank|push|bridge|deadlift|row|press|curl|exercise|it|this)\b/.test(text)) {
    return { intent: "exercise_form", text, recent, combined };
  }
  if (/\b(progress|track|measurement|results|photos|plateau|scale|weight)\b/.test(text)) {
    return { intent: "progress", text, recent, combined };
  }
  if (/\b(workout|exercise|gym|home|muscle|fitness|train|rep|set|warm|stretch|cardio|strength|fat loss|tone|squat|lunge|plank|push|pull|glute|leg|arm|chest|back|shoulder|core|abs|run|walk|beginner|recover|mobility)\b/.test(text)) {
    return { intent: "general_fitness", text, recent, combined };
  }

  return { intent: "out_of_scope", text, recent, combined };
};

module.exports = { compactText, detectAssistantIntent };
