const express = require("express");
const router = express.Router();

const {
  getAppointmentReport,
  getDoctorReport,
  getDepartmentReport,
  getDailyAppointmentReport,
} = require("../controllers/reportController");

const { protect, authorize } = require("../middleware/authMiddleware");

// ======================================
// APPOINTMENT REPORT
// ======================================
router.get(
  "/appointments",
  protect,
  authorize("ADMIN", "SUPER_ADMIN"),
  getAppointmentReport,
);

// ======================================
// DOCTOR-WISE REPORT
// ======================================
router.get(
  "/doctors",
  protect,
  authorize("ADMIN", "SUPER_ADMIN"),
  getDoctorReport,
);

// ======================================
// DEPARTMENT-WISE REPORT
// ======================================
router.get(
  "/departments",
  protect,
  authorize("ADMIN", "SUPER_ADMIN"),
  getDepartmentReport,
);

// ======================================
// DAILY APPOINTMENT REPORT
// ======================================
router.get(
  "/daily",
  protect,
  authorize("ADMIN", "SUPER_ADMIN"),
  getDailyAppointmentReport,
);

module.exports = router;
