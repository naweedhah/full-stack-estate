import { create } from "zustand";
import apiRequest from "./apiRequest";

export const useNotificationStore = create((set) => ({
  number: 0,
  notifications: [],
  preferences: null,
  fetch: async () => {
    const res = await apiRequest("/users/notifications");
    set({
      number: res.data.unseenCount,
      notifications: res.data.notifications,
      preferences: res.data.preferences,
    });
  },
  markRead: async (id) => {
    await apiRequest.put(`/users/notifications/${id}/read`);
    set((prev) => ({
      number: Math.max(
        0,
        prev.number - (prev.notifications.find((item) => item.id === id && !item.isRead) ? 1 : 0)
      ),
      notifications: prev.notifications.map((item) =>
        item.id === id ? { ...item, isRead: true } : item
      ),
    }));
  },
  markAllRead: async () => {
    await apiRequest.put("/users/notifications/read-all");
    set((prev) => ({
      number: 0,
      notifications: prev.notifications.map((item) => ({
        ...item,
        isRead: true,
      })),
    }));
  },
  updatePreferences: async (data) => {
    const res = await apiRequest.put("/users/notifications/preferences", data);
    set({ preferences: res.data });
    return res.data;
  },
  pushLive: (notification) => {
    set((prev) => ({
      number: prev.number + (notification.isRead ? 0 : 1),
      notifications: [notification, ...prev.notifications].slice(0, 20),
    }));
  },
  applyReadEvent: (notificationId) => {
    set((prev) => ({
      number: Math.max(
        0,
        prev.number -
          (prev.notifications.find(
            (item) => item.id === notificationId && !item.isRead,
          )
            ? 1
            : 0),
      ),
      notifications: prev.notifications.map((item) =>
        item.id === notificationId ? { ...item, isRead: true } : item,
      ),
    }));
  },
  reset: () => {
    set({ number: 0, notifications: [], preferences: null });
  },
}));
