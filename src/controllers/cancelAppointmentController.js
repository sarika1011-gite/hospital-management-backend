const Appointment = require("../models/Appointment");

// ======================================
// CANCEL APPOINTMENT
// ======================================
const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found.",
      });
    }

    // Completed appointment cannot be cancelled
    if (appointment.status === "COMPLETED") {
      return res.status(400).json({
        success: false,
        message: "Completed appointment cannot be cancelled.",
      });
    }

    // Already cancelled
    if (appointment.status === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message: "Appointment is already cancelled.",
      });
    }

    // Only BOOKED/CHECKED_IN/WAITING can be cancelled
    if (!["BOOKED", "CHECKED_IN", "WAITING"].includes(appointment.status)) {
      return res.status(400).json({
        success: false,
        message: `Appointment cannot be cancelled from ${appointment.status} status.`,
      });
    }

    appointment.status = "CANCELLED";

    await appointment.save();

    const updatedAppointment = await Appointment.findById(id)
      .populate("patient")
      .populate("doctor")
      .populate("department");

    return res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully.",
      appointment: updatedAppointment,
    });
  } catch (error) {
    console.error("Cancel appointment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to cancel appointment.",
    });
  }
};

module.exports = {
  cancelAppointment,
};
