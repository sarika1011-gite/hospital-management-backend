const express = require("express");
const router = express.Router();

const {
  createPrescription,
  getPrescriptionByAppointment,
  getMyPrescriptions,
  deletePrescription,
} = require("../controllers/prescriptionController");

const { protect } = require("../middleware/authMiddleware");

// =====================================================
// ROLE CHECK MIDDLEWARE
// =====================================================
const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    next();
  };
};

// =====================================================
// CREATE PRESCRIPTION
// DOCTOR / ADMIN / SUPER_ADMIN
// =====================================================
router.post(
  "/",
  protect,
  allowRoles("DOCTOR", "ADMIN", "SUPER_ADMIN"),
  createPrescription,
);

// =====================================================
// GET MY PRESCRIPTIONS
// PATIENT
// =====================================================
router.get("/my", protect, allowRoles("PATIENT"), getMyPrescriptions);

// =====================================================
// GET PRESCRIPTION BY APPOINTMENT
// IMPORTANT: BEFORE /:id
// =====================================================
router.get(
  "/:appointmentId",
  protect,
  allowRoles("DOCTOR", "PATIENT", "ADMIN", "SUPER_ADMIN"),
  getPrescriptionByAppointment,
);

// =====================================================
// DELETE PRESCRIPTION
// =====================================================
router.delete(
  "/:id",
  protect,
  allowRoles("DOCTOR", "ADMIN", "SUPER_ADMIN"),
  deletePrescription,
);

module.exports = router;
