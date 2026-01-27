const mongoose = require("mongoose");

const StepSchema = new mongoose.Schema({
  stepOrder: Number,
  title: String,
  assignedRole: {
    type: String,
    enum: ["admin", "manager", "employee"]
  }
  ,
  // optional per-step duration in days @abhinav
  stepDurationDays: {
    type: Number,
    default: 0
  }
});

const WorkflowTemplateSchema = new mongoose.Schema({
  name: String,
  description: String,
  steps: [StepSchema],
  // total allotted time for the workflow in days @abhinav
  allottedTimeDays: {
    type: Number,
    default: 7
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("WorkflowTemplate", WorkflowTemplateSchema);