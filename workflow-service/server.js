require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const workflowRoutes = require("./routes/workflow.routes");

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// routes
app.use("/api/workflows", workflowRoutes);

// db
connectDB();

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  console.log(`Workflow service running on port ${PORT}`);
});