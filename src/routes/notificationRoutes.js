const express = require("express");

const router = express.Router();

const {
  createNotification,
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} = require("../controllers/notificationController");

const { protect, authorize } = require("../middleware/authMiddleware");

// Create notification
router.post(
  "/",
  protect,
  authorize("ADMIN", "SUPER_ADMIN"),
  createNotification,
);

// Get logged-in user's notifications
router.get("/my", protect, getMyNotifications);

// Mark all as read
router.put("/read-all", protect, markAllNotificationsAsRead);

// Mark single notification as read
router.put("/:id/read", protect, markNotificationAsRead);

// Delete notification
router.delete("/:id", protect, deleteNotification);

module.exports = router;
