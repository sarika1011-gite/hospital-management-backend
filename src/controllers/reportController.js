const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const Department = require("../models/Department");

// ======================================
// APPOINTMENT REPORT
// ======================================
const getAppointmentReport = async (req, res) => {
  try {
    const { startDate, endDate, doctor, department, status } = req.query;

    const filter = {};

    // Date filter
    if (startDate || endDate) {
      filter.appointmentDate = {};

      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        filter.appointmentDate.$gte = start;
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.appointmentDate.$lte = end;
      }
    }

    // Doctor filter
    if (doctor) {
      filter.doctor = doctor;
    }

    // Department filter
    if (department) {
      filter.department = department;
    }

    // Status filter
    if (status) {
      filter.status = status;
    }

    const appointments = await Appointment.find(filter)
      .populate("patient")
      .populate("doctor")
      .populate("department")
      .sort({
        appointmentDate: -1,
        createdAt: -1,
      });

    const total = appointments.length;

    const completed = appointments.filter(
      (item) => item.status === "COMPLETED",
    ).length;

    const cancelled = appointments.filter(
      (item) => item.status === "CANCELLED",
    ).length;

    const booked = appointments.filter(
      (item) => item.status === "BOOKED",
    ).length;

    const waiting = appointments.filter(
      (item) => item.status === "WAITING",
    ).length;

    const inConsultation = appointments.filter(
      (item) => item.status === "IN_CONSULTATION",
    ).length;

    const checkedIn = appointments.filter(
      (item) => item.status === "CHECKED_IN",
    ).length;

    res.status(200).json({
      success: true,
      report: {
        total,
        booked,
        checkedIn,
        waiting,
        inConsultation,
        completed,
        cancelled,
      },
      appointments,
    });
  } catch (error) {
    console.error("Appointment report error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to generate appointment report.",
    });
  }
};

// ======================================
// DOCTOR-WISE REPORT
// ======================================
const getDoctorReport = async (req, res) => {
  try {
    const doctors = await Doctor.find({ isActive: true })
      .populate("department")
      .sort({ name: 1 });

    const report = await Promise.all(
      doctors.map(async (doctor) => {
        const appointments = await Appointment.find({
          doctor: doctor._id,
        });

        return {
          doctorId: doctor._id,
          doctorName: doctor.name,
          department: doctor.department?.name || "N/A",
          totalAppointments: appointments.length,
          completed: appointments.filter((item) => item.status === "COMPLETED")
            .length,
          cancelled: appointments.filter((item) => item.status === "CANCELLED")
            .length,
          booked: appointments.filter((item) => item.status === "BOOKED")
            .length,
        };
      }),
    );

    res.status(200).json({
      success: true,
      count: report.length,
      report,
    });
  } catch (error) {
    console.error("Doctor report error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to generate doctor report.",
    });
  }
};

// ======================================
// DEPARTMENT-WISE REPORT
// ======================================
const getDepartmentReport = async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });

    const report = await Promise.all(
      departments.map(async (department) => {
        const appointments = await Appointment.find({
          department: department._id,
        });

        return {
          departmentId: department._id,
          departmentName: department.name,
          totalAppointments: appointments.length,
          completed: appointments.filter((item) => item.status === "COMPLETED")
            .length,
          cancelled: appointments.filter((item) => item.status === "CANCELLED")
            .length,
          booked: appointments.filter((item) => item.status === "BOOKED")
            .length,
        };
      }),
    );

    res.status(200).json({
      success: true,
      count: report.length,
      report,
    });
  } catch (error) {
    console.error("Department report error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to generate department report.",
    });
  }
};

// ======================================
// DAILY APPOINTMENT REPORT
// ======================================
const getDailyAppointmentReport = async (req, res) => {
  try {
    const date = req.query.date ? new Date(req.query.date) : new Date();

    date.setHours(0, 0, 0, 0);

    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const appointments = await Appointment.find({
      appointmentDate: {
        $gte: date,
        $lt: nextDate,
      },
    })
      .populate("patient")
      .populate("doctor")
      .populate("department")
      .sort({ timeSlot: 1 });

    res.status(200).json({
      success: true,
      date: date.toISOString().split("T")[0],
      total: appointments.length,
      appointments,
    });
  } catch (error) {
    console.error("Daily appointment report error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to generate daily appointment report.",
    });
  }
};

module.exports = {
  getAppointmentReport,
  getDoctorReport,
  getDepartmentReport,
  getDailyAppointmentReport,
};
