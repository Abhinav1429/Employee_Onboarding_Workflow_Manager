const express = require("express");
const router = express.Router();
const multer = require("multer");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const OnboardingInstance = require("../models/OnboardingInstance");
const Notification = require("../models/Notification");

/* FILE UPLOAD SETUP @abhinav  */

const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // ensure uploads folder exists @abhinav
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // unique filename @abhinav
  }
});

const upload = multer({ storage });

/* ----- ASSIGN WORKFLOW (ADMIN) @abhinav -------- */

router.post("/assign", async (req, res) => {
  try {
    const { employeeId, workflowTemplate, assignedBy, managerId } = req.body;

    if (!employeeId || !workflowTemplate || !assignedBy) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const tasks = (workflowTemplate.steps || []).map(step => ({
      stepOrder: step.stepOrder,
      title: step.title,
      assignedToRole: step.assignedRole,
      status: "pending"
    }));

    const startedAt = new Date();
    const deadline = workflowTemplate.allottedTimeDays
      ? new Date(
          startedAt.getTime() +
          workflowTemplate.allottedTimeDays * 24 * 60 * 60 * 1000
        )
      : null;

    const onboarding = await OnboardingInstance.create({
      employeeId,
      workflowTemplateId: workflowTemplate._id,
      tasks,
      assignedBy,
      managerId: managerId || null,
      startedAt,
      deadline,
      progress: 0,
      status: "active",
      projectStatus: "pending"
    });

    await Notification.create({
      userId: employeeId,
      message: "A new onboarding workflow has been assigned to you."
    });

    if (managerId) {
      await Notification.create({
        userId: managerId,
        message: "A new employee onboarding has been assigned to you."
      });
    }

    res.json(onboarding);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to assign workflow" });
  }
});

/*  EMPLOYEE: GET WORKFLOWS @abhinav */

router.get("/employee/:employeeId", async (req, res) => {
  try {
    const employeeId = new mongoose.Types.ObjectId(req.params.employeeId);

    const onboardings = await OnboardingInstance.find({ employeeId });

    const enriched = onboardings.map(o => {
      const obj = o.toObject();
      obj.daysGiven = o.deadline && o.startedAt
        ? Math.ceil((o.deadline - o.startedAt) / (1000 * 60 * 60 * 24))
        : null;

      obj.daysLeft = o.deadline
        ? Math.ceil((o.deadline - new Date()) / (1000 * 60 * 60 * 24))
        : null;

      return obj;
    });

    res.json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch employee onboardings" });
  }
});

/* MANAGER: MY EMPLOYEES @abhinav  */

router.get("/manager/employees", async (req, res) => {
  try {
    const { managerId } = req.query;
    if (!managerId) return res.json([]);

    const onboardings = await OnboardingInstance.find({ managerId });

    const result = onboardings.map(o => ({
      onboardingId: o._id,
      employeeId: o.employeeId,
      workflowTemplateId: o.workflowTemplateId,
      projectStatus: o.projectStatus,
      status: o.status,
      startedAt: o.startedAt,
      daysGiven: o.deadline && o.startedAt
        ? Math.ceil((o.deadline - o.startedAt) / (1000 * 60 * 60 * 24))
        : null,
      daysLeft: o.deadline
        ? Math.ceil((o.deadline - new Date()) / (1000 * 60 * 60 * 24))
        : null
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch manager employees" });
  }
});

/*  MANAGER TASKS @abhinav */

router.get("/manager-tasks", async (req, res) => {
  try {
    const { managerId } = req.query;
    const onboardings = await OnboardingInstance.find({ managerId });

    const tasks = [];

    onboardings.forEach(o => {
      o.tasks.forEach(t => {
        if (t.assignedToRole === "manager" && t.status === "pending") {
          tasks.push({
            onboardingId: o._id,
            employeeId: o.employeeId,
            title: t.title,
            stepOrder: t.stepOrder,
            status: t.status,
            progress: o.progress
          });
        }
      });
    });

    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch manager tasks" });
  }
});


router.get("/notifications/:userId", async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.params.userId })
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

router.put("/notifications/:id/read", async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ message: "Notification marked as read" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update notification" });
  }
});

module.exports = router;