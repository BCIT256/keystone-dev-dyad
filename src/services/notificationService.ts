import { useSettingsStore } from "@/state/settingsStore";

export const NotificationService = {
  async requestPermission() {
    if (!('Notification' in window)) {
      alert('This browser does not support desktop notification');
      return;
    }

    const permission = await Notification.requestPermission();
    useSettingsStore.getState().setNotificationPermission(permission);
  },

  showTestNotification() {
    const { notificationPermission } = useSettingsStore.getState();
    if (notificationPermission !== 'granted') {
      alert('Notification permission has not been granted.');
      return;
    }

    new Notification('Test Notification', {
      body: 'If you can see this, notifications are working!',
      icon: '/favicon.ico',
    });
  },
};