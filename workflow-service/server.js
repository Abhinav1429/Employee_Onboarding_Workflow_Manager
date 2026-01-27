require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const workflowRoutes = require("./routes/workflows");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.DB_URL)
  .then(() => console.log("MongoDB Atlas connected to workflowDB"))
  .catch(err => console.error("MongoDB connection error:", err));

app.use("/api/workflows", workflowRoutes);

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => console.log(`Workflow Service running on ${PORT}`));