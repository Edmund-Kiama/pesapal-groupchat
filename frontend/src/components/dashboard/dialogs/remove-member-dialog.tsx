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
import { Loader2, UserX, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { membershipsApi } from "@/lib/api/memberships-api";

interface RemoveMemberDialogProps {
  groupId: number;
  groupName: string;
  memberName: string;
  memberId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function RemoveMemberDialog({
  groupId,
  groupName,
  memberName,
  memberId,
  isOpen,
  onClose,
  onSuccess,
}: RemoveMemberDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleRemove = async () => {
    setIsLoading(true);
    try {
      const response = await membershipsApi.removeMember(groupId, memberId);
      if (response.success) {
        toast.success("Member removed successfully");
        onSuccess?.();
        onClose();
      } else {
        toast.error(response.message || "Failed to remove member");
      }
    } catch (error) {
      toast.error("An error occurred while removing the member");
      console.error("Error removing member:", error);
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
            Remove Member
          </DialogTitle>
          <DialogClose onClick={onClose} />
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">
            Are you sure you want to remove <strong>{memberName}</strong> from{" "}
            <strong>{groupName}</strong>?
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium">This action will:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Remove the member from this group</li>
                  <li>Revoke their access to group content</li>
                  <li>The member can be re-invited later</li>
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
            onClick={handleRemove}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Removing...
              </>
            ) : (
              <>
                <UserX className="mr-2 h-4 w-4" />
                Remove Member
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
