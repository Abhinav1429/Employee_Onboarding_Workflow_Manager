const OnboardingInstance = require("../models/OnboardingInstance");
const Notification = require("../models/Notification");
const mongoose = require("mongoose");
const axios = require("axios");

// ASSIGN WORKFLOW TO EMPLOYEE @abhinav
exports.assignWorkflow = async (req, res) => {
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
};

// GET EMPLOYEE ONBOARDINGS @abhinav
exports.getEmployeeOnboardings = async (req, res) => {
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
};

// GET MANAGER EMPLOYEES @abhinav
exports.getManagerEmployees = async (req, res) => {
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
};

// GET MANAGER TASKS @abhinav
exports.getManagerTasks = async (req, res) => {
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
};

// GET ALL ONBOARDINGS (ADMIN) @abhinav
exports.getAllOnboardings = async (req, res) => {
  try {
    const onboardings = await OnboardingInstance.find();

    // Fetch user and workflow data from other services
    const userIds = [...new Set([
      ...onboardings.map(o => o.employeeId?.toString()).filter(Boolean),
      ...onboardings.map(o => o.managerId?.toString()).filter(Boolean)
    ])];

    const workflowIds = [...new Set(
      onboardings.map(o => o.workflowTemplateId?.toString()).filter(Boolean)
    )];

    // Fetch users from auth service @abhinav
    let usersMap = {};
    try {
      console.log("Fetching users from http://localhost:4000/api/auth/users/all");
      const usersRes = await axios.get("http://localhost:4000/api/auth/users/all");
      console.log("Users fetched:", usersRes.data.length);
      usersRes.data.forEach(user => {
        usersMap[user._id.toString()] = user;
      });
    } catch (err) {
      console.error("Failed to fetch users:", err.message);
    }

    // Fetch workflows from workflow service @abhinav
    let workflowsMap = {};
    try {
      console.log("Fetching workflows from http://localhost:4001/api/workflows");
      const workflowsRes = await axios.get("http://localhost:4001/api/workflows");
      console.log("Workflows fetched:", workflowsRes.data.length);
      workflowsRes.data.forEach(wf => {
        workflowsMap[wf._id.toString()] = wf;
      });
    } catch (err) {
      console.error("Failed to fetch workflows:", err.message);
    }

    const enriched = onboardings.map(o => {
      const obj = o.toObject();
      
      // Add user details with proper fallback @abhinav
      if (obj.employeeId) {
        const empId = obj.employeeId.toString();
        const userData = usersMap[empId];
        obj.employeeId = userData ? {
          _id: userData._id,
          name: userData.name || userData.email,
          email: userData.email
        } : { 
          _id: empId, 
          name: "Unknown Employee", 
          email: "N/A" 
        };
      }

      if (obj.managerId) {
        const mgrId = obj.managerId.toString();
        const mgrData = usersMap[mgrId];
        obj.managerId = mgrData ? {
          _id: mgrData._id,
          name: mgrData.name || mgrData.email,
          email: mgrData.email
        } : { 
          _id: mgrId, 
          name: "Unknown Manager", 
          email: "N/A" 
        };
      }

      // Add workflow details @abhinav
      if (obj.workflowTemplateId) {
        const wfId = obj.workflowTemplateId.toString();
        const wfData = workflowsMap[wfId];
        obj.workflowTemplateId = wfData ? {
          _id: wfData._id,
          name: wfData.name,
          description: wfData.description
        } : { 
          _id: wfId, 
          name: "Unknown Workflow" 
        };
      }

      obj.daysGiven = o.deadline && o.startedAt
        ? Math.ceil((o.deadline - o.startedAt) / (1000 * 60 * 60 * 24))
        : null;

      obj.daysLeft = o.deadline
        ? Math.ceil((o.deadline - new Date()) / (1000 * 60 * 60 * 24))
        : null;

      obj.timeRemainingDays = obj.daysLeft;

      return obj;
    });

    res.json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch onboardings" });
  }
};

// GET NOTIFICATIONS @abhinav
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.params.userId })
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

// MARK NOTIFICATION AS READ @abhinav
exports.markNotificationAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ message: "Notification marked as read" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update notification" });
  }
};

// UPDATE PROJECT STATUS @abhinav
exports.updateProjectStatus = async (req, res) => {
  try {
    const { employeeId, projectStatus } = req.body;
    const onboardingId = req.params.id;

    const onboarding = await OnboardingInstance.findById(onboardingId);

    if (!onboarding) {
      return res.status(404).json({ error: "Onboarding not found" });
    }

    if (String(onboarding.employeeId) !== String(employeeId)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    onboarding.projectStatus = projectStatus;
    await onboarding.save();

    // Notify manager @abhinav
    if (onboarding.managerId) {
      await Notification.create({
        userId: onboarding.managerId,
        message: `Employee updated project status to "${projectStatus}".`
      });
    }

    res.json({ message: "Project status updated", onboarding });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update project status" });
  }
};

// POST UPDATE NOTE @abhinav
exports.postUpdate = async (req, res) => {
  try {
    const { onboardingId, employeeId, note } = req.body;

    const onboarding = await OnboardingInstance.findById(onboardingId);

    if (!onboarding) {
      return res.status(404).json({ error: "Onboarding not found" });
    }

    if (String(onboarding.employeeId) !== String(employeeId)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (!onboarding.updates) {
      onboarding.updates = [];
    }

    onboarding.updates.push({
      note,
      date: new Date(),
      createdBy: employeeId,
      status: "pending"
    });

    await onboarding.save();

    // Notify manager @abhinav
    if (onboarding.managerId) {
      await Notification.create({
        userId: onboarding.managerId,
        message: `Employee posted an update on their onboarding.`
      });
    }

    res.json({ message: "Update posted", onboarding });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to post update" });
  }
};

// UPLOAD DOCUMENTS @abhinav
exports.uploadDocuments = async (req, res) => {
  try {
    const { employeeId } = req.body;
    const onboardingId = req.params.id;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No documents uploaded" });
    }

    const onboarding = await OnboardingInstance.findById(onboardingId);

    if (!onboarding) {
      return res.status(404).json({ error: "Onboarding not found" });
    }

    if (String(onboarding.employeeId) !== String(employeeId)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (!onboarding.documents) {
      onboarding.documents = [];
    }

    files.forEach(file => {
      onboarding.documents.push({
        fileName: file.filename,
        originalName: file.originalname,
        url: `/uploads/${file.filename}`,
        uploadedAt: new Date()
      });
    });

    await onboarding.save();

    // Notify manager @abhinav
    if (onboarding.managerId) {
      await Notification.create({
        userId: onboarding.managerId,
        message: `Employee uploaded ${files.length} document(s).`
      });
    }

    res.json({ message: "Documents uploaded successfully", onboarding });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to upload documents" });
  }
};
