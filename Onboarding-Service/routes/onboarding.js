const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const OnboardingInstance = require("../models/OnboardingInstance");
const Notification = require("../models/Notification");


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

/*ASSIGN WORKFLOW (ADMIN) @abhinav*/
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
      ? new Date(startedAt.getTime() + workflowTemplate.allottedTimeDays * 24 * 60 * 60 * 1000)
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

    // Notify employee @abhinav
    await Notification.create({
      userId: employeeId,
      message: "A new onboarding workflow has been assigned to you."
    });

    // Notify manager @abhinav
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


router.get("/admin/all", async (req, res) => {
  try {
    const onboardings = await OnboardingInstance.find()
      .populate("employeeId", "name email")
      .populate("managerId", "name email")
      .populate("workflowTemplateId", "name description allottedTimeDays");

    const enriched = onboardings.map(o => {
      const obj = o.toObject();
      if (obj.deadline) {
        const diff = Math.ceil((new Date(obj.deadline) - new Date()) / (1000 * 60 * 60 * 24));
        obj.timeRemainingDays = diff;
      }
      return obj;
    });

    res.json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch onboardings" });
  }
});

/*EMPLOYEE: GET ONBOARDINGS*/
router.get("/employee/:employeeId", async (req, res) => {
  try {
    const { employeeId } = req.params;

    const onboardings = await OnboardingInstance.find({ employeeId })
      .populate("managerId", "name email")
      .populate("assignedBy", "name email")
      .populate("workflowTemplateId", "name description allotesTimeDays");

    const enriched = onboardings.map(o => {
      const obj = o.toObject();
      if (obj.deadline) {
        const diff = Math.ceil((new Date(obj.deadline) - new Date()) / (1000 * 60 * 60 * 24));
        obj.timeRemainingDays = diff;
      }
      return obj;
    });

    res.json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch employee onboardings" });
  }
});

//MANAGER: EMPLOYEES LIST @abhinav
router.get("/manager/employees", async (req, res) => {
  try {
    const { managerId } = req.query;
    if (!managerId) return res.json([]);

    const onboardings = await OnboardingInstance.find({ managerId })
      .populate("employeeId", "name email");

    const map = {};
    onboardings.forEach(o => {
      map[o.employeeId._id] = {
        employee: o.employeeId,
        onboarding: o
      };
    });

    res.json(Object.values(map));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch manager employees" });
  }
});

/*MANAGER TASKS @abhinav*/
router.get("/manager-tasks", async (req, res) => {
  try {
    const { managerId } = req.query;

    const onboardings = await OnboardingInstance.find({ managerId })
      .populate("employeeId", "name email");

    const tasks = [];

    onboardings.forEach(o => {
      o.tasks.forEach(t => {
        if (t.assignedToRole === "manager" && t.status === "pending") {
          const deadlineDiff = o.deadline
            ? Math.ceil((new Date(o.deadline) - new Date()) / (1000 * 60 * 60 * 24))
            : null;

          tasks.push({
            onboardingId: o._id,
            employeeId: o.employeeId._id,
            employeeName: o.employeeId.name || o.employeeId.email,
            title: t.title,
            stepOrder: t.stepOrder,
            status: t.status,
            deadline: o.deadline,
            timeRemainingDays: deadlineDiff,
            progress: o.progress,
            startedAt: o.startedAt
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

/*MANAGER REVIEW TASK @abhinav*/
router.post("/manager-review", async (req, res) => {
  try {
    const { onboardingId, stepOrder, action, comment } = req.body;

    const onboarding = await OnboardingInstance.findById(onboardingId);
    if (!onboarding) return res.status(404).json({ error: "Onboarding not found" });

    const task = onboarding.tasks.find(t => t.stepOrder === stepOrder);
    if (!task) return res.status(404).json({ error: "Task not found" });

    task.status = action === "approve" ? "approved" : "rejected";
    task.managerComment = comment || "";
    task.reviewedAt = new Date();

    const approvedCount = onboarding.tasks.filter(t => t.status === "approved").length;
    onboarding.progress = Math.round((approvedCount / onboarding.tasks.length) * 100);

    if (onboarding.progress === 100) {
      onboarding.status = "completed";
    }

    await onboarding.save();

    await Notification.create({
      userId: onboarding.employeeId,
      message: `Task "${task.title}" has been ${task.status}.`
    });

    res.json({ message: "Task reviewed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to review task" });
  }
});


router.put("/:onboardingId/project-status", async (req, res) => {
  try {
    const { onboardingId } = req.params;
    const { employeeId, projectStatus } = req.body;

    const onboarding = await OnboardingInstance.findById(onboardingId);
    if (!onboarding) {
      return res.status(404).json({ error: "Onboarding not found" });
    }

    if (onboarding.employeeId.toString() !== employeeId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

   
    if (
      projectStatus === "completed" &&
      (!onboarding.documents || onboarding.documents.length === 0)
    ) {
      return res.status(400).json({
        error: "Please upload documents before marking project as completed"
      });
    }

    onboarding.projectStatus = projectStatus;

    if (projectStatus === "completed") {
      onboarding.completionReview = {
        status: "pending",
        remark: ""
      };

      await Notification.create({
        userId: onboarding.assignedBy,
        message: "Employee marked project as completed. Review required."
      });

      if (onboarding.managerId) {
        await Notification.create({
          userId: onboarding.managerId,
          message: "Employee marked project as completed. Review required."
        });
      }
    }

    await onboarding.save();
    res.json({ message: "Project status updated successfully", onboarding });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update project status" });
  }
});

//upload documents @abhinav
router.post("/:onboardingId/documents", upload.array("documents"), async (req, res) => {
  try {
    const { onboardingId } = req.params;
    const { employeeId } = req.body;

    const onboarding = await OnboardingInstance.findById(onboardingId);
    if (!onboarding) return res.status(404).json({ error: "Onboarding not found" });

    if (onboarding.employeeId.toString() !== employeeId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    req.files.forEach(file => {
      onboarding.documents.push({
        fileName: file.filename,
        originalName: file.originalname,
        url: `/uploads/${file.filename}`,
        uploadedAt: new Date()
      });
    });

    await onboarding.save();

    await Notification.create({
      userId: onboarding.assignedBy,
      message: "Employee uploaded project documents."
    });

    if (onboarding.managerId) {
      await Notification.create({
        userId: onboarding.managerId,
        message: "Employee uploaded project documents."
      });
    }

    res.json({ message: "Documents uploaded successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to upload documents" });
  }
});


router.post("/:onboardingId/review-completion", async (req, res) => {
  try {
    const { onboardingId } = req.params;
    const { reviewerId, reviewerRole, action, remark } = req.body;

    const onboarding = await OnboardingInstance.findById(onboardingId);
    if (!onboarding) return res.status(404).json({ error: "Onboarding not found" });

    if (
      reviewerRole === "ADMIN" &&
      onboarding.assignedBy.toString() !== reviewerId
    ) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (
      reviewerRole === "MANAGER" &&
      onboarding.managerId?.toString() !== reviewerId
    ) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    onboarding.completionReview = {
      status: action === "accept" ? "accepted" : "rejected",
      remark
    };

    if (action === "accept") {
      onboarding.status = "completed";
    } else {
      onboarding.projectStatus = "ongoing";
    }

    await onboarding.save();

    await Notification.create({
      userId: onboarding.employeeId,
      message: `Project has been ${action}ed. Remark: ${remark || "N/A"}`
    });

    res.json({ message: "Completion reviewed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to review completion" });
  }
});

//Notification @abhinav
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