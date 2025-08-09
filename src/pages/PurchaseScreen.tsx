import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useProfileStore } from '@/state/profileStore';
import { showSuccess } from '@/utils/toast';
import { Check } from 'lucide-react';

export default function PurchaseScreen() {
  const { setHasRemovedAds } = useProfileStore();
  const navigate = useNavigate();

  const handleRemoveAds = async () => {
    await setHasRemovedAds();
    showSuccess("Purchase successful! Ads have been removed.");
    navigate('/settings');
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Upgrade Your Experience</h1>
        <p className="text-muted-foreground mt-2">Choose a plan that works for you.</p>
      </header>
      <div className="max-w-md mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Remove Ads</CardTitle>
            <CardDescription>A one-time purchase to remove the ad banner forever.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <p className="text-4xl font-bold mb-4">$1.00</p>
            <Button className="w-full" onClick={handleRemoveAds}>Purchase Now</Button>
          </CardContent>
        </Card>
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Premium Subscription</CardTitle>
            <CardDescription>Unlock all premium features and support future development.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-center mb-6">$5.00<span className="text-lg font-normal text-muted-foreground">/month</span></p>
            <ul className="space-y-2 mb-6 text-sm">
              <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-primary" /> Remove Ads</li>
              <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-primary" /> Cloud Sync & Backup</li>
              <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-primary" /> Advanced Analytics</li>
              <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-primary" /> Priority Support</li>
            </ul>
            <Button variant="default" className="w-full" disabled>Subscribe (Coming Soon)</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}