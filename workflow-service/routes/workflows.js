const express = require("express");
const WorkflowTemplate = require("../models/WorkflowTemplate");

const router = express.Router();

// Create workflow @abhinav
router.post("/", async (req, res) => {
  try {
    const workflow = await WorkflowTemplate.create(req.body);
    res.status(201).json(workflow);
  } catch (err) {
    console.error("Create workflow error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// List workflows @abhinav
router.get("/", async (req, res) => {
  const workflows = await WorkflowTemplate.find();
  res.json(workflows);
});

module.exports = router;