import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogoutConfirmationDialog } from "@/components/LogoutConfirmationDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/components/AuthProvider";
import { Separator } from "@/components/ui/separator";
import { DeleteAccountDialog } from "@/components/DeleteAccountDialog";
import { useProfileStore } from '@/state/profileStore';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usStates } from '@/lib/usStates';
import { Loader2 } from 'lucide-react';

const profileFormSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  state: z.string().min(1, 'State is required'),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function AccountSettingsTab() {
  const user = useUser();
  const { profile, updateProfile, isLoading } = useProfileStore();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      state: '',
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        state: profile.state || '',
      });
    }
  }, [profile, form]);

  const onSubmit = (data: ProfileFormValues) => {
    updateProfile(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account</CardTitle>
        <CardDescription>Manage your account settings.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email || 'Loading...'} disabled />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField control={form.control} name="first_name" render={({ field }) => (
                <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="last_name" render={({ field }) => (
                <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <FormField control={form.control} name="state" render={({ field }) => (
              <FormItem>
                <FormLabel>State</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select your state" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {usStates.map(s => <SelectItem key={s.abbreviation} value={s.abbreviation}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <Button type="submit" disabled={isLoading || !form.formState.isDirty}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </form>
        </Form>
        
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