import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'system';
export type NotificationPermission = 'default' | 'granted' | 'denied';
export type NotificationTime = 'on_time' | '5_min_before' | '15_min_before';

interface SettingsState {
  theme: Theme;
  notificationsEnabled: boolean;
  notificationPermission: NotificationPermission;
  notificationTime: NotificationTime;
  setTheme: (theme: Theme) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setNotificationPermission: (permission: NotificationPermission) => void;
  setNotificationTime: (time: NotificationTime) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'system',
      notificationsEnabled: true,
      notificationPermission: 'default',
      notificationTime: 'on_time',
      setTheme: (theme) => set({ theme }),
      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
      setNotificationPermission: (permission) => set({ notificationPermission: permission }),
      setNotificationTime: (time) => set({ notificationTime: time }),
    }),
    {
      name: 'app-settings-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);