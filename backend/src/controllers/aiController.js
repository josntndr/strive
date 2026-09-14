const { getAssistantReply, ruleBasedReply, MAX_MESSAGE_LENGTH } = require("../services/aiService");
const { buildAssistantContext } = require("../services/aiContextService");

const RATE_WINDOW_MS = 60000;
const RATE_LIMIT = 30;
const buckets = new Map();

const checkRateLimit = (key) => {
  const now = Date.now();
  const bucket = buckets.get(key) || { count: 0, resetAt: now + RATE_WINDOW_MS };
  if (now > bucket.resetAt) {
    bucket.count = 0;
    bucket.resetAt = now + RATE_WINDOW_MS;
  }
  bucket.count += 1;
  buckets.set(key, bucket);
  return bucket.count <= RATE_LIMIT;
};

const chat = async (req, res) => {
  const { message, context, history } = req.body || {};

  if (typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ message: "Message is required." });
  }

  const trimmed = message.trim().slice(0, MAX_MESSAGE_LENGTH);
  const safeContext = context && typeof context === "object" ? context : {};
  const safeHistory = Array.isArray(history) ? history : [];
  const userId = req.user?._id || req.user?.id;
  const rateKey = String(userId || req.ip || "anonymous");

  if (!checkRateLimit(rateKey)) {
    return res.status(429).json({
      reply: "I am getting a lot of messages right now. Please wait a moment, then send that again.",
      source: "rate-limit",
    });
  }

  try {
    const assistantContext = await buildAssistantContext({
      userId,
      user: req.user || {},
      clientContext: safeContext,
      message: trimmed,
      history: safeHistory,
    });

    const { reply, source } = await getAssistantReply({
      message: trimmed,
      context: assistantContext,
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
