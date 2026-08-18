const express = require("express");
const router = express.Router();

const {
  getConsultation,
  startConsultation,
  completeConsultation,
} = require("../controllers/consultationController");

const { protect, authorize } = require("../middleware/authMiddleware");

// ======================================
// GET CONSULTATION DETAILS
// GET /api/consultations/:appointmentId
// ======================================
router.get(
  "/:appointmentId",
  protect,
  authorize("DOCTOR", "ADMIN", "SUPER_ADMIN"),
  getConsultation,
);

// ======================================
// START CONSULTATION
// POST /api/consultations/:appointmentId/start
// ======================================
router.post(
  "/:appointmentId/start",
  protect,
  authorize("DOCTOR"),
  startConsultation,
);

// ======================================
// COMPLETE CONSULTATION
// POST /api/consultations/:appointmentId/complete
// ======================================
router.post(
  "/:appointmentId/complete",
  protect,
  authorize("DOCTOR"),
  completeConsultation,
);

module.exports = router;
