const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Register @abhinav
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, managerId, dateOfJoining } = req.body || {};

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        error: "Missing required fields: name, email, password, role"
      });
    }

    // Accept uppercase and lowercase both but store in schema format (for example : ADMIN) @abhinav
    const normalizedRole = String(role).toUpperCase();

    // Basic email check @abhinav
    if (typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ error: "Invalid email" });
    }

    const userToCreate = {
      name,
      email,
      password,
      role: normalizedRole
    };

    if (managerId) userToCreate.managerId = managerId;
    if (dateOfJoining) userToCreate.dateOfJoining = dateOfJoining;

    const user = await User.create(userToCreate);

    // Return without password but it IS saved in MongoDB @abhinav
    const safeUser = await User.findById(user._id)
      .select("-password")
      .populate("managerId", "name email");

    res.status(201).json(safeUser);
  } catch (err) {
    // Duplicate email @abhinav
    if (err && err.code === 11000) {
      return res.status(409).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: err.message });
  }
});

// Login @abhinav
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      "secretkey"
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        managerId: user.managerId
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ALL USERS @abhinav
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password").populate("managerId", "name email");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET USERS BY ROLE @abhinav
router.get("/users/role/:role", async (req, res) => {
  try {
    const { role } = req.params;
    const users = await User.find({ role: role.toUpperCase() })
      .select("-password")
      .populate("managerId", "name email");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE USER (for example : assign manager to employee) @abhinav
router.put("/users/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndUpdate(userId, req.body, { new: true })
      .select("-password")
      .populate("managerId", "name email");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;