const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");

// ======================================
// HELPER - FIND LOGGED-IN DOCTOR
// ======================================
const getLoggedInDoctor = async (req) => {
  // First priority: linked User ID
  let doctor = await Doctor.findOne({
    user: req.user._id,
    isActive: true,
  });

  // Fallback: email
  if (!doctor && req.user.email) {
    doctor = await Doctor.findOne({
      email: req.user.email.toLowerCase(),
      isActive: true,
    });
  }

  return doctor;
};

// ======================================
// GET CONSULTATION
// GET /api/consultations/:appointmentId
// ======================================
const getConsultation = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findById(appointmentId)
      .populate("patient")
      .populate("doctor")
      .populate("department");

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found.",
      });
    }

    // DOCTOR ACCESS CHECK
    if (req.user.role === "DOCTOR") {
      const doctor = await getLoggedInDoctor(req);

      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: "Doctor profile not found.",
        });
      }

      if (
        !appointment.doctor ||
        appointment.doctor._id.toString() !== doctor._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "You can only access your own consultation.",
        });
      }
    }

    return res.status(200).json({
      success: true,
      consultation: appointment,
    });
  } catch (error) {
    console.error("GET CONSULTATION ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch consultation.",
      error: error.message,
    });
  }
};

// ======================================
// START CONSULTATION
// POST /api/consultations/:appointmentId/start
// ======================================
const startConsultation = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const doctor = await getLoggedInDoctor(req);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found.",
      });
    }

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found.",
      });
    }

    // OWN APPOINTMENT CHECK
    if (
      !appointment.doctor ||
      appointment.doctor.toString() !== doctor._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only start your own consultation.",
      });
    }

    // VALID STATUS
    if (!["BOOKED", "CHECKED_IN", "WAITING"].includes(appointment.status)) {
      return res.status(400).json({
        success: false,
        message: `Consultation cannot be started from ${appointment.status} status.`,
      });
    }

    appointment.status = "IN_CONSULTATION";
    appointment.consultationStartedAt = new Date();

    await appointment.save();

    const updatedAppointment = await Appointment.findById(appointmentId)
      .populate("patient")
      .populate("doctor")
      .populate("department");

    return res.status(200).json({
      success: true,
      message: "Consultation started successfully.",
      appointment: updatedAppointment,
    });
  } catch (error) {
    console.error("START CONSULTATION ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to start consultation.",
      error: error.message,
    });
  }
};

// ======================================
// COMPLETE CONSULTATION
// POST /api/consultations/:appointmentId/complete
// ======================================
const completeConsultation = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const doctor = await getLoggedInDoctor(req);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found.",
      });
    }

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found.",
      });
    }

    // OWN APPOINTMENT CHECK
    if (
      !appointment.doctor ||
      appointment.doctor.toString() !== doctor._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only complete your own consultation.",
      });
    }

    // STATUS CHECK
    if (appointment.status !== "IN_CONSULTATION") {
      return res.status(400).json({
        success: false,
        message: "Only an ongoing consultation can be completed.",
      });
    }

    appointment.status = "COMPLETED";
    appointment.completedAt = new Date();

    await appointment.save();

    const updatedAppointment = await Appointment.findById(appointmentId)
      .populate("patient")
      .populate("doctor")
      .populate("department");

    return res.status(200).json({
      success: true,
      message: "Consultation completed successfully.",
      appointment: updatedAppointment,
    });
  } catch (error) {
    console.error("COMPLETE CONSULTATION ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to complete consultation.",
      error: error.message,
    });
  }
};

module.exports = {
  getConsultation,
  startConsultation,
  completeConsultation,
};
