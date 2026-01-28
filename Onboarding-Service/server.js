require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const onboardingRoutes = require("./routes/onboarding.routes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded documents
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/onboarding", onboardingRoutes);

// Test root
app.get("/", (req, res) => {
  res.send("Onboarding Service is running");
});

// DB
connectDB();

const PORT = process.env.PORT || 4002;
app.listen(PORT, () => {
  console.log(`Onboarding service running on port ${PORT}`);
});