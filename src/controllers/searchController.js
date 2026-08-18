const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const Department = require("../models/Department");

// ======================================
// SEARCH DOCTORS
// ======================================
const searchDoctors = async (req, res) => {
  try {
    const { search, department, available } = req.query;

    const filter = {
      isActive: true,
    };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { specialization: { $regex: search, $options: "i" } },
      ];
    }

    if (department) {
      filter.department = department;
    }

    if (available !== undefined) {
      filter.isAvailable = available === "true";
    }

    const doctors = await Doctor.find(filter)
      .populate("department")
      .sort({ name: 1 });

    return res.status(200).json({
      success: true,
      count: doctors.length,
      doctors,
    });
  } catch (error) {
    console.error("Search doctors error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to search doctors.",
    });
  }
};

// ======================================
// SEARCH PATIENTS
// ======================================
const searchPatients = async (req, res) => {
  try {
    const { search, gender } = req.query;

    const filter = {
      isActive: true,
    };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    if (gender) {
      filter.gender = gender;
    }

    const patients = await Patient.find(filter).sort({ name: 1 });

    return res.status(200).json({
      success: true,
      count: patients.length,
      patients,
    });
  } catch (error) {
    console.error("Search patients error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to search patients.",
    });
  }
};

// ======================================
// SEARCH DEPARTMENTS
// ======================================
const searchDepartments = async (req, res) => {
  try {
    const { search, status } = req.query;

    const filter = {};

    if (search) {
      filter.name = {
        $regex: search,
        $options: "i",
      };
    }

    if (status) {
      filter.status = status;
    }

    const departments = await Department.find(filter).sort({
      name: 1,
    });

    return res.status(200).json({
      success: true,
      count: departments.length,
      departments,
    });
  } catch (error) {
    console.error("Search departments error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to search departments.",
    });
  }
};

module.exports = {
  searchDoctors,
  searchPatients,
  searchDepartments,
};
