const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./models/User");

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const existingAdmin = await User.findOne({
      email: "admin@mediflow.com",
    });

    if (existingAdmin) {
      console.log("Admin already exists.");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("Admin@123", 12);

    const admin = await User.create({
      name: "Hospital Admin",
      email: "admin@mediflow.com",
      password: hashedPassword,
      role: "ADMIN",
      phone: "9876543210",
    });

    console.log("Admin created successfully.");
    console.log("Email:", admin.email);
    console.log("Role:", admin.role);

    process.exit(0);
  } catch (error) {
    console.error("Admin creation error:", error.message);
    process.exit(1);
  }
};

createAdmin();
