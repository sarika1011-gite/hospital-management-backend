const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

const User = require("./src/models/User");

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const password = "Admin@123";

    const existingAdmin = await User.findOne({
      email: "admin@mediflow.com",
    });

    if (existingAdmin) {
      console.log("Admin already exists.");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await User.create({
      name: "MediFlow Admin",
      email: "admin@mediflow.com",
      password: hashedPassword,
      phone: "9999999999",
      role: "ADMIN",
      isActive: true,
    });

    console.log("Admin created successfully!");
    console.log("Email: admin@mediflow.com");
    console.log("Password: Admin@123");

    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

createAdmin();
