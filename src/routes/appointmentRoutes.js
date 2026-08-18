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
// =====================================================
router.post("/", protect, createAppointment);

// =====================================================
// MY APPOINTMENTS
// =====================================================
router.get("/my", protect, getMyAppointments);

// =====================================================
// DOCTOR APPOINTMENTS
// IMPORTANT: MUST COME BEFORE /:id
// =====================================================
router.get("/doctor", protect, getMyAppointments);

// =====================================================
// GET SINGLE APPOINTMENT
// MUST BE AFTER ALL STATIC ROUTES
// =====================================================
router.get("/:id", protect, getAppointmentById);

// =====================================================
// UPDATE STATUS
// =====================================================
router.patch("/:id/status", protect, updateAppointmentStatus);

module.exports = router;
