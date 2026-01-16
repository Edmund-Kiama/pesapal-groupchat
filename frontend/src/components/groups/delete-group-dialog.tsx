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
import { useToast } from "@/components/ui/use-toast";
import { groupApi } from "@/lib/api/groups-api";
import { Loader2, Trash2, AlertTriangle } from "lucide-react";

interface DeleteGroupDialogProps {
  groupId: number;
  groupName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function DeleteGroupDialog({
  groupId,
  groupName,
  isOpen,
  onClose,
  onSuccess,
}: DeleteGroupDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const response = await groupApi.deleteGroup(groupId);
      if (response.success) {
        toast.success("Group deleted successfully");
        onSuccess?.();
        onClose();
      } else {
        toast.error(response.message || "Failed to delete group");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the group");
      console.error("Error deleting group:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete Group
          </DialogTitle>
          <DialogClose onClick={onClose} />
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">
            Are you sure you want to delete <strong>{groupName}</strong>?
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="text-sm text-red-800">
                <p className="font-medium">
                  Warning: This action cannot be undone
                </p>
                <p className="mt-1">
                  Deleting this group will permanently remove:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>All group members and their access</li>
                  <li>All group chats and messages</li>
                  <li>All group meetings</li>
                  <li>All pending invitations</li>
                  <li>All elections associated with this group</li>
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
                Delete Group
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
