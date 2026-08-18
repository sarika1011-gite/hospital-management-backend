const Appointment = require("../models/Appointment");

// ======================================
// VALIDATE APPOINTMENT BOOKING
// ======================================
const validateAppointmentBooking = async (req, res, next) => {
  try {
    const { appointmentDate, timeSlot, doctor, patient } = req.body;

    // ======================================
    // REQUIRED FIELDS
    // ======================================
    if (!appointmentDate || !timeSlot || !doctor || !patient) {
      return res.status(400).json({
        success: false,
        message:
          "Appointment date, time slot, doctor and patient are required.",
      });
    }

    // ======================================
    // DATE VALIDATION
    // ======================================
    const selectedDate = new Date(appointmentDate);

    if (isNaN(selectedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment date.",
      });
    }

    // ======================================
    // PAST DATE VALIDATION
    // ======================================
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const bookingDate = new Date(selectedDate);
    bookingDate.setHours(0, 0, 0, 0);

    if (bookingDate < today) {
      return res.status(400).json({
        success: false,
        message: "Appointment cannot be booked for a past date.",
      });
    }

    // ======================================
    // PAST TIME VALIDATION
    // Only for today's date
    // ======================================
    if (bookingDate.getTime() === today.getTime()) {
      const now = new Date();

      const timeMatch = String(timeSlot).match(
        /^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i,
      );

      if (timeMatch) {
        let hours = parseInt(timeMatch[1], 10);
        const minutes = parseInt(timeMatch[2], 10);
        const period = timeMatch[3];

        if (period) {
          if (period.toUpperCase() === "PM" && hours !== 12) {
            hours += 12;
          }

          if (period.toUpperCase() === "AM" && hours === 12) {
            hours = 0;
          }
        }

        const appointmentTime = new Date();
        appointmentTime.setHours(hours, minutes, 0, 0);

        if (appointmentTime <= now) {
          return res.status(400).json({
            success: false,
            message: "Appointment time must be in the future.",
          });
        }
      }
    }

    // ======================================
    // DOUBLE BOOKING CHECK
    // Same doctor + same date + same time
    // ======================================
    const startOfDay = new Date(bookingDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(bookingDate);
    endOfDay.setHours(23, 59, 59, 999);

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
        message:
          "This doctor already has an appointment for the selected date and time.",
      });
    }

    // ======================================
    // SAME PATIENT DOUBLE BOOKING
    // ======================================
    const patientAppointment = await Appointment.findOne({
      patient,
      appointmentDate: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      timeSlot,
      status: {
        $nin: ["CANCELLED", "COMPLETED"],
      },
    });

    if (patientAppointment) {
      return res.status(409).json({
        success: false,
        message:
          "You already have an appointment for the selected date and time.",
      });
    }

    next();
  } catch (error) {
    console.error("Appointment validation error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to validate appointment booking.",
    });
  }
};

// ======================================
// PREVENT COMPLETED APPOINTMENT MODIFICATION
// ======================================
const preventCompletedAppointmentModification = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found.",
      });
    }

    if (appointment.status === "COMPLETED") {
      return res.status(400).json({
        success: false,
        message: "Completed appointment cannot be modified.",
      });
    }

    next();
  } catch (error) {
    console.error("Appointment modification validation error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to validate appointment modification.",
    });
  }
};

// ======================================
// PREVENT COMPLETED APPOINTMENT CANCELLATION
// ======================================
const preventCompletedAppointmentCancellation = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found.",
      });
    }

    if (appointment.status === "COMPLETED") {
      return res.status(400).json({
        success: false,
        message: "Completed appointment cannot be cancelled.",
      });
    }

    next();
  } catch (error) {
    console.error("Appointment cancellation validation error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to validate appointment cancellation.",
    });
  }
};

module.exports = {
  validateAppointmentBooking,
  preventCompletedAppointmentModification,
  preventCompletedAppointmentCancellation,
};
