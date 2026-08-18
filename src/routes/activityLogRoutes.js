const express = require("express");

const router = express.Router();

const {
  createActivityLog,
  getActivityLogs,
  getMyActivityLogs,
} = require("../controllers/activityLogController");

const { protect, authorize } = require("../middleware/authMiddleware");

// Create own activity log
router.post("/", protect, createActivityLog);

// Admin can view all logs
router.get("/", protect, authorize("ADMIN", "SUPER_ADMIN"), getActivityLogs);

// Logged-in user can view own logs
router.get("/my", protect, getMyActivityLogs);

module.exports = router;
