const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./models/User");

const resetAdminPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const hashedPassword = await bcrypt.hash("Admin@123", 12);

    const admin = await User.findOneAndUpdate(
      { email: "admin@mediflow.com" },
      {
        password: hashedPassword,
        role: "ADMIN",
        isActive: true,
      },
      { new: true },
    );

    if (!admin) {
      console.log("Admin user not found.");
      process.exit(1);
    }

    console.log("Admin password reset successfully.");
    console.log("Email:", admin.email);
    console.log("Role:", admin.role);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Password reset error:", error.message);
    process.exit(1);
  }
};

resetAdminPassword();
