import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { apiClient } from "../services/apiClient";
import { useAuth } from "./AuthContext";

export interface Notification {
  id: string;
  type: "like" | "repost" | "comment" | "reply" | "follow" | "system";
  senderName: string;
  senderHandle: string;
  senderAvatarText: string;
  postId?: string;
  postContent?: string;
  commentId?: string;
  commentContent?: string;
  timestamp: string;
  createdAt: string;
  isRead: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearNotifications: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  addMockNotification: (notification: Omit<Notification, "id" | "createdAt" | "isRead">) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const POLL_INTERVAL_MS = 30_000; // 30 seconds

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await apiClient.get<Notification[]>("/notifications");
      // Sort newest first
      const sorted = [...data].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setNotifications(sorted);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Re-fetch whenever auth user changes (login / logout / re-login)
  useEffect(() => {
    if (isAuthenticated && user) {
      Promise.resolve().then(() => {
        setIsLoading(true);
        setNotifications([]);
        fetchNotifications();
      });

      // Start polling
      if (pollTimer.current) clearInterval(pollTimer.current);
      pollTimer.current = setInterval(fetchNotifications, POLL_INTERVAL_MS);
    } else {
      // Logged out — clear notifications and stop polling
      Promise.resolve().then(() => {
        setNotifications([]);
        setIsLoading(false);
      });
      if (pollTimer.current) {
        clearInterval(pollTimer.current);
        pollTimer.current = null;
      }
    }

    return () => {
      if (pollTimer.current) {
        clearInterval(pollTimer.current);
        pollTimer.current = null;
      }
    };
  }, [isAuthenticated, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = async (id: string) => {
    try {
      await apiClient.put(`/notifications/mark-read`, { id });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error(`Failed to mark notification ${id} as read:`, error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.put(`/notifications/mark-read`, {});
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const clearNotifications = async () => {
    try {
      await apiClient.delete(`/notifications`);
      setNotifications([]);
    } catch (error) {
      console.error("Failed to clear notifications:", error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await apiClient.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error(`Failed to delete notification ${id}:`, error);
    }
  };

  // Helper to optimistically append a notification (useful for real-time feel)
  const addMockNotification = async (
    notificationData: Omit<Notification, "id" | "createdAt" | "isRead">
  ) => {
    try {
      const newNotif = await apiClient.post<Notification>("/notifications", notificationData);
      setNotifications((prev) => [newNotif, ...prev]);
    } catch (error) {
      console.error("Failed to add mock notification:", error);
    }
  };

  const value = {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    deleteNotification,
    addMockNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
