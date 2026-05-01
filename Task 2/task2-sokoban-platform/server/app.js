require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./db/connect");
const { createAuthRouter } = require("./routes/auth");
const { createLevelsRouter } = require("./routes/levels");
const { createScoresRouter } = require("./routes/scores");

const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

// Initialize database and start server
(async () => {
  try {
    await connectDB();

    // Routes
    app.use("/api/auth", createAuthRouter());
    app.use("/api/levels", createLevelsRouter());
    app.use("/api/scores", createScoresRouter());

    // Error handling
    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).json({ error: "Internal server error" });
    });

    // Start server
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(`✓ Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to initialize server", err);
    process.exit(1);
  }
})();

module.exports = app;
