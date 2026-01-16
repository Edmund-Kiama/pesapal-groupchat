import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { groupInviteApi } from "@/lib/api/groups-api";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, UserPlus } from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
}

interface InviteUserFormProps {
  groupId: number;
  groupName: string;
  availableUsers?: User[];
  onInviteSent?: () => void;
}

export function InviteUserForm({
  groupId,
  groupName,
  availableUsers = [],
  onInviteSent,
}: InviteUserFormProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUserId) {
      toast.error("Please select a user to invite");
      return;
    }

    setIsLoading(true);
    try {
      const response = await groupInviteApi.createInvite({
        receiverId: parseInt(selectedUserId),
        groupId,
      });

      if (response.success) {
        toast.success("Invitation sent successfully!");
        setSelectedUserId("");
        onInviteSent?.();
      } else {
        toast.error(response.message || "Failed to send invitation");
      }
    } catch (error) {
      toast.error("An error occurred while sending invitation");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Invite User to Group
        </CardTitle>
        <CardDescription>
          Send an invitation to add a user to "{groupName}"
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user-select">Select User</Label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a user to invite" />
              </SelectTrigger>

              <SelectContent>
                {availableUsers.length > 0 ? (
                  availableUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-sm text-muted-foreground">
                    No available users
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>
          <Button
            type="submit"
            disabled={isLoading || !selectedUserId}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Invitation...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Send Invitation
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
