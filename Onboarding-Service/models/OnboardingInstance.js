const mongoose = require("mongoose");

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

const OnboardingInstanceSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  workflowTemplateId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "WorkflowTemplate"
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
  // employee-facing status dropdown for the assigned workflow @abhinav
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
  // assigned by admin @abhinav
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  // manager assigned to this employee @abhinav
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  deadline: Date,
  // updates by the employee @abhinav
  updates: [
    {
      date: {
        type: Date,
        default: Date.now
      },
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
  // documents uploaded by employee after completion @abhinav
  documents: [
    {
      originalName: String,
      fileName: String,
      mimeType: String,
      size: Number,
      url: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      },
      uploadedBy: mongoose.Schema.Types.ObjectId
    }
  ],
  // admin/manager decision for completion/documents @abhinav
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
  },
  lastUpdatedAt: Date
});

module.exports = mongoose.model(
  "OnboardingInstance",
  OnboardingInstanceSchema
);