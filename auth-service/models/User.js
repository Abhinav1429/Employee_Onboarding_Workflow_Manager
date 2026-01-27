const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: {
    type: String,
    enum: ["ADMIN", "MANAGER", "EMPLOYEE"],
    required: true
  },

  // For employees: link to their manager @abhinav
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  dateOfJoining: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("User", userSchema);