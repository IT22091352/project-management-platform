"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export type NotificationType =
  | "PROJECT_ASSIGNED"
  | "PROJECT_MANAGER_ASSIGNED"
  | "PROJECT_MEMBER_ADDED"
  | "PROJECT_UPDATED"
  | "TASK_ASSIGNED"
  | "TASK_UPDATED"
  | "TASK_STATUS_CHANGED"
  | "COMMENT_ADDED"
  | "SYSTEM";

export type NotificationPriority = "LOW" | "MEDIUM" | "HIGH";

export type Notification = {
  id: number;
  userId: number;
  actorId?: number | null;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  isRead: boolean;
  referenceId?: number | null;
  referenceType?: string | null;
  route?: string | null;
  createdAt: string;
};

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchNotifications = async () => {
    try {
      const response = await api.get("/notifications");
      setNotifications(response.data.data.notifications || []);
    } catch (err: unknown) {
      console.error("Failed to load notifications", err);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get("/notifications/unread-count");
      setUnreadCount(response.data.data.count || 0);
    } catch (err: unknown) {
      console.error("Failed to load unread count", err);
    }
  };

  const refresh = async () => {
    setLoading(true);
    await Promise.all([fetchNotifications(), fetchUnreadCount()]);
    setLoading(false);
  };

  const markAsRead = async (id: number) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err: unknown) {
      console.error("Failed to mark as read", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
    } catch (err: unknown) {
      console.error("Failed to mark all as read", err);
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      // Re-fetch count just to be safe if the deleted one was unread
      fetchUnreadCount();
    } catch (err: unknown) {
      console.error("Failed to delete notification", err);
    }
  };

  useEffect(() => {
    refresh();
    
    // Refresh every 30 seconds
    const intervalId = setInterval(() => {
      refresh();
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refresh,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}
