const express = require("express");
const { getMe, getPatientUsers } = require("../controllers/userController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// Get logged-in user
router.get("/me", protect, getMe);

// Get all PATIENT users - Admin only
router.get(
  "/patients",
  protect,
  authorize("ADMIN", "SUPER_ADMIN"),
  getPatientUsers,
);

module.exports = router;
