"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Loader2, Trash2, AlertTriangle, UserX } from "lucide-react";
import { toast } from "sonner";
import { usersApi } from "@/lib/api/users-api";
import { User } from "@/lib/typings/models";

interface DeleteUserDialogProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function DeleteUserDialog({
  user,
  isOpen,
  onClose,
  onSuccess,
}: DeleteUserDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const response = await usersApi.deleteUser(user.id);
      if (response.success) {
        toast.success("User deleted successfully");
        onSuccess?.();
        onClose();
      } else {
        toast.error(response.message || "Failed to delete user");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the user");
      console.error("Error deleting user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <UserX className="h-5 w-5" />
            Delete User
          </DialogTitle>
          <DialogClose onClick={onClose} />
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">
            Are you sure you want to delete <strong>{user?.name}</strong> (
            {user.email})?
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="text-sm text-red-800">
                <p className="font-medium">
                  Warning: This action cannot be undone
                </p>
                <p className="mt-1">
                  Deleting this user will permanently remove:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>All group memberships</li>
                  <li>All sent and received invitations</li>
                  <li>All notifications</li>
                  <li>All meeting responses</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete User
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
