const express = require("express");
const {
  register,
  login,
  getUsers,
  getUsersByRole
} = require("../controllers/auth.controller");

const { protect, authorize } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

// Public route - get users by role (needed for frontend)
router.get("/users/role/:role", getUsersByRole);

// Public route - get all users (needed for onboarding service to populate names)
router.get("/users/all", getUsers);

// protected routes
router.get("/users", protect, authorize("ADMIN", "MANAGER"), getUsers);

module.exports = router;