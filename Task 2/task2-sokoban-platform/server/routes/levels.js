const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const { requireRole } = require("../middleware/roles");
const Level = require("../models/Level");
const User = require("../models/User");

function createLevelsRouter() {
  const router = express.Router();

  // GET /api/levels — public, returns all active levels
  router.get("/", async (req, res) => {
    try {
      const levels = await Level.find({ isActive: true })
        .sort({ createdAt: -1 })
        .populate("createdBy", "username");

      const out = levels.map((level) => ({
        _id: level._id,
        id: level._id.toString(),
        name: level.name,
        difficulty: level.difficulty,
        mapData: level.mapData,
        createdBy: level.createdBy ? level.createdBy.username : null,
      }));

      res.status(200).json(out);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch levels" });
    }
  });

  // GET /api/levels/:id — public, returns single level
  router.get("/:id", async (req, res) => {
    try {
      const { id } = req.params;

      const level = await Level.findById(id)
        .where("isActive")
        .equals(true)
        .populate("createdBy", "username");

      if (!level) return res.status(404).json({ error: "Level not found" });

      res.status(200).json({
        _id: level._id,
        id: level._id.toString(),
        name: level.name,
        difficulty: level.difficulty,
        mapData: level.mapData,
        createdBy: level.createdBy ? level.createdBy.username : null,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch level" });
    }
  });

  // POST /api/levels — admin only, create new level
  router.post(
    "/",
    authenticateToken,
    requireRole("admin"),
    async (req, res) => {
      try {
        const { name, difficulty, mapData } = req.body;

        if (!name || !difficulty || !mapData) {
          return res
            .status(400)
            .json({ error: "Name, difficulty, and mapData are required" });
        }

        if (!Array.isArray(mapData) || mapData.length === 0) {
          return res.status(400).json({ error: "mapData must be a 2D array" });
        }

        const flatMap = mapData.flat();
        const playerCount = flatMap.filter((tile) => tile === 2).length;
        if (playerCount !== 1)
          return res
            .status(400)
            .json({ error: "Map must have exactly 1 player tile" });

        const boxCount = flatMap.filter((tile) => tile === 3).length;
        if (boxCount < 1)
          return res
            .status(400)
            .json({ error: "Map must have at least 1 box tile" });

        const goalCount = flatMap.filter((tile) => tile === 4).length;
        if (goalCount < 1)
          return res
            .status(400)
            .json({ error: "Map must have at least 1 goal tile" });

        if (boxCount !== goalCount)
          return res
            .status(400)
            .json({ error: "Number of boxes must equal number of goals" });

        const level = await Level.create({
          name,
          difficulty,
          mapData,
          createdBy: req.user.id,
          isActive: true,
        });

        res.status(201).json({
          message: "Level created",
          _id: level._id,
          id: level._id.toString(),
        });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create level" });
      }
    },
  );

  // DELETE /api/levels/:id — admin only, soft delete
  router.delete(
    "/:id",
    authenticateToken,
    requireRole("admin"),
    async (req, res) => {
      try {
        const { id } = req.params;

        const level = await Level.findByIdAndUpdate(
          id,
          { isActive: false },
          { new: true },
        );

        if (!level) return res.status(404).json({ error: "Level not found" });

        res.status(200).json({ message: "Level deleted" });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete level" });
      }
    },
  );

  return router;
}

module.exports = { createLevelsRouter };
