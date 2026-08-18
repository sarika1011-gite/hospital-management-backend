require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

const createDoctor = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected");

    const email = "rahul.sharma2@mediflow.com";

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log("Doctor user already exists.");
      console.log("Role:", existingUser.role);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("Doctor@123", 12);

    const doctor = await User.create({
      name: "Dr. Rahul Sharma",
      email,
      password: hashedPassword,
      phone: "9876543210",
      role: "DOCTOR",
      isActive: true,
    });

    console.log("Doctor user created successfully.");
    console.log("Email:", doctor.email);
    console.log("Password: Doctor@123");
    console.log("Role:", doctor.role);

    process.exit(0);
  } catch (error) {
    console.error("Create Doctor Error:", error.message);
    process.exit(1);
  }
};

createDoctor();
