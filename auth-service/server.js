console.log("RUNNING THIS SERVER FILE:", __filename);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config(); // ✅ LOAD .env

const authRoutes = require("./routes/auth");

const app = express();

app.use(cors());
app.use(express.json());

// ✅ Read MongoDB Atlas URL
const DB_URL = process.env.DB_URL;

if (!DB_URL) {
  console.error("❌ DB_URL is missing in .env file");
  process.exit(1);
}

// Connect to MongoDB Atlas
mongoose
  .connect(DB_URL)
  .then(() => console.log(" MongoDB Atlas connected (authdb)"))
  .catch(err => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });

// Test route
app.get("/__test__", (req, res) => {
  res.send("SERVER FILE YOU EDITED IS RUNNING");
});

// Auth routes
app.use("/api/auth", authRoutes);

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Auth Service running on port ${PORT}`);
});