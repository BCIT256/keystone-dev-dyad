import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountSettingsTab } from "@/pages/settings/AccountSettingsTab";
import { NotificationSettingsTab } from "@/pages/settings/NotificationSettingsTab";
import { AppearanceSettingsTab } from "@/pages/settings/AppearanceSettingsTab";

export default function SettingsScreen() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Settings</h1>
      </header>
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>
        <TabsContent value="account" className="mt-6">
          <AccountSettingsTab />
        </TabsContent>
        <TabsContent value="notifications" className="mt-6">
          <NotificationSettingsTab />
        </TabsContent>
        <TabsContent value="appearance" className="mt-6">
          <AppearanceSettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}