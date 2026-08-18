// ======================================
// APPOINTMENT BOOKING VALIDATION
// ======================================
const validateAppointmentBooking = (req, res, next) => {
  const { doctor, department, appointmentDate, timeSlot, reasonForVisit } =
    req.body;

  if (!doctor) {
    return res.status(400).json({
      success: false,
      message: "Doctor is required.",
    });
  }

  if (!department) {
    return res.status(400).json({
      success: false,
      message: "Department is required.",
    });
  }

  if (!appointmentDate) {
    return res.status(400).json({
      success: false,
      message: "Appointment date is required.",
    });
  }

  if (!timeSlot) {
    return res.status(400).json({
      success: false,
      message: "Time slot is required.",
    });
  }

  if (!reasonForVisit || !reasonForVisit.trim()) {
    return res.status(400).json({
      success: false,
      message: "Reason for visit is required.",
    });
  }

  next();
};

// ======================================
// EXPORTS
// ======================================
module.exports = {
  validateAppointmentBooking,
};
