const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");

// =====================================================
// CREATE APPOINTMENT
// =====================================================
const createAppointment = async (req, res) => {
  try {
    const {
      doctor,
      patient,
      department,

      // Frontend / Model fields
      appointmentDate,
      timeSlot,
      reasonForVisit,

      // Optional fields
      symptoms,
      notes,

      // Backward-compatible fields
      date,
      time,
      reason,
    } = req.body;

    // =================================================
    // FINAL VALUES
    // =================================================
    const finalDate = appointmentDate || date;
    const finalTime = timeSlot || time;
    const finalReason = reasonForVisit || reason || "";

    // =================================================
    // PATIENT
    // =================================================
    const finalPatient =
      patient || (req.user.role === "PATIENT" ? req.user._id : null);

    if (!finalPatient) {
      return res.status(400).json({
        success: false,
        message: "Patient is required",
      });
    }

    // =================================================
    // DOCTOR
    // =================================================
    if (!doctor) {
      return res.status(400).json({
        success: false,
        message: "Doctor is required",
      });
    }

    // =================================================
    // DEPARTMENT
    // =================================================
    if (!department) {
      return res.status(400).json({
        success: false,
        message: "Department is required",
      });
    }

    // =================================================
    // DATE
    // =================================================
    if (!finalDate) {
      return res.status(400).json({
        success: false,
        message: "Appointment date is required",
      });
    }

    // =================================================
    // TIME
    // =================================================
    if (!finalTime) {
      return res.status(400).json({
        success: false,
        message: "Appointment time is required",
      });
    }

    // =================================================
    // REASON
    // =================================================
    if (!finalReason.trim()) {
      return res.status(400).json({
        success: false,
        message: "Reason for visit is required",
      });
    }

    // =================================================
    // VALIDATE DATE
    // =================================================
    const bookingDate = new Date(finalDate);

    if (isNaN(bookingDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment date",
      });
    }

    bookingDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // =================================================
    // NO PAST DATE
    // =================================================
    if (bookingDate < today) {
      return res.status(400).json({
        success: false,
        message: "Cannot book appointment for a past date",
      });
    }

    // =================================================
    // CHECK DOCTOR
    // =================================================
    const doctorExists = await Doctor.findById(doctor);

    if (!doctorExists) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // =================================================
    // CHECK DOCTOR AVAILABILITY
    // =================================================
    if (doctorExists.isActive === false || doctorExists.isAvailable === false) {
      return res.status(400).json({
        success: false,
        message: "Doctor is currently unavailable",
      });
    }

    // =================================================
    // CHECK EXISTING APPOINTMENT
    // =================================================
    const existingAppointment = await Appointment.findOne({
      doctor,
      appointmentDate: finalDate,
      timeSlot: finalTime,
      status: {
        $nin: ["CANCELLED"],
      },
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: "Doctor is already booked for this time",
      });
    }

    // =================================================
    // CREATE APPOINTMENT
    // IMPORTANT:
    // Use exact Appointment model field names
    // =================================================
    const appointment = await Appointment.create({
      doctor,
      patient: finalPatient,
      department,

      appointmentDate: finalDate,
      timeSlot: finalTime,
      reasonForVisit: finalReason.trim(),

      symptoms: symptoms || "",
      notes: notes || "",

      status: "BOOKED",
    });

    // =================================================
    // POPULATE
    // =================================================
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate("patient", "name email phone")
      .populate("doctor", "name email")
      .populate("department", "name");

    // =================================================
    // SUCCESS
    // =================================================
    return res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      appointment: populatedAppointment,
    });
  } catch (error) {
    console.error("CREATE APPOINTMENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create appointment",
    });
  }
};

// =====================================================
// GET MY APPOINTMENTS
// =====================================================
const getMyAppointments = async (req, res) => {
  try {
    let query = {};

    // =================================================
    // PATIENT
    // =================================================
    if (req.user.role === "PATIENT") {
      query.patient = req.user._id;
    }

    // =================================================
    // DOCTOR
    // =================================================
    else if (req.user.role === "DOCTOR") {
      const doctor = await Doctor.findOne({
        $or: [
          { user: req.user._id },
          { userId: req.user._id },
          { email: req.user.email },
        ],
      });

      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: "Doctor profile not found",
        });
      }

      query.doctor = doctor._id;
    }

    // =================================================
    // ADMIN / SUPER_ADMIN
    // =================================================
    else if (req.user.role === "ADMIN" || req.user.role === "SUPER_ADMIN") {
      query = {};
    } else {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view appointments",
      });
    }

    console.log("GET MY APPOINTMENTS");
    console.log("ROLE:", req.user.role);
    console.log("USER ID:", req.user._id);
    console.log("QUERY:", query);

    // =================================================
    // FETCH APPOINTMENTS
    // =================================================
    const appointments = await Appointment.find(query)
      .populate("patient", "name email phone")
      .populate("doctor", "name email")
      .populate("department", "name")
      .sort({
        appointmentDate: 1,
        timeSlot: 1,
      });

    return res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    console.error("GET MY APPOINTMENTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch appointments",
    });
  }
};

// =====================================================
// GET APPOINTMENT BY ID
// =====================================================
const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("patient", "name email phone")
      .populate("doctor", "name email")
      .populate("department", "name");

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    return res.status(200).json({
      success: true,
      appointment,
    });
  } catch (error) {
    console.error("GET APPOINTMENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch appointment",
    });
  }
};

// =====================================================
// UPDATE APPOINTMENT STATUS
// =====================================================
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "BOOKED",
      "CHECKED_IN",
      "WAITING",
      "IN_CONSULTATION",
      "COMPLETED",
      "CANCELLED",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment status",
      });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // =================================================
    // DOCTOR CHECK
    // =================================================
    if (req.user.role === "DOCTOR") {
      const doctor = await Doctor.findOne({
        $or: [
          { user: req.user._id },
          { userId: req.user._id },
          { email: req.user.email },
        ],
      });

      if (!doctor || appointment.doctor.toString() !== doctor._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "You can only update your own appointments",
        });
      }
    }

    // =================================================
    // UPDATE STATUS
    // =================================================
    appointment.status = status;

    await appointment.save();

    // =================================================
    // POPULATE
    // =================================================
    const updatedAppointment = await Appointment.findById(appointment._id)
      .populate("patient", "name email phone")
      .populate("doctor", "name email")
      .populate("department", "name");

    return res.status(200).json({
      success: true,
      message: "Appointment status updated successfully",
      appointment: updatedAppointment,
    });
  } catch (error) {
    console.error("UPDATE APPOINTMENT STATUS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update appointment status",
    });
  }
};

// =====================================================
// EXPORT
// =====================================================
module.exports = {
  createAppointment,
  getMyAppointments,
  getAppointmentById,
  updateAppointmentStatus,
};
