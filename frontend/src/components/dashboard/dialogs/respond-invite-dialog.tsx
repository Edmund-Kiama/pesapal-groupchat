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
import { Loader2, Check, X, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { GroupInvite } from "@/lib/typings/models";
import { invitesApi } from "@/lib/api/invites-api";

interface RespondInviteDialogProps {
  invite: GroupInvite;
  inviteType: "received" | "sent";
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function RespondInviteDialog({
  invite,
  inviteType,
  isOpen,
  onClose,
  onSuccess,
}: RespondInviteDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [action, setAction] = useState<"accepted" | "declined" | null>(null);

  const handleRespond = async (status: "accepted" | "declined") => {
    setIsLoading(true);
    setAction(status);
    try {
      const response = await invitesApi.respondToInvite({
        groupInviteId: invite.id,
        status,
      });
      if (response.success) {
        toast.success(
          status === "accepted"
            ? "Invite accepted successfully"
            : "Invite declined"
        );
        onSuccess?.();
        onClose();
      } else {
        toast.error(response.message || "Failed to respond to invite");
      }
    } catch (error) {
      toast.error("An error occurred while responding to invite");
      console.error("Error responding to invite:", error);
    } finally {
      setIsLoading(false);
      setAction(null);
    }
  };

  const handleCancel = async () => {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {inviteType === "received" ? "Group Invite" : "Sent Invite"}
          </DialogTitle>
          <DialogClose onClick={onClose} />
        </DialogHeader>

        <div className="py-4">
          <div className="bg-muted rounded-lg p-4 mb-4">
            <p className="text-sm">
              <span className="font-medium">From:</span>{" "}
              {invite.sender?.name || "Unknown"}
            </p>
            <p className="text-sm mt-1">
              <span className="font-medium">To:</span>{" "}
              {invite.receiver?.name || "Unknown"}
            </p>
            <p className="text-sm mt-1">
              <span className="font-medium">Group:</span>{" "}
              {invite.group?.name || "Unknown"}
            </p>
            <p className="text-sm mt-1">
              <span className="font-medium">Status:</span>{" "}
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  invite.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : invite.status === "accepted"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {invite.status}
              </span>
            </p>
          </div>

          {inviteType === "received" && invite.status === "pending" && (
            <div className="text-sm text-muted-foreground">
              Do you want to accept or decline this invitation?
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Close
          </Button>

          {inviteType === "received" && invite.status === "pending" && (
            <>
              <Button
                type="button"
                variant="default"
                onClick={() => handleRespond("declined")}
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700"
              >
                {isLoading && action === "declined" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Declining...
                  </>
                ) : (
                  <>
                    <XCircle className="mr-2 h-4 w-4" />
                    Decline
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="default"
                onClick={() => handleRespond("accepted")}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading && action === "accepted" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Accepting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Accept
                  </>
                )}
              </Button>
            </>
          )}

          {inviteType === "sent" && invite.status === "pending" && (
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
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
