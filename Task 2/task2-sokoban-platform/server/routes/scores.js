const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const { requireRole } = require("../middleware/roles");
const Score = require("../models/Score");
const Level = require("../models/Level");

function createScoresRouter() {
  const router = express.Router();

  // POST /api/scores — player or admin only, save score
  router.post(
    "/",
    authenticateToken,
    requireRole("player", "admin"),
    async (req, res) => {
      try {
        const { levelId, moves, pushes, timeSeconds } = req.body;

        if (
          !levelId ||
          moves === undefined ||
          pushes === undefined ||
          timeSeconds === undefined
        ) {
          return res.status(400).json({
            error: "levelId, moves, pushes, and timeSeconds are required",
          });
        }

        // Check level exists and is active
        const level = await Level.findById(levelId)
          .where("isActive")
          .equals(true);
        if (!level) return res.status(404).json({ error: "Level not found" });

        // Create score
        await Score.create({
          userId: req.user.id,
          levelId,
          moves,
          pushes,
          timeSeconds,
        });

        res.status(201).json({ message: "Score saved" });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to save score" });
      }
    },
  );

  // GET /api/scores/leaderboard — public, returns top 20 scores
  router.get("/leaderboard", async (req, res) => {
    try {
      const leaderboard = await Score.aggregate([
        { $sort: { timeSeconds: 1 } },
        { $limit: 100 },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "levels",
            localField: "levelId",
            foreignField: "_id",
            as: "level",
          },
        },
        { $unwind: { path: "$level", preserveNullAndEmptyArrays: true } },
        { $match: { "level.isActive": true } },
        {
          $project: {
            username: "$user.username",
            level_name: "$level.name",
            moves: 1,
            time_seconds: "$timeSeconds",
          },
        },
        { $limit: 20 },
      ]);

      res.status(200).json(leaderboard);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  // GET /api/scores/me — requires JWT, returns user's score history
  router.get("/me", authenticateToken, async (req, res) => {
    try {
      const userScores = await Score.find({ userId: req.user.id })
        .sort({ createdAt: -1 })
        .populate("levelId", "name");

      const out = userScores.map((score) => ({
        id: score._id.toString(),
        levelId: score.levelId._id.toString(),
        level_name: score.levelId.name,
        moves: score.moves,
        pushes: score.pushes,
        time_seconds: score.timeSeconds,
        completed_at: score.createdAt,
      }));

      res.status(200).json(out);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch user scores" });
    }
  });

  return router;
}

module.exports = { createScoresRouter };
