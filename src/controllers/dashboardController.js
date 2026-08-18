const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const Department = require("../models/Department");
const Appointment = require("../models/Appointment");

// ======================================
// GET DASHBOARD OVERVIEW
// ======================================
const getDashboardOverview = async (req, res) => {
  try {
    const today = new Date();

    const startOfToday = new Date(today);
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    const [
      totalUsers,
      totalDoctors,
      totalPatients,
      totalDepartments,
      totalAppointments,
      bookedAppointments,
      checkedInAppointments,
      waitingAppointments,
      inConsultationAppointments,
      completedAppointments,
      cancelledAppointments,
      todayAppointments,
    ] = await Promise.all([
      User.countDocuments(),

      Doctor.countDocuments({
        isActive: true,
      }),

      Patient.countDocuments({
        isActive: true,
      }),

      Department.countDocuments({
        status: "Active",
      }),

      Appointment.countDocuments(),

      Appointment.countDocuments({
        status: "BOOKED",
      }),

      Appointment.countDocuments({
        status: "CHECKED_IN",
      }),

      Appointment.countDocuments({
        status: "WAITING",
      }),

      Appointment.countDocuments({
        status: "IN_CONSULTATION",
      }),

      Appointment.countDocuments({
        status: "COMPLETED",
      }),

      Appointment.countDocuments({
        status: "CANCELLED",
      }),

      Appointment.countDocuments({
        appointmentDate: {
          $gte: startOfToday,
          $lte: endOfToday,
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      message: "Dashboard data fetched successfully.",

      dashboard: {
        users: {
          total: totalUsers,
        },

        doctors: {
          total: totalDoctors,
        },

        patients: {
          total: totalPatients,
        },

        departments: {
          total: totalDepartments,
        },

        appointments: {
          total: totalAppointments,
          booked: bookedAppointments,
          checkedIn: checkedInAppointments,
          waiting: waitingAppointments,
          inConsultation: inConsultationAppointments,
          completed: completedAppointments,
          cancelled: cancelledAppointments,
          today: todayAppointments,
        },
      },
    });
  } catch (error) {
    console.error("Dashboard Overview Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data.",
    });
  }
};

module.exports = {
  getDashboardOverview,
};
