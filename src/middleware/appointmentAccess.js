const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");

// ======================================
// APPOINTMENT ACCESS CONTROL
// ======================================
const checkAppointmentAccess = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found.",
      });
    }

    // ======================================
    // ADMIN ACCESS
    // ======================================
    if (req.user.role === "ADMIN" || req.user.role === "SUPER_ADMIN") {
      req.appointment = appointment;
      return next();
    }

    // ======================================
    // DOCTOR ACCESS
    // ======================================
    if (req.user.role === "DOCTOR") {
      const doctor = await Doctor.findOne({
        email: req.user.email,
        isActive: true,
      });

      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: "Doctor profile not found.",
        });
      }

      if (appointment.doctor.toString() !== doctor._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "You can only access your own appointments.",
        });
      }

      req.appointment = appointment;
      return next();
    }

    // ======================================
    // PATIENT ACCESS
    // ======================================
    if (req.user.role === "PATIENT") {
      const patient = await Patient.findOne({
        user: req.user._id,
        isActive: true,
      });

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: "Patient profile not found.",
        });
      }

      if (appointment.patient.toString() !== patient._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "You can only access your own appointments.",
        });
      }

      req.appointment = appointment;
      return next();
    }

    return res.status(403).json({
      success: false,
      message: "You do not have permission to access this appointment.",
    });
  } catch (error) {
    console.error("Appointment access error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to verify appointment access.",
    });
  }
};

module.exports = {
  checkAppointmentAccess,
};
