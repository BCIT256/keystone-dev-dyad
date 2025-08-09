import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogoutConfirmationDialog } from "@/components/LogoutConfirmationDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/components/AuthProvider";
import { Separator } from "@/components/ui/separator";
import { DeleteAccountDialog } from "@/components/DeleteAccountDialog";

export function AccountSettingsTab() {
  const user = useUser();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account</CardTitle>
        <CardDescription>Manage your account settings.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email || 'Loading...'} disabled />
          </div>
          <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" value="Coming soon" disabled />
          </div>
        </div>
        
        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Pro Subscription</h3>
          <p className="text-sm text-muted-foreground">
            Upgrade to unlock premium features like cloud sync, advanced analytics, and more.
          </p>
          <Button variant="outline" className="w-full" asChild>
            <Link to="/purchase">Upgrade to Pro</Link>
          </Button>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-destructive">Danger Zone</h3>
          <div className="space-y-2">
            <LogoutConfirmationDialog />
            <DeleteAccountDialog />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}