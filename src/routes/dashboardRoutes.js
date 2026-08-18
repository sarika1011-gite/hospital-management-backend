const express = require("express");

const { getDashboardOverview } = require("../controllers/dashboardController");

const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// Admin Dashboard Overview
router.get(
  "/",
  protect,
  authorize("ADMIN", "SUPER_ADMIN"),
  getDashboardOverview,
);

module.exports = router;
