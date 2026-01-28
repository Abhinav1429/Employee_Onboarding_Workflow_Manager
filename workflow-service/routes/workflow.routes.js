const express = require("express");
const {
  createWorkflow,
  getAllWorkflows,
  getWorkflowById
} = require("../controllers/workflow.controller");

const router = express.Router();

router.post("/", createWorkflow);
router.get("/", getAllWorkflows);
router.get("/:id", getWorkflowById);

module.exports = router;
