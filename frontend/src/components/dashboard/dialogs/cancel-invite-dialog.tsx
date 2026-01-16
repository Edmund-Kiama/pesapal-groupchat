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
import { Loader2, X, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { GroupInvite } from "@/lib/typings/models";
import { invitesApi } from "@/lib/api/invites-api";

interface CancelInviteDialogProps {
  invite: GroupInvite | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CancelInviteDialog({
  invite,
  isOpen,
  onClose,
  onSuccess,
}: CancelInviteDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCancel = async () => {
    if (!invite) return;

    setIsLoading(true);
    try {
      const response = await invitesApi.cancelInvite(invite.id);
      if (response.success) {
        toast.success("Invite cancelled successfully");
        onSuccess?.();
        onClose();
      } else {
        toast.error(response.message || "Failed to cancel invite");
      }
    } catch (error) {
      toast.error("An error occurred while cancelling invite");
      console.error("Error cancelling invite:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!invite) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Cancel Invite
          </DialogTitle>
          <DialogClose onClick={onClose} />
        </DialogHeader>

        <DialogDescription className="py-4">
          Are you sure you want to cancel this invite? This action cannot be
          undone.
        </DialogDescription>

        <div className="bg-muted rounded-lg p-4 mb-4">
          <p className="text-sm">
            <span className="font-medium">To:</span>{" "}
            {invite.receiver?.name || "Unknown"}
          </p>
          <p className="text-sm mt-1">
            <span className="font-medium">Group:</span>{" "}
            {invite.group?.name || "Unknown"}
          </p>
          <p className="text-sm mt-1">
            <span className="font-medium">Status:</span>{" "}
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
              {invite.status}
            </span>
          </p>
        </div>

        <DialogFooter className="sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Keep Invite
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleCancel}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cancelling...
              </>
            ) : (
              <>
                <X className="mr-2 h-4 w-4" />
                Cancel Invite
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
