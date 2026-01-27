require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const onboardingRoutes = require("./routes/onboarding");

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

// DB connection (adjust URI if needed) @abhinav
mongoose
  .connect(process.env.DB_URL)
  .then(() => console.log("MongoDB Atlas connected to onboarding_db"))
  .catch(err => console.error("MongoDB connection error:", err));

// Start server @abhinav
const PORT = process.env.PORT || 4002;
app.listen(PORT, () => {
  console.log(`Onboarding Service running on port ${PORT}`);
});