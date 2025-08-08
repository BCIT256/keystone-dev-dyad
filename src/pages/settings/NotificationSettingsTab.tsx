import { useEffect } from 'react';
import { useSettingsStore, NotificationTime } from '@/state/settingsStore';
import { NotificationService } from '@/services/notificationService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BellRing, AlertTriangle } from 'lucide-react';

export function NotificationSettingsTab() {
  const {
    notificationsEnabled,
    setNotificationsEnabled,
    notificationPermission,
    setNotificationPermission,
    notificationTime,
    setNotificationTime,
  } = useSettingsStore();

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, [setNotificationPermission]);

  const handleRequestPermission = () => {
    NotificationService.requestPermission();
  };

  const handleSendTest = () => {
    NotificationService.showTestNotification();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>
          Manage how you receive notifications for your tasks.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {notificationPermission === 'denied' && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Permissions Denied</AlertTitle>
            <AlertDescription>
              You have blocked notifications. To enable them, you need to update your browser settings.
            </AlertDescription>
          </Alert>
        )}

        {notificationPermission === 'default' && (
          <Alert>
            <BellRing className="h-4 w-4" />
            <AlertTitle>Enable Notifications</AlertTitle>
            <AlertDescription>
              To receive task reminders, you need to grant permission.
              <Button onClick={handleRequestPermission} size="sm" className="mt-2">
                Allow Notifications
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label htmlFor="notifications-switch" className="text-base">Enable Task Reminders</Label>
            <p className="text-sm text-muted-foreground">
              Receive a notification when a task is due.
            </p>
          </div>
          <Switch
            id="notifications-switch"
            checked={notificationsEnabled}
            onCheckedChange={setNotificationsEnabled}
            disabled={notificationPermission !== 'granted'}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notification-time">Notify me</Label>
          <Select
            value={notificationTime}
            onValueChange={(value) => setNotificationTime(value as NotificationTime)}
            disabled={!notificationsEnabled || notificationPermission !== 'granted'}
          >
            <SelectTrigger id="notification-time" className="max-w-md">
              <SelectValue placeholder="Select notification time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="on_time">At time of task</SelectItem>
              <SelectItem value="5_min_before">5 minutes before</SelectItem>
              <SelectItem value="15_min_before">15 minutes before</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          onClick={handleSendTest}
          disabled={notificationPermission !== 'granted'}
        >
          Send Test Notification
        </Button>
      </CardContent>
    </Card>
  );
}