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

// get users by role @abhinav
router.get("/users/role/:role", getUsersByRole);

//get all users needed for onboarding service @abhinav
router.get("/users/all", getUsers);

// protected routes @abhinav
router.get("/users", protect, authorize("ADMIN", "MANAGER"), getUsers);

module.exports = router;
