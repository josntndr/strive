const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const workoutRoutes = require("./routes/workoutRoutes");
const mealRoutes = require("./routes/mealRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const adminRoutes = require("./routes/adminRoutes");
const progressRoutes = require("./routes/progressRoutes");
const aiRoutes = require("./routes/aiRoutes");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

// Allow one or more comma-separated frontend origins (prod + previews + local).
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// CORS that "just works" for the unified server behind any host (localhost, a
// tunnel like *.trycloudflare.com, or a real domain): allow same-origin
// requests (the frontend is served by this same server), plus configured
// origins and local dev. Uses the request to compare Origin host to the Host.
app.use(
  cors((req, callback) => {
    const origin = req.header("Origin");
    const host = req.header("Host");
    let allowed = false;

    if (!origin) {
      allowed = true; // non-browser / same-origin without Origin header
    } else {
      if (allowedOrigins.includes(origin)) allowed = true;
      if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) allowed = true;
      try {
        if (new URL(origin).host === host) allowed = true; // true same-origin
      } catch {
        /* ignore malformed origin */
      }
    }

    callback(null, { origin: allowed, credentials: true });
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (req, res) => {
  const mode = connectDB.getDatabaseMode();
  const databaseConnected = mongoose.connection.readyState === 1;

  if (mode === "json") {
    return res.json({
      status: "ok",
      backend: "running",
      database: process.env.BLOB_READ_WRITE_TOKEN ? "connected" : "json-fallback",
    });
  }

  res.status(databaseConnected ? 200 : 503).json({
    status: databaseConnected ? "ok" : "error",
    backend: "running",
    database: databaseConnected ? "connected" : "disconnected",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/meals", mealRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/ai", aiRoutes);

// Serve the built frontend (static export) so the whole app runs as one server
// at one URL. The frontend is built into ../../frontend/out (run: npm run build
// in frontend with NEXT_PUBLIC_API_URL="").
const frontendDir = path.join(__dirname, "..", "..", "frontend", "out");
if (fs.existsSync(frontendDir)) {
  app.use(express.static(frontendDir));

  // Client-side route fallback: any non-API GET serves the matching exported
  // page, or the app shell, so deep links and refreshes work.
  app.get(/^\/(?!api\/).*/, (req, res, next) => {
    const candidate = path.join(frontendDir, req.path, "index.html");
    if (fs.existsSync(candidate)) return res.sendFile(candidate);
    const notFoundPage = path.join(frontendDir, "404.html");
    if (fs.existsSync(notFoundPage)) return res.status(404).sendFile(notFoundPage);
    return res.sendFile(path.join(frontendDir, "index.html"));
  });
} else {
  // API-only deployment (e.g. Vercel/Render backend with no bundled frontend).
  app.get("/", (req, res) => {
    res.json({ message: "Strive backend API is running" });
  });
}

app.use(notFound);
app.use(errorHandler);

module.exports = app;
