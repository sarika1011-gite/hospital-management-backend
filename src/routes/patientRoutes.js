const express = require("express");

const {
  getPatients,
  getPatientById,
  getMyPatientProfile,
  createPatient,
  updatePatient,
  deletePatient,
} = require("../controllers/patientController");

const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// ======================================
// MY PROFILE - PATIENT
// Supports /profile and /me
// ======================================
router.get("/profile", protect, authorize("PATIENT"), getMyPatientProfile);

router.get("/me", protect, authorize("PATIENT"), getMyPatientProfile);

// ======================================
// GET ALL PATIENTS - ADMIN ONLY
// ======================================
router.get("/", protect, authorize("ADMIN", "SUPER_ADMIN"), getPatients);

// ======================================
// CREATE PATIENT
// ======================================
router.post("/", protect, authorize("ADMIN", "SUPER_ADMIN"), createPatient);

// ======================================
// GET SINGLE PATIENT
// ADMIN OR SAME PATIENT
// ======================================
router.get(
  "/:id",
  protect,
  authorize("ADMIN", "SUPER_ADMIN", "PATIENT"),
  getPatientById,
);

// ======================================
// UPDATE PATIENT
// ADMIN OR SAME PATIENT
// ======================================
router.put(
  "/:id",
  protect,
  authorize("ADMIN", "SUPER_ADMIN", "PATIENT"),
  updatePatient,
);

// ======================================
// DELETE PATIENT - ADMIN ONLY
// ======================================
router.delete(
  "/:id",
  protect,
  authorize("ADMIN", "SUPER_ADMIN"),
  deletePatient,
);

module.exports = router;
