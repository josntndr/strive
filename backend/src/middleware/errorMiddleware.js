const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);

  // Log full details server-side only; never leak stack traces to clients.
  console.error(`[${req.method} ${req.originalUrl}]`, err.stack || err.message);

  // For unexpected 500s, return a generic message instead of internal error text.
  const message = statusCode >= 500 ? "Something went wrong. Please try again." : err.message || "Request failed.";

  res.status(statusCode || 500).json({ message });
};

module.exports = { notFound, errorHandler };
