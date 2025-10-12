import { create } from "zustand";
import { api } from "@/lib/api";

export type NotificationType = 
  | "TEAM_INVITATION" 
  | "INVITATION_ACCEPTED" 
  | "INVITATION_REJECTED"
  | "TEAM_MATCH"
  | "NEW_MEMBER"
  | "ROLE_CHANGE"
  | "REMINDER"
  | "AREA_ASSIGNMENT"     // 🆕 Notificación de asignación a área
  | "AREA_REMOVAL";       // 🆕 Notificación de remoción de área

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
  userId: string | null;

  // Actions
  setUserId: (userId: string | null) => void;
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
  userId: null,
};

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  ...initialState,

  setUserId: (userId: string | null) => {
    set({ userId });
  },

  fetchNotifications: async () => {
    const { userId } = get();
    
    // No hacer request si no hay userId
    if (!userId) {
      set({ loading: false, error: null, notifications: [], unreadCount: 0 });
      return;
    }

    set({ loading: true, error: null });
    try {
      const response = await api.get<{
        notifications: Notification[];
        unreadCount: number;
      }>(`/notifications?limit=20&userId=${userId}`);

      set({
        notifications: response.notifications,
        unreadCount: response.unreadCount,
        loading: false,
      });
    } catch (error: any) {
      // Solo logear errores que no sean de autenticación (401)
      if (error.status !== 401) {
        console.error("Error fetching notifications:", error);
      }
      // En caso de error, resetear silenciosamente
      set({
        error: error.status === 401 ? null : error.message,
        loading: false,
        notifications: [],
        unreadCount: 0,
      });
    }
  },

  markAsRead: async (id: string) => {
    const { userId } = get();
    if (!userId) return;

    try {
      await api.patch(`/notifications/${id}/read?userId=${userId}`, { read: true });

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
    const { userId } = get();
    if (!userId) return;

    try {
      await api.post(`/notifications/mark-all-read?userId=${userId}`);

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
