const { getAssistantReply, ruleBasedReply, MAX_MESSAGE_LENGTH } = require("../services/aiService");
const { getProfileByUserId } = require("../services/profileStore");

const PROFILE_CONTEXT_FIELDS = [
  "fitnessGoal",
  "workoutLocation",
  "workoutExperience",
  "dietaryPreference",
  "targetBodyFocus",
];

const compactProfileContext = (profile) => {
  if (!profile) return {};
  return PROFILE_CONTEXT_FIELDS.reduce((acc, field) => {
    if (profile[field]) acc[field] = profile[field];
    return acc;
  }, {});
};

const chat = async (req, res) => {
  const { message, context, history } = req.body || {};

  if (typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ message: "Message is required." });
  }

  const trimmed = message.trim().slice(0, MAX_MESSAGE_LENGTH);
  const safeContext = context && typeof context === "object" ? context : {};
  const safeHistory = Array.isArray(history) ? history : [];

  try {
    let profileContext = {};
    try {
      profileContext = compactProfileContext(await getProfileByUserId(req.user?._id || req.user?.id));
    } catch {
      profileContext = {};
    }

    const { reply, source } = await getAssistantReply({
      message: trimmed,
      context: {
        userName: req.user?.fullName || req.user?.name || safeContext.userName,
        ...profileContext,
        ...safeContext,
      },
      history: safeHistory,
    });
    return res.json({ reply, source });
  } catch (error) {
    // Never crash the chat - return a helpful fallback reply instead.
    console.error("AI chat error:", error.message);
    return res.json({ reply: ruleBasedReply(trimmed, safeContext, safeHistory), source: "fallback" });
  }
};

module.exports = { chat };
