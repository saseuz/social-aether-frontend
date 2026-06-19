import React, { createContext, useContext, useState, useEffect } from "react";
import { apiClient } from "../services/apiClient";

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

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchNotifications = async () => {
    try {
      const data = await apiClient.get<Notification[]>("/notifications");
      // Sort: newest first
      const sorted = [...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setNotifications(sorted);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch initial notifications on mount
  useEffect(() => {
    let isMounted = true;
    Promise.resolve().then(() => {
      if (isMounted) {
        fetchNotifications();
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

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

  // Helper to append a notification (useful for simulated loop / offline state)
  const addMockNotification = async (
    notificationData: Omit<Notification, "id" | "createdAt" | "isRead">
  ) => {
    try {
      // In a real-world backend, this might not be called directly since the server pushes notifications.
      // But for mock mode and testing, we support it by sending a POST.
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
