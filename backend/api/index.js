// Vercel serverless entry for the Strive backend.
// Wraps the Express app and ensures the MongoDB connection is established (and
// cached across warm invocations) before handling a request.
const app = require("../src/app");
const connectDB = require("../src/config/db");

let connectionPromise;

module.exports = async (req, res) => {
  try {
    if (connectDB.getDatabaseMode() === "mongo") {
      if (!connectionPromise) connectionPromise = connectDB();
      await connectionPromise;
    }
    return app(req, res);
  } catch (error) {
    // Reset so the next request can retry the connection.
    connectionPromise = undefined;
    console.error("Serverless init failed:", error.message);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ message: "Server is starting up. Please try again in a moment." }));
  }
};
