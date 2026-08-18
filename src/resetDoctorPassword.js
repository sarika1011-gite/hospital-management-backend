require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

const resetDoctorPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected");

    const email = "rahul.sharma2@mediflow.com";
    const newPassword = "Doctor@123";

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    const doctor = await User.findOneAndUpdate(
      { email },
      {
        password: hashedPassword,
        role: "DOCTOR",
        isActive: true,
      },
      {
        new: true,
      },
    );

    if (!doctor) {
      console.log("Doctor user not found.");
      process.exit(1);
    }

    console.log("Doctor password reset successfully.");
    console.log("Email:", doctor.email);
    console.log("Password:", newPassword);
    console.log("Role:", doctor.role);

    process.exit(0);
  } catch (error) {
    console.error("Reset Doctor Password Error:", error.message);
    process.exit(1);
  }
};

resetDoctorPassword();
