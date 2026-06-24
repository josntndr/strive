const { getAssistantReply, ruleBasedReply, MAX_MESSAGE_LENGTH } = require("../services/aiService");

const chat = async (req, res) => {
  const { message, context, history } = req.body || {};

  if (typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ message: "Message is required." });
  }

  const trimmed = message.trim().slice(0, MAX_MESSAGE_LENGTH);
  const safeContext = context && typeof context === "object" ? context : {};
  const safeHistory = Array.isArray(history) ? history : [];

  try {
    const { reply, source } = await getAssistantReply({ message: trimmed, context: safeContext, history: safeHistory });
    return res.json({ reply, source });
  } catch (error) {
    // Never crash the chat — return a helpful fallback reply instead.
    console.error("AI chat error:", error.message);
    return res.json({ reply: ruleBasedReply(trimmed, safeContext), source: "fallback" });
  }
};

module.exports = { chat };
