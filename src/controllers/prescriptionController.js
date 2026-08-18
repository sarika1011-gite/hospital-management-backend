const Prescription = require("../models/Prescription");
const Appointment = require("../models/Appointment");

// =====================================================
// CREATE PRESCRIPTION
// =====================================================
const createPrescription = async (req, res) => {
  try {
    const {
      appointment,
      appointmentId,
      patient,
      doctor,
      diagnosis,
      medicines,
      notes,
    } = req.body;

    console.log("=================================");
    console.log("CREATE PRESCRIPTION");
    console.log("BODY:", JSON.stringify(req.body, null, 2));
    console.log("=================================");

    const finalAppointmentId = appointment || appointmentId;

    if (!finalAppointmentId) {
      return res.status(400).json({
        success: false,
        message: "Appointment ID is required",
      });
    }

    // -------------------------------------------------
    // Find appointment
    // -------------------------------------------------
    const appointmentData = await Appointment.findById(finalAppointmentId);

    if (!appointmentData) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // -------------------------------------------------
    // Doctor
    // -------------------------------------------------
    const finalDoctor = doctor || appointmentData.doctor || req.user?._id;

    // -------------------------------------------------
    // Patient
    // -------------------------------------------------
    const finalPatient = patient || appointmentData.patient;

    if (!finalDoctor) {
      return res.status(400).json({
        success: false,
        message: "Doctor is required",
      });
    }

    if (!finalPatient) {
      return res.status(400).json({
        success: false,
        message: "Patient is required",
      });
    }

    // -------------------------------------------------
    // Medicines validation
    // -------------------------------------------------
    if (!Array.isArray(medicines) || medicines.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one medicine is required",
      });
    }

    // -------------------------------------------------
    // Validate every medicine
    // -------------------------------------------------
    for (let i = 0; i < medicines.length; i++) {
      const med = medicines[i];

      if (!med.medicine || !med.medicine.trim()) {
        return res.status(400).json({
          success: false,
          message: `Medicine is required for medicine ${i + 1}`,
        });
      }

      if (!med.dosage || !med.dosage.trim()) {
        return res.status(400).json({
          success: false,
          message: `Dosage is required for medicine ${i + 1}`,
        });
      }

      if (!med.frequency || !med.frequency.trim()) {
        return res.status(400).json({
          success: false,
          message: `Frequency is required for medicine ${i + 1}`,
        });
      }

      if (!med.duration || !med.duration.trim()) {
        return res.status(400).json({
          success: false,
          message: `Duration is required for medicine ${i + 1}`,
        });
      }
    }

    // -------------------------------------------------
    // Create prescription
    // -------------------------------------------------
    const prescription = await Prescription.create({
      appointment: finalAppointmentId,
      doctor: finalDoctor,
      patient: finalPatient,

      diagnosis: diagnosis || "",

      medicines: medicines.map((med) => ({
        medicine: med.medicine,
        dosage: med.dosage,
        frequency: med.frequency,
        duration: med.duration,
        instructions: med.instructions || "",
      })),

      notes: notes || "",
    });

    console.log("PRESCRIPTION CREATED:", prescription._id);

    return res.status(201).json({
      success: true,
      message: "Prescription created successfully",
      prescription,
    });
  } catch (error) {
    console.error("CREATE PRESCRIPTION ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create prescription",
    });
  }
};

// =====================================================
// GET PRESCRIPTION BY APPOINTMENT
// =====================================================
const getPrescriptionByAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const prescription = await Prescription.findOne({
      appointment: appointmentId,
    })
      .populate("doctor", "name email")
      .populate("patient", "name email")
      .populate("appointment");

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    return res.status(200).json({
      success: true,
      prescription,
    });
  } catch (error) {
    console.error("GET PRESCRIPTION ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch prescription",
    });
  }
};

// =====================================================
// GET MY PRESCRIPTIONS
// =====================================================
const getMyPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({
      patient: req.user._id,
    })
      .populate("doctor", "name email")
      .populate("appointment")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      prescriptions,
    });
  } catch (error) {
    console.error("GET MY PRESCRIPTIONS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch prescriptions",
    });
  }
};

// =====================================================
// DELETE PRESCRIPTION
// =====================================================
const deletePrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    await prescription.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Prescription deleted successfully",
    });
  } catch (error) {
    console.error("DELETE PRESCRIPTION ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete prescription",
    });
  }
};

module.exports = {
  createPrescription,
  getPrescriptionByAppointment,
  getMyPrescriptions,
  deletePrescription,
};
