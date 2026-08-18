const Patient = require("../models/Patient");
const User = require("../models/User");

// ======================================
// GET ALL PATIENTS
// ======================================
const getPatients = async (req, res) => {
  try {
    const patients = await Patient.find({ isActive: true })
      .populate("user", "name email phone role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: patients.length,
      patients,
    });
  } catch (error) {
    console.error("Get patients error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch patients.",
    });
  }
};

// ======================================
// GET SINGLE PATIENT
// ======================================
const getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id).populate(
      "user",
      "name email phone role",
    );

    if (!patient || !patient.isActive) {
      return res.status(404).json({
        success: false,
        message: "Patient not found.",
      });
    }

    // Patient can only access own record
    if (req.user.role === "PATIENT") {
      if (!patient.user || String(patient.user._id) !== String(req.user._id)) {
        return res.status(403).json({
          success: false,
          message: "You can only access your own patient record.",
        });
      }
    }

    return res.status(200).json({
      success: true,
      patient,
    });
  } catch (error) {
    console.error("Get patient error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch patient.",
    });
  }
};

// ======================================
// CREATE PATIENT PROFILE
// ======================================
const createPatient = async (req, res) => {
  try {
    const {
      user,
      name,
      age,
      gender,
      mobile,
      email,
      address,
      bloodGroup,
      medicalInformation,
    } = req.body;

    const userId = req.user.role === "PATIENT" ? req.user._id : user;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    const existingUser = await User.findById(userId);

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (existingUser.role !== "PATIENT") {
      return res.status(400).json({
        success: false,
        message: "Patient profile can only be created for a PATIENT user.",
      });
    }

    const existingPatient = await Patient.findOne({
      user: userId,
    });

    if (existingPatient) {
      return res.status(409).json({
        success: false,
        message: "Patient profile already exists.",
        patient: existingPatient,
      });
    }

    const patient = await Patient.create({
      user: userId,
      name: name || existingUser.name,
      age,
      gender,
      mobile: mobile || existingUser.phone,
      email: email || existingUser.email,
      address,
      bloodGroup,
      medicalInformation,
      isActive: true,
    });

    const populatedPatient = await Patient.findById(patient._id).populate(
      "user",
      "name email phone role",
    );

    return res.status(201).json({
      success: true,
      message: "Patient created successfully.",
      patient: populatedPatient,
    });
  } catch (error) {
    console.error("Create patient error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create patient.",
      error: error.message,
    });
  }
};

// ======================================
// UPDATE PATIENT
// ======================================
const updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient || !patient.isActive) {
      return res.status(404).json({
        success: false,
        message: "Patient not found.",
      });
    }

    if (
      req.user.role === "PATIENT" &&
      String(patient.user) !== String(req.user._id)
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own patient record.",
      });
    }

    if (req.body.name !== undefined) {
      patient.name = req.body.name;
    }

    if (req.body.age !== undefined) {
      patient.age = req.body.age;
    }

    if (req.body.gender !== undefined) {
      patient.gender = req.body.gender;
    }

    if (req.body.mobile !== undefined) {
      patient.mobile = req.body.mobile;
    }

    if (req.body.email !== undefined) {
      patient.email = req.body.email.toLowerCase();
    }

    if (req.body.address !== undefined) {
      patient.address = req.body.address;
    }

    if (req.body.bloodGroup !== undefined) {
      patient.bloodGroup = req.body.bloodGroup;
    }

    if (req.body.medicalInformation !== undefined) {
      patient.medicalInformation = req.body.medicalInformation;
    }

    await patient.save();

    const populatedPatient = await Patient.findById(patient._id).populate(
      "user",
      "name email phone role",
    );

    return res.status(200).json({
      success: true,
      message: "Patient updated successfully.",
      patient: populatedPatient,
    });
  } catch (error) {
    console.error("Update patient error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update patient.",
    });
  }
};

// ======================================
// DELETE PATIENT
// ======================================
const deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found.",
      });
    }

    patient.isActive = false;

    await patient.save();

    return res.status(200).json({
      success: true,
      message: "Patient deleted successfully.",
    });
  } catch (error) {
    console.error("Delete patient error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete patient.",
    });
  }
};

// ======================================
// GET MY PATIENT PROFILE
// PATIENT
//
// IMPORTANT:
// If logged-in patient has no Patient
// profile, automatically create one.
// ======================================
const getMyPatientProfile = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not found. Please login again.",
      });
    }

    // ======================================
    // FIND EXISTING PROFILE
    // ======================================
    let patient = await Patient.findOne({
      user: userId,
      isActive: true,
    }).populate("user", "name email phone role");

    // ======================================
    // IF PROFILE DOES NOT EXIST
    // CREATE AUTOMATICALLY
    // ======================================
    if (!patient) {
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }

      if (user.role !== "PATIENT") {
        return res.status(403).json({
          success: false,
          message: "Only patients can access patient profile.",
        });
      }

      patient = await Patient.create({
        user: user._id,
        name: user.name || "",
        email: user.email || "",
        mobile: user.phone || "",
        isActive: true,
      });

      patient = await Patient.findById(patient._id).populate(
        "user",
        "name email phone role",
      );
    }

    // ======================================
    // RETURN PROFILE
    // ======================================
    return res.status(200).json({
      success: true,
      patient,
    });
  } catch (error) {
    console.error("Get my patient profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch patient profile.",
      error: error.message,
    });
  }
};

module.exports = {
  getPatients,
  getPatientById,
  getMyPatientProfile,
  createPatient,
  updatePatient,
  deletePatient,
};
