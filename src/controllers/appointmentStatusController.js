const Appointment = require("../models/Appointment");

// ======================================
// UPDATE APPOINTMENT STATUS
// ======================================
const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "BOOKED",
      "CHECKED_IN",
      "WAITING",
      "IN_CONSULTATION",
      "COMPLETED",
      "CANCELLED",
    ];

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required.",
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment status.",
      });
    }

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found.",
      });
    }

    // Completed appointments cannot be changed
    if (appointment.status === "COMPLETED") {
      return res.status(400).json({
        success: false,
        message: "Completed appointment cannot be modified.",
      });
    }

    // Cancelled appointments cannot be changed
    if (appointment.status === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message: "Cancelled appointment cannot be modified.",
      });
    }

    // Valid status transitions
    const transitions = {
      BOOKED: ["CHECKED_IN", "CANCELLED"],
      CHECKED_IN: ["WAITING", "CANCELLED"],
      WAITING: ["IN_CONSULTATION", "CANCELLED"],
      IN_CONSULTATION: ["COMPLETED"],
    };

    const currentStatus = appointment.status;

    if (
      transitions[currentStatus] &&
      !transitions[currentStatus].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${currentStatus} to ${status}.`,
      });
    }

    appointment.status = status;

    if (status === "IN_CONSULTATION") {
      appointment.consultationStartedAt = new Date();
    }

    if (status === "COMPLETED") {
      appointment.completedAt = new Date();
    }

    await appointment.save();

    const updatedAppointment = await Appointment.findById(id)
      .populate("patient")
      .populate("doctor")
      .populate("department");

    return res.status(200).json({
      success: true,
      message: "Appointment status updated successfully.",
      appointment: updatedAppointment,
    });
  } catch (error) {
    console.error("Update appointment status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update appointment status.",
    });
  }
};

module.exports = {
  updateAppointmentStatus,
};
