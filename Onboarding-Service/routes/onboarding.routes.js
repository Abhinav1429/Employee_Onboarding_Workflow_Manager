const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const {
  assignWorkflow,
  getEmployeeOnboardings,
  getManagerEmployees,
  getManagerTasks,
  getAllOnboardings,
  getNotifications,
  markNotificationAsRead,
  updateProjectStatus,
  postUpdate,
  uploadDocuments
} = require("../controllers/onboarding.controller");

const router = express.Router();

// FILE UPLOAD SETUP @abhinav
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

// Routes @abhinav
router.post("/assign", assignWorkflow);
router.get("/employee/:employeeId", getEmployeeOnboardings);
router.get("/manager/employees", getManagerEmployees);
router.get("/manager-tasks", getManagerTasks);
router.get("/admin/all", getAllOnboardings);
router.get("/notifications/:userId", getNotifications);
router.put("/notifications/:id/read", markNotificationAsRead);

// Employee actions @abhinav
router.put("/:id/project-status", updateProjectStatus);
router.post("/update", postUpdate);
router.post("/:id/documents", upload.array("documents", 10), uploadDocuments);

module.exports = router;
