const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

function createAuthRouter() {
  const router = express.Router();

  // POST /api/auth/register
  router.post("/register", async (req, res) => {
    const { username, email, password } = req.body;

    // Input validation
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ error: "Username, email, and password are required" });
    }

    if (
      username.trim() === "" ||
      email.trim() === "" ||
      password.trim() === ""
    ) {
      return res.status(400).json({ error: "Fields cannot be empty" });
    }

    try {
      // Check if username or email already exists
      const existingUser = await User.findOne({
        $or: [{ username }, { email }],
      });
      if (existingUser) {
        if (existingUser.username === username) {
          return res.status(400).json({ error: "Username already taken" });
        }
        return res.status(400).json({ error: "Email already in use" });
      }

      // Hash password and create user
      const passwordHash = bcrypt.hashSync(password, 10);
      await User.create({
        username,
        email,
        password: passwordHash,
        role: "player",
      });

      res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  // POST /api/auth/login
  router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(401).json({ error: "Invalid credentials" });

      const passwordMatch = bcrypt.compareSync(password, user.password);
      if (!passwordMatch)
        return res.status(401).json({ error: "Invalid credentials" });

      const token = jwt.sign(
        { id: user._id.toString(), username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" },
      );

      res.status(200).json({
        token,
        user: {
          id: user._id.toString(),
          username: user.username,
          role: user.role,
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Login failed" });
    }
  });

  return router;
}

module.exports = { createAuthRouter };
