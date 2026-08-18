const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const Department = require("../models/Department");

// ======================================
// GENERATE JWT
// ======================================
const generateToken = (userId, role) => {
  return jwt.sign(
    {
      id: userId,
      role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || "7d",
    },
  );
};

// ======================================
// REGISTER
// ======================================
const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      role,
      department,
      specialization,
      qualification,
      experience,
      consultationFee,
      availableDays,
      availableTime,
    } = req.body;

    // Required fields
    if (!name || !email || !password || !phone || !role) {
      return res.status(400).json({
        success: false,
        message: "Name, email, phone, password and account type are required",
      });
    }

    const selectedRole = role.toUpperCase();

    if (!["PATIENT", "DOCTOR"].includes(selectedRole)) {
      return res.status(400).json({
        success: false,
        message: "Only Patient or Doctor registration is allowed",
      });
    }

    // ======================================
    // DOCTOR VALIDATION
    // ======================================
    if (selectedRole === "DOCTOR" && !department) {
      return res.status(400).json({
        success: false,
        message: "Department is required for doctor registration",
      });
    }

    // Check department
    if (selectedRole === "DOCTOR") {
      const departmentExists = await Department.findById(department);

      if (!departmentExists) {
        return res.status(404).json({
          success: false,
          message: "Selected department not found",
        });
      }
    }

    // ======================================
    // CHECK EXISTING USER
    // ======================================
    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // ======================================
    // HASH PASSWORD
    // ======================================
    const hashedPassword = await bcrypt.hash(password, 12);

    // ======================================
    // CREATE USER
    // ======================================
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone.trim(),
      role: selectedRole,
      isActive: true,
    });

    // ======================================
    // CREATE PATIENT PROFILE
    // ======================================
    if (selectedRole === "PATIENT") {
      await Patient.create({
        user: user._id,
        name: user.name,
        age: 0,
        gender: "Other",
        mobile: user.phone,
        email: user.email,
        address: "",
        bloodGroup: null,
        medicalInformation: "",
        isActive: true,
      });
    }

    // ======================================
    // CREATE DOCTOR PROFILE
    // ======================================
    if (selectedRole === "DOCTOR") {
      await Doctor.create({
        user: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,

        specialization: specialization || "General Physician",
        qualification: qualification || "MBBS",
        experience: Number(experience) || 0,

        department,

        consultationFee: Number(consultationFee) || 0,

        profileImage: "",

        availableDays:
          Array.isArray(availableDays) && availableDays.length
            ? availableDays
            : ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],

        availableTime: availableTime || "",

        isAvailable: true,
        isActive: true,
      });
    }

    // ======================================
    // TOKEN
    // ======================================
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message:
        selectedRole === "DOCTOR"
          ? "Doctor registration successful"
          : "Patient registration successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);

    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
};

// ======================================
// LOGIN
// ======================================
const loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Email, password and account type are required",
      });
    }

    const allowedRoles = ["ADMIN", "DOCTOR", "PATIENT"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid account type",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated",
      });
    }

    if (user.role !== role) {
      return res.status(401).json({
        success: false,
        message: `This account is registered as ${user.role}. Please select ${user.role} to login.`,
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);

    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
};
