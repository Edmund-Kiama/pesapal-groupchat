import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast";
import { groupApi } from "@/lib/api/groups-api";
import { Loader2, UserMinus } from "lucide-react";

interface LeaveGroupDialogProps {
  groupId: number;
  groupName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function LeaveGroupDialog({
  groupId,
  groupName,
  isOpen,
  onClose,
  onSuccess,
}: LeaveGroupDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLeave = async () => {
    setIsLoading(true);
    try {
      const response = await groupApi.leaveGroup(groupId);
      if (response.success) {
        toast.success("You have left the group successfully");
        onSuccess?.();
        onClose();
      } else {
        toast.error(response.message || "Failed to leave group");
      }
    } catch (error) {
      toast.error("An error occurred while leaving the group");
      console.error("Error leaving group:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <UserMinus className="h-5 w-5" />
            Leave Group
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to leave <strong>{groupName}</strong>?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            You will no longer have access to this group's content and
            activities. This action cannot be undone unless you receive a new
            invitation.
          </p>
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
            onClick={handleLeave}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Leaving...
              </>
            ) : (
              "Leave Group"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
