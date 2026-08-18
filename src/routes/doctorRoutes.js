const express = require("express");

const {
  getDoctors,
  getDoctorById,
  getMyDoctorProfile,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} = require("../controllers/doctorController");

const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// ======================================
// GET ALL DOCTORS
// Public / Logged-in users
// ======================================
router.get("/", getDoctors);

// ======================================
// MY DOCTOR PROFILE
// DOCTOR LOGIN
// ======================================
router.get("/me", protect, authorize("DOCTOR"), getMyDoctorProfile);

// ======================================
// GET SINGLE DOCTOR
// ======================================
router.get("/:id", getDoctorById);

// ======================================
// CREATE DOCTOR
// ADMIN / SUPER ADMIN
// ======================================
router.post("/", protect, authorize("ADMIN", "SUPER_ADMIN"), createDoctor);

// ======================================
// UPDATE DOCTOR
// ADMIN / SUPER ADMIN
// ======================================
router.put("/:id", protect, authorize("ADMIN", "SUPER_ADMIN"), updateDoctor);

// ======================================
// DELETE DOCTOR
// ADMIN / SUPER ADMIN
// ======================================
router.delete("/:id", protect, authorize("ADMIN", "SUPER_ADMIN"), deleteDoctor);

module.exports = router;
