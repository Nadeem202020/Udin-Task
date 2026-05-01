const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✓ MongoDB connected");

    // Seed admin user on first run
    const User = require("../models/User");
    let adminUser = await User.findOne({ username: "admin" });
    if (!adminUser) {
      adminUser = await User.create({
        username: "admin",
        email: "admin@sokoban.com",
        password: await bcrypt.hash("admin123", 10),
        role: "admin",
      });
      console.log("✓ Admin user seeded successfully");
    }

    // Seed starter levels from Task 1
    const Level = require("../models/Level");

    // Check if we need to reseed levels (if mapData is missing)
    const existingLevel = await Level.findOne({});
    if (
      existingLevel &&
      (!existingLevel.mapData || existingLevel.mapData.length === 0)
    ) {
      await Level.deleteMany({});
      console.log("Cleared malformed levels");
    }

    const starterLevels = [
      {
        name: "Level 1: Introduction",
        difficulty: "easy",
        mapData: [
          ["#", "#", "#", "#", "#", "#", "#"],
          ["#", " ", " ", " ", " ", " ", "#"],
          ["#", " ", "$", ".", " ", " ", "#"],
          ["#", " ", " ", " ", "@", " ", "#"],
          ["#", "#", "#", "#", "#", "#", "#"],
        ],
        createdBy: adminUser._id,
        isActive: true,
      },
      {
        name: "Level 2: Double Push",
        difficulty: "easy",
        mapData: [
          ["#", "#", "#", "#", "#", "#", "#", "#"],
          ["#", " ", " ", " ", " ", " ", " ", "#"],
          ["#", " ", "$", " ", "$", " ", ".", "#"],
          ["#", " ", " ", " ", " ", " ", ".", "#"],
          ["#", " ", "@", " ", " ", " ", " ", "#"],
          ["#", "#", "#", "#", "#", "#", "#", "#"],
        ],
        createdBy: adminUser._id,
        isActive: true,
      },
      {
        name: "Level 3: L-Shape",
        difficulty: "medium",
        mapData: [
          ["#", "#", "#", "#", "#", "#"],
          ["#", " ", " ", " ", " ", "#"],
          ["#", "$", " ", " ", ".", "#"],
          ["#", " ", " ", " ", ".", "#"],
          ["#", "@", " ", " ", ".", "#"],
          ["#", "#", "#", "#", "#", "#"],
        ],
        createdBy: adminUser._id,
        isActive: true,
      },
      {
        name: "Level 4: Dead End",
        difficulty: "medium",
        mapData: [
          ["#", "#", "#", "#", "#", "#", "#", "#"],
          ["#", " ", " ", " ", " ", " ", " ", "#"],
          ["#", " ", " ", "$", " ", " ", ".", "#"],
          ["#", " ", " ", "#", " ", " ", ".", "#"],
          ["#", "@", " ", "#", " ", " ", ".", "#"],
          ["#", "#", "#", "#", "#", "#", "#", "#"],
        ],
        createdBy: adminUser._id,
        isActive: true,
      },
      {
        name: "Level 5: Chain Reaction",
        difficulty: "hard",
        mapData: [
          ["#", "#", "#", "#", "#", "#", "#", "#", "#"],
          ["#", " ", " ", " ", " ", " ", " ", " ", "#"],
          ["#", "$", " ", "$", " ", "$", " ", ".", "#"],
          ["#", " ", " ", " ", " ", " ", " ", ".", "#"],
          ["#", "@", " ", " ", " ", " ", " ", ".", "#"],
          ["#", "#", "#", "#", "#", "#", "#", "#", "#"],
        ],
        createdBy: adminUser._id,
        isActive: true,
      },
    ];

    // Check if levels already exist
    const levelCount = await Level.countDocuments({ isActive: true });
    if (levelCount === 0) {
      await Level.insertMany(starterLevels);
      console.log("✓ Seeded 5 starter levels");
    }
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
}

module.exports = connectDB;
