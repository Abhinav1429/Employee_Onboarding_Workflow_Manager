require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const onboardingRoutes = require("./routes/onboarding.routes");

const app = express();

// Middleware @abhinav
app.use(cors());
app.use(express.json());

// Serve uploaded documents @abhinav
app.use("/uploads", express.static("uploads"));

// Routes @abhinav
app.use("/api/onboarding", onboardingRoutes);

// Test root @abhinav
app.get("/", (req, res) => {
  res.send("Onboarding Service is running");
});

// DB @abhinav
connectDB();

const PORT = process.env.PORT || 4002;
app.listen(PORT, () => {
  console.log(`Onboarding service running on port ${PORT}`);
});
