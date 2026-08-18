const bcrypt = require("bcryptjs");

const Doctor = require("../models/Doctor");
const User = require("../models/User");
const Department = require("../models/Department");

// ======================================
// GET ALL DOCTORS
// ======================================
const getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ isActive: true })
      .populate("department", "name description status")
      .populate("user", "name email phone role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: doctors.length,
      doctors,
    });
  } catch (error) {
    console.error("Get doctors error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch doctors.",
    });
  }
};

// ======================================
// GET SINGLE DOCTOR
// ======================================
const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate("department", "name description status")
      .populate("user", "name email phone role");

    if (!doctor || !doctor.isActive) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found.",
      });
    }

    res.status(200).json({
      success: true,
      doctor,
    });
  } catch (error) {
    console.error("Get doctor error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch doctor.",
    });
  }
};

// ======================================
// GET LOGGED-IN DOCTOR PROFILE
// ======================================
const getMyDoctorProfile = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated.",
      });
    }

    let doctor = await Doctor.findOne({
      user: userId,
      isActive: true,
    })
      .populate("department", "name description status")
      .populate("user", "name email phone role");

    // ======================================
    // FALLBACK:
    // If Doctor.user is missing, find by login email
    // and automatically link the Doctor profile.
    // ======================================
    if (!doctor) {
      const user = await User.findById(userId);

      if (user?.email) {
        doctor = await Doctor.findOne({
          email: user.email.toLowerCase(),
          isActive: true,
        });

        if (doctor && !doctor.user) {
          doctor.user = user._id;
          await doctor.save();

          doctor = await Doctor.findById(doctor._id)
            .populate("department", "name description status")
            .populate("user", "name email phone role");
        }
      }
    }

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message:
          "Doctor profile not found. Please complete your doctor profile.",
      });
    }

    return res.status(200).json({
      success: true,
      doctor,
    });
  } catch (error) {
    console.error("Get my doctor profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch doctor profile.",
      error: error.message,
    });
  }
};

// ======================================
// CREATE DOCTOR
// ======================================
const createDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      specialization,
      qualification,
      experience,
      department,
      consultationFee,
      profileImage,
      availableDays,
      availableTime,
      password,
    } = req.body;

    if (
      !name ||
      !email ||
      !phone ||
      !specialization ||
      !qualification ||
      experience === undefined ||
      !department ||
      consultationFee === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required doctor details.",
      });
    }

    const departmentExists = await Department.findById(department);

    if (!departmentExists) {
      return res.status(404).json({
        success: false,
        message: "Department not found.",
      });
    }

    const doctorEmail = email.toLowerCase().trim();

    const existingDoctor = await Doctor.findOne({
      email: doctorEmail,
    });

    if (existingDoctor) {
      return res.status(400).json({
        success: false,
        message: "Doctor with this email already exists.",
      });
    }

    const existingUser = await User.findOne({
      email: doctorEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists.",
      });
    }

    const doctorPassword = password || "Doctor@123";

    const hashedPassword = await bcrypt.hash(doctorPassword, 12);

    const user = await User.create({
      name,
      email: doctorEmail,
      password: hashedPassword,
      phone,
      role: "DOCTOR",
      isActive: true,
    });

    const doctor = await Doctor.create({
      user: user._id,
      name,
      email: doctorEmail,
      phone,
      specialization,
      qualification,
      experience,
      department,
      consultationFee,
      profileImage: profileImage || "",
      availableDays: Array.isArray(availableDays) ? availableDays : [],
      availableTime: availableTime || "",
      isAvailable: true,
      isActive: true,
    });

    const populatedDoctor = await Doctor.findById(doctor._id)
      .populate("department", "name description status")
      .populate("user", "name email phone role");

    res.status(201).json({
      success: true,
      message: "Doctor created successfully.",
      doctor: populatedDoctor,
      loginDetails: {
        email: doctorEmail,
        password: doctorPassword,
        role: "DOCTOR",
      },
    });
  } catch (error) {
    console.error("Create doctor error:", error);

    // If User was created but Doctor failed,
    // avoid leaving an unusable login account.
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A doctor or user with this email already exists.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create doctor.",
      error: error.message,
    });
  }
};

// ======================================
// UPDATE DOCTOR
// ======================================
const updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found.",
      });
    }

    if (req.body.department !== undefined) {
      const departmentExists = await Department.findById(req.body.department);

      if (!departmentExists) {
        return res.status(404).json({
          success: false,
          message: "Department not found.",
        });
      }

      doctor.department = req.body.department;
    }

    if (req.body.consultationFee !== undefined) {
      doctor.consultationFee = req.body.consultationFee;
    }

    if (req.body.availableDays !== undefined) {
      doctor.availableDays = req.body.availableDays;
    }

    if (req.body.availableTime !== undefined) {
      doctor.availableTime = req.body.availableTime;
    }

    if (req.body.name !== undefined) {
      doctor.name = req.body.name;
    }

    if (req.body.phone !== undefined) {
      doctor.phone = req.body.phone;
    }

    if (req.body.specialization !== undefined) {
      doctor.specialization = req.body.specialization;
    }

    if (req.body.qualification !== undefined) {
      doctor.qualification = req.body.qualification;
    }

    if (req.body.experience !== undefined) {
      doctor.experience = req.body.experience;
    }

    if (req.body.isAvailable !== undefined) {
      doctor.isAvailable = req.body.isAvailable;
    }

    await doctor.save();

    // ======================================
    // UPDATE LINKED USER
    // ======================================
    if (doctor.user) {
      const user = await User.findById(doctor.user);

      if (user) {
        if (req.body.name !== undefined) {
          user.name = req.body.name;
        }

        if (req.body.phone !== undefined) {
          user.phone = req.body.phone;
        }

        await user.save();
      }
    }

    const populatedDoctor = await Doctor.findById(doctor._id)
      .populate("department", "name description status")
      .populate("user", "name email phone role");

    res.status(200).json({
      success: true,
      message: "Doctor updated successfully.",
      doctor: populatedDoctor,
    });
  } catch (error) {
    console.error("Update doctor error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update doctor.",
      error: error.message,
    });
  }
};

// ======================================
// DELETE DOCTOR
// ======================================
const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found.",
      });
    }

    doctor.isActive = false;
    await doctor.save();

    if (doctor.user) {
      await User.findByIdAndUpdate(doctor.user, {
        isActive: false,
      });
    }

    res.status(200).json({
      success: true,
      message: "Doctor deleted successfully.",
    });
  } catch (error) {
    console.error("Delete doctor error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete doctor.",
      error: error.message,
    });
  }
};

module.exports = {
  getDoctors,
  getDoctorById,
  getMyDoctorProfile,
  createDoctor,
  updateDoctor,
  deleteDoctor,
};
