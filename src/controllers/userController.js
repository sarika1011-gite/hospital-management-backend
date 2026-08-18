const User = require("../models/User");

// ===============================
// GET CURRENT USER
// ===============================
const getMe = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        phone: req.user.phone,
        profileImage: req.user.profileImage,
        isActive: req.user.isActive,
      },
    });
  } catch (error) {
    console.error("Get Me Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to get user profile",
    });
  }
};

// ===============================
// GET ALL PATIENT USERS
// ===============================
const getPatientUsers = async (req, res) => {
  try {
    const patients = await User.find({
      role: "PATIENT",
      isActive: true,
    }).select("_id name email phone");

    res.status(200).json({
      success: true,
      count: patients.length,
      patients,
    });
  } catch (error) {
    console.error("Get patient users error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch patient users.",
    });
  }
};

module.exports = {
  getMe,
  getPatientUsers,
};
