const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");

// ======================================
// CHECK DOCTOR AVAILABILITY
// ======================================
const checkDoctorAvailability = async (req, res, next) => {
  try {
    const { doctor, appointmentDate, timeSlot } = req.body;

    if (!doctor || !appointmentDate || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: "Doctor, appointment date and time slot are required.",
      });
    }

    // ======================================
    // CHECK DOCTOR
    // ======================================
    const doctorRecord = await Doctor.findById(doctor);

    if (!doctorRecord || !doctorRecord.isActive) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found or inactive.",
      });
    }

    // ======================================
    // DATE RANGE
    // ======================================
    const selectedDate = new Date(appointmentDate);

    if (isNaN(selectedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment date.",
      });
    }

    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    // ======================================
    // CHECK EXISTING APPOINTMENT
    // ======================================
    const existingAppointment = await Appointment.findOne({
      doctor,
      appointmentDate: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      timeSlot,
      status: {
        $nin: ["CANCELLED", "COMPLETED"],
      },
    });

    if (existingAppointment) {
      return res.status(409).json({
        success: false,
        available: false,
        message: "Doctor is not available for the selected date and time.",
      });
    }

    // ======================================
    // AVAILABLE
    // ======================================
    req.doctorAvailable = true;

    next();
  } catch (error) {
    console.error("Doctor availability error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to check doctor availability.",
    });
  }
};

module.exports = {
  checkDoctorAvailability,
};
