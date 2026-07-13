const express = require("express");
const notificationsController = require("../controllers/notifications.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authMiddleware); // All notification routes require authentication

router.get("/", notificationsController.getNotifications);
router.get("/unread-count", notificationsController.getUnreadCount);
router.patch("/read-all", notificationsController.markAllAsRead);
router.patch("/:id/read", notificationsController.markAsRead);
router.delete("/:id", notificationsController.deleteNotification);

module.exports = router;
