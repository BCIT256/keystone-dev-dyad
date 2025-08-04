import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link } from "react-router-dom";

export default function SettingsScreen() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Settings</h1>
      </header>
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Manage your account settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full" asChild>
            <Link to="/purchase">Upgrade to Pro</Link>
          </Button>
          <Button variant="destructive" className="w-full">Log Out</Button>
        </CardContent>
      </Card>
    </div>
  );
}