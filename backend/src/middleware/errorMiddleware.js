const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);
  const response = {
    message: err.message || "Something went wrong.",
    error: process.env.NODE_ENV === "development"
      ? (err.stack || err.message || "Unknown error")
      : "Internal server error.",
  };

  res.status(statusCode || 500).json(response);
};

module.exports = { notFound, errorHandler };
