import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";
import { useTaskStore } from '@/state/taskStore';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export function DeleteAccountDialog() {
  const [password, setPassword] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const clearData = useTaskStore((state) => state.clearData);
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (!isConfirmed || !password) {
      showError("Please enter your password and confirm the deletion.");
      return;
    }

    setIsDeleting(true);
    const toastId = showLoading("Verifying your identity...");

    // Step 1: Re-authenticate the user with their password
    const { error: reauthError } = await supabase.auth.reauthenticate({ password });

    if (reauthError) {
      dismissToast(toastId);
      showError(`Authentication failed: ${reauthError.message}`);
      setIsDeleting(false);
      return;
    }

    dismissToast(toastId);
    const deleteToastId = showLoading("Deleting your account...");

    // Step 2: Call the secure edge function to delete the user
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No active session found.");

      const response = await supabase.functions.invoke('delete-user', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        }
      });

      if (response.error) {
        throw response.error;
      }

      dismissToast(deleteToastId);
      showSuccess("Your account has been deleted successfully.");
      
      // Step 3: Clean up local data and redirect
      await supabase.auth.signOut();
      clearData();
      navigate('/login', { replace: true });
      setIsOpen(false);

    } catch (error: any) {
      dismissToast(deleteToastId);
      showError(`Deletion failed: ${error.message || 'An unknown error occurred.'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Reset state when dialog is closed for next use
      setPassword('');
      setIsConfirmed(false);
      setIsDeleting(false);
    }
    setIsOpen(open);
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="w-full">Delete My Account</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your account and all associated data.
            <br/><br/>
            For security, please enter your password to confirm.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={isDeleting}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="confirm-deletion"
              checked={isConfirmed}
              onCheckedChange={(checked) => setIsConfirmed(checked as boolean)}
              disabled={isDeleting}
            />
            <Label htmlFor="confirm-deletion" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              I understand this action is permanent and will delete all my data.
            </Label>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!isConfirmed || !password || isDeleting}
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Account
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}