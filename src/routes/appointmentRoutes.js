const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  createAppointment,
  getMyAppointments,
  getAppointmentById,
  updateAppointmentStatus,
} = require("../controllers/appointmentController");

// =====================================================
// CREATE APPOINTMENT
// POST /api/appointments
// =====================================================
router.post("/", protect, createAppointment);

// =====================================================
// ALL / MY APPOINTMENTS
// GET /api/appointments
//
// PATIENT  -> own appointments
// DOCTOR   -> doctor's appointments
// ADMIN    -> all appointments
// SUPER_ADMIN -> all appointments
// =====================================================
router.get("/", protect, getMyAppointments);

// =====================================================
// MY APPOINTMENTS
// GET /api/appointments/my
// =====================================================
router.get("/my", protect, getMyAppointments);

// =====================================================
// DOCTOR APPOINTMENTS
// GET /api/appointments/doctor
// =====================================================
router.get("/doctor", protect, getMyAppointments);

// =====================================================
// GET SINGLE APPOINTMENT
// GET /api/appointments/:id
//
// IMPORTANT:
// Keep this AFTER static routes such as /my and /doctor.
// =====================================================
router.get("/:id", protect, getAppointmentById);

// =====================================================
// UPDATE APPOINTMENT STATUS
// PATCH /api/appointments/:id/status
// =====================================================
router.patch("/:id/status", protect, updateAppointmentStatus);

module.exports = router;
