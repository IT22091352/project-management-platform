const prisma = require("../config/prisma");
const AppError = require("../utils/app-error");

/**
 * Creates a notification.
 * Skips if userId === actorId.
 * Skips if an identical unread notification exists (avoids duplicates).
 */
const createNotification = async ({
  userId,
  actorId,
  title,
  message,
  type,
  priority = "LOW",
  referenceId,
  referenceType,
  route,
}) => {
  if (userId === actorId) {
    return null; // Never notify the actor themselves
  }

  // Avoid duplicates: check if an unread notification with same type, referenceId, referenceType exists for this user
  if (referenceId && referenceType) {
    const existing = await prisma.notification.findFirst({
      where: {
        userId,
        type,
        referenceId,
        referenceType,
        isRead: false,
      },
    });

    if (existing) {
      return existing; // Skip duplicate
    }
  }

  return prisma.notification.create({
    data: {
      userId,
      actorId,
      title,
      message,
      type,
      priority,
      referenceId,
      referenceType,
      route,
    },
  });
};

const getNotifications = async (userId) => {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};

const getUnreadCount = async (userId) => {
  const count = await prisma.notification.count({
    where: { userId, isRead: false },
  });
  return count;
};

const markAsRead = async (userId, notificationId) => {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification || notification.userId !== userId) {
    throw new AppError("Notification not found", 404);
  }

  return prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
};

const markAllAsRead = async (userId) => {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
};

const deleteNotification = async (userId, notificationId) => {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification || notification.userId !== userId) {
    throw new AppError("Notification not found", 404);
  }

  await prisma.notification.delete({
    where: { id: notificationId },
  });

  return true;
};

module.exports = {
  createNotification,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
