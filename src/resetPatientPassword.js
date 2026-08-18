const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./models/User");

const MONGO_URI = process.env.MONGO_URI;

const resetPatientPassword = async () => {
  try {
    await mongoose.connect(MONGO_URI);

    console.log("MongoDB Connected");

    const email = "rahul.patil@gmail.com";
    const newPassword = "Patient@123";

    const user = await User.findOne({
      email: email.toLowerCase(),
    }).select("+password");

    if (!user) {
      console.log("Patient user not found.");
      process.exit(1);
    }

    if (user.role !== "PATIENT") {
      console.log("This user is not a PATIENT.");
      console.log("Role:", user.role);
      process.exit(1);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    user.password = hashedPassword;
    user.isActive = true;

    await user.save();

    console.log("");
    console.log("Patient password reset successfully.");
    console.log("Email:", email);
    console.log("Password:", newPassword);
    console.log("Role:", user.role);
    console.log("");

    process.exit(0);
  } catch (error) {
    console.error("Password reset error:", error.message);
    process.exit(1);
  }
};

resetPatientPassword();