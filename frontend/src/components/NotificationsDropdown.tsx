"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, MessageSquare, Briefcase, FileText, Activity } from "lucide-react";
import { useNotifications, Notification, NotificationType } from "@/hooks/use-notifications";
import { Button } from "./ui";

const getIconForType = (type: NotificationType) => {
  switch (type) {
    case "PROJECT_ASSIGNED":
    case "PROJECT_MANAGER_ASSIGNED":
    case "PROJECT_MEMBER_ADDED":
    case "PROJECT_UPDATED":
      return <Briefcase className="h-4 w-4 text-blue-400" />;
    case "TASK_ASSIGNED":
      return <Check className="h-4 w-4 text-green-400" />;
    case "TASK_UPDATED":
      return <FileText className="h-4 w-4 text-orange-400" />;
    case "TASK_STATUS_CHANGED":
      return <Activity className="h-4 w-4 text-purple-400" />;
    case "COMMENT_ADDED":
      return <MessageSquare className="h-4 w-4 text-pink-400" />;
    case "SYSTEM":
    default:
      return <Bell className="h-4 w-4 text-slate-400" />;
  }
};

const getRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  if (diffInHours < 48) return "Yesterday";
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} days ago`;
};

export function NotificationsDropdown() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    setIsOpen(false);
    if (notification.route) {
      router.push(notification.route);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button variant="ghost" onClick={() => setIsOpen(!isOpen)} className="relative">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white shadow-sm ring-2 ring-slate-950">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-3 flex w-80 flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-2xl shadow-black/50"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <h3 className="text-sm font-semibold text-white">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs font-medium text-blue-400 hover:text-blue-300 transition"
                >
                  Mark All Read
                </button>
              )}
            </div>

            <div className="max-h-[28rem] overflow-y-auto p-2">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Bell className="mb-2 h-8 w-8 text-slate-600 opacity-50" />
                  <p className="text-sm text-slate-400">No notifications yet.</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`mb-1 flex w-full items-start gap-3 rounded-2xl p-3 text-left transition hover:bg-white/5 ${
                      !notification.isRead ? "bg-blue-500/5" : ""
                    }`}
                  >
                    <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${!notification.isRead ? "border-blue-500/20 bg-blue-500/10" : "border-white/5 bg-white/5"}`}>
                      {getIconForType(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`truncate text-sm ${!notification.isRead ? "font-semibold text-white" : "font-medium text-slate-200"}`} title={notification.title}>
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                        )}
                      </div>
                      <p className={`mt-0.5 text-xs line-clamp-2 ${!notification.isRead ? "text-slate-300" : "text-slate-400"}`} title={notification.message}>
                        {notification.message}
                      </p>
                      <p className="mt-1.5 text-[10px] font-medium text-slate-500">
                        {getRelativeTime(notification.createdAt)}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
