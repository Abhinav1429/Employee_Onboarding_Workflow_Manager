const mongoose = require("mongoose");

/* ---------------- TASK SCHEMA @abhinav ---------------- */

const TaskSchema = new mongoose.Schema({
  stepOrder: Number,
  title: String,
  assignedToRole: String,
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  managerComment: String,
  reviewedAt: Date
});

/* ---------------- ONBOARDING INSTANCE SCHEMA @abhinav ---------------- */

const OnboardingInstanceSchema = new mongoose.Schema({
  // employee reference (Auth service owns User) @abhinav
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },

  // workflow reference (Workflow service owns WorkflowTemplate) @abhinav
  workflowTemplateId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },

  tasks: [TaskSchema],

  progress: {
    type: Number,
    default: 0
  },

  status: {
    type: String,
    enum: ["active", "completed", "rejected"],
    default: "active"
  },

  // employee-controlled project status dropdown @abhinav
  projectStatus: {
    type: String,
    enum: ["started", "pending", "ongoing", "completed"],
    default: "pending"
  },

  startedAt: {
    type: Date,
    default: Date.now
  },

  completedAt: Date,

  // admin who assigned workflow @abhinav
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId
  },

  // manager assigned to employee @abhinav
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },

  deadline: Date,

  // employee daily updates @abhinav
  updates: [
    {
      date: { type: Date, default: Date.now },
      note: String,
      createdBy: mongoose.Schema.Types.ObjectId,
      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
      },
      managerComment: String,
      reviewedAt: Date,
      reviewedBy: mongoose.Schema.Types.ObjectId
    }
  ],

  // uploaded documents @abhinav
  documents: [
    {
      originalName: String,
      fileName: String,
      url: String,
      uploadedAt: { type: Date, default: Date.now }
    }
  ],

  // final completion review @abhinav
  completionReview: {
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending"
    },
    remark: String,
    reviewedAt: Date,
    reviewedBy: mongoose.Schema.Types.ObjectId,
    reviewerRole: String
  }
});

module.exports = mongoose.model(
  "OnboardingInstance",
  OnboardingInstanceSchema
);