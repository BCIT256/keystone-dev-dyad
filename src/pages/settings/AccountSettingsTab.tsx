import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogoutConfirmationDialog } from "@/components/LogoutConfirmationDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AccountSettingsTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account</CardTitle>
        <CardDescription>Manage your account settings.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value="user@example.com" disabled />
        </div>
        <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" value="Example User" disabled />
        </div>
        <Button variant="outline" className="w-full" asChild>
          <Link to="/purchase">Upgrade to Pro</Link>
        </Button>
        <LogoutConfirmationDialog />
      </CardContent>
    </Card>
  );
}