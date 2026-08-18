const Notification = require("../models/Notification");

// ======================================
// CREATE NOTIFICATION
// ======================================
const createNotification = async (req, res) => {
  try {
    const { user, title, message, type, relatedId } = req.body;

    if (!user || !title || !message) {
      return res.status(400).json({
        success: false,
        message: "User, title and message are required.",
      });
    }

    const notification = await Notification.create({
      user,
      title,
      message,
      type: type || "GENERAL",
      relatedId: relatedId || null,
    });

    return res.status(201).json({
      success: true,
      message: "Notification created successfully.",
      notification,
    });
  } catch (error) {
    console.error("Create notification error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create notification.",
    });
  }
};

// ======================================
// GET MY NOTIFICATIONS
// ======================================
const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    const unreadCount = notifications.filter(
      (notification) => !notification.isRead,
    ).length;

    return res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount,
      notifications,
    });
  } catch (error) {
    console.error("Get notifications error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications.",
    });
  }
};

// ======================================
// MARK AS READ
// ======================================
const markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    if (notification.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own notifications.",
      });
    }

    notification.isRead = true;

    await notification.save();

    return res.status(200).json({
      success: true,
      message: "Notification marked as read.",
      notification,
    });
  } catch (error) {
    console.error("Mark notification error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update notification.",
    });
  }
};

// ======================================
// MARK ALL AS READ
// ======================================
const markAllNotificationsAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      {
        user: req.user._id,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
        },
      },
    );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read.",
    });
  } catch (error) {
    console.error("Mark all notifications error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update notifications.",
    });
  }
};

// ======================================
// DELETE NOTIFICATION
// ======================================
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    if (notification.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own notifications.",
      });
    }

    await notification.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully.",
    });
  } catch (error) {
    console.error("Delete notification error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete notification.",
    });
  }
};

module.exports = {
  createNotification,
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
};
