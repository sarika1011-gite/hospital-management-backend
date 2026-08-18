const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

const User = require("./src/models/User");

dotenv.config();

const resetAdmin = async () => {
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
      console.log("Admin not found.");
    } else {
      console.log("Admin password reset successfully!");
      console.log("Email: admin@mediflow.com");
      console.log("Password: Admin@123");
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

resetAdmin();
