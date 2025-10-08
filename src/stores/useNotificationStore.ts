import { create } from "zustand";
import { api } from "@/lib/api";

export type NotificationType = 
  | "TEAM_INVITATION" 
  | "INVITATION_ACCEPTED" 
  | "INVITATION_REJECTED"
  | "TEAM_MATCH"
  | "NEW_MEMBER"
  | "ROLE_CHANGE"
  | "REMINDER";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: {
    teamId?: string;
    inviteId?: string;
    token?: string;
    teamName?: string;
    memberName?: string;
    [key: string]: any;
  };
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;

  // Actions
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  reset: () => void;
}

const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  ...initialState,

  fetchNotifications: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get<{
        notifications: Notification[];
        unreadCount: number;
      }>("/notifications?limit=20");

      set({
        notifications: response.notifications,
        unreadCount: response.unreadCount,
        loading: false,
      });
    } catch (error: any) {
      console.error("Error fetching notifications:", error);
      set({
        error: error.message || "Error al cargar notificaciones",
        loading: false,
      });
    }
  },

  markAsRead: async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`, { read: true });

      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error: any) {
      console.error("Error marking notification as read:", error);
    }
  },

  markAllAsRead: async () => {
    try {
      await api.post("/notifications/mark-all-read");

      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
        unreadCount: 0,
      }));
    } catch (error: any) {
      console.error("Error marking all as read:", error);
    }
  },

  addNotification: (notification: Notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: notification.read ? state.unreadCount : state.unreadCount + 1,
    }));
  },

  removeNotification: (id: string) => {
    set((state) => {
      const notification = state.notifications.find((n) => n.id === id);
      const wasUnread = notification && !notification.read;

      return {
        notifications: state.notifications.filter((n) => n.id !== id),
        unreadCount: wasUnread
          ? Math.max(0, state.unreadCount - 1)
          : state.unreadCount,
      };
    });
  },

  reset: () => set(initialState),
}));
