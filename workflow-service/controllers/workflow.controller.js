const WorkflowTemplate = require("../models/WorkflowTemplate");

// CREATE WORKFLOW
exports.createWorkflow = async (req, res) => {
  try {
    const { name, description, allottedTimeDays, steps } = req.body;

    const workflow = await WorkflowTemplate.create({
      name,
      description,
      allottedTimeDays,
      steps,
      createdBy: req.body.createdBy || null
    });

    res.status(201).json(workflow);
  } catch (error) {
    console.error("Create workflow error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// GET ALL WORKFLOWS
exports.getAllWorkflows = async (req, res) => {
  try {
    const workflows = await WorkflowTemplate.find();
    res.json(workflows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET WORKFLOW BY ID
exports.getWorkflowById = async (req, res) => {
  try {
    const workflow = await WorkflowTemplate.findById(req.params.id);
    if (!workflow) {
      return res.status(404).json({ error: "Workflow not found" });
    }
    res.json(workflow);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
