require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("Connected to MongoDB Atlas");
  } catch (error) {
    console.error("DB connection failed:", error.message);
    process.exit(1);
  }
};

const seedUsers = async () => {
  try {
    await connectDB();

    // Clear existing users
    await User.deleteMany({});
    console.log("Cleared existing users");

    // Create admin first
    const admin = await User.create({
      name: "Admin User",
      email: "admin@example.com",
      password: "admin123",
      role: "ADMIN"
    });

    // Create manager
    const manager = await User.create({
      name: "Manager User",
      email: "manager@example.com",
      password: "manager123",
      role: "MANAGER"
    });

    // Create employee assigned to manager
    const employee = await User.create({
      name: "Employee User",
      email: "employee@example.com",
      password: "employee123",
      role: "EMPLOYEE",
      managerId: manager._id  // Assign to manager
    });

    console.log("✓ Test users created successfully:");
    console.log(`  - ${admin.email} (${admin.role})`);
    console.log(`  - ${manager.email} (${manager.role})`);
    console.log(`  - ${employee.email} (${employee.role}) - Manager: ${manager.name}`);

    mongoose.connection.close();
  } catch (error) {
    console.error("Error seeding users:", error.message);
    process.exit(1);
  }
};

seedUsers();
