import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { groupApi, groupInviteApi } from "@/lib/api/groups-api";
import { useAuthStore } from "@/lib/stores/auth-store";
import { GroupMember, User } from "@/lib/typings/models";
import { Loader2, UserPlus, Users, Search } from "lucide-react";

interface InviteUsersToGroupProps {
  onInviteSent?: () => void;
}

export function InviteUsersToGroup({ onInviteSent }: InviteUsersToGroupProps) {
  const [groups, setGroups] = useState<GroupMember[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [isInviting, setIsInviting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  const fetchData = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      // Fetch user's groups (groups they created)
      const groupsResponse = await groupApi.getMyGroups();
      if (groupsResponse.success) {
        // Filter to only show groups the user created (as admin)
        const adminGroups = (groupsResponse.data || []).filter(
          (membership) => membership.group?.created_by === user.id
        );
        setGroups(adminGroups);
      }

      // Fetch all users for inviting
      const usersResponse = await groupApi.getUsers();
      if (usersResponse.success) {
        // Filter out current user
        const otherUsers = (usersResponse.data || []).filter(
          (u: User) => u.id !== user.id
        );
        setUsers(otherUsers);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedGroupId || !selectedUserId) {
      toast.error("Please select both a group and a user");
      return;
    }

    setIsInviting(true);
    try {
      const response = await groupInviteApi.createInvite({
        receiverId: parseInt(selectedUserId),
        groupId: parseInt(selectedGroupId),
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
      setIsInviting(false);
    }
  };

  // Get users who are NOT already members of the selected group
  const getAvailableUsers = () => {
    if (!selectedGroupId) return users;
    const group = groups.find((g) => g.groupId === parseInt(selectedGroupId));
    if (!group) return users;

    const memberIds = group.group?.members?.map((m) => m.userId) || [];
    return users.filter((u) => !memberIds.includes(u.id));
  };

  const availableUsers = getAvailableUsers();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (groups.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Invite Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            You need to create a group first before inviting users.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Invite Users to Group
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleInvite} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="group-select">Select Group
            <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
              <SelectTrigger >
                <SelectValue placeholder="Choose a group to invite to" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((membership) => (
                  <SelectItem
                    key={membership.groupId}
                    value={membership.groupId.toString()}
                  >
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {membership.group?.name}
                      <Badge variant="secondary" className="ml-2">
                        {membership.group?.memberCount || 0} members
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-select">Select User to Invite
            <Select
              value={selectedUserId}
              onValueChange={setSelectedUserId}
              disabled={!selectedGroupId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a user to invite" />
              </SelectTrigger>
              <SelectContent>
                {availableUsers.length > 0 ? (
                  availableUsers.map((u) => (
                    <SelectItem key={u.id} value={u.id.toString()}>
                      <div className="flex items-center gap-2">
                        <Search className="h-4 w-4" />
                        {u.name} ({u.email})
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-sm text-muted-foreground">
                    {selectedGroupId
                      ? "All users are already members of this group"
                      : "Select a group first"}
                  </div>
                )}
              </SelectContent>
            </Select>
            </Label>
            {selectedGroupId && availableUsers.length === 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                All available users are already members of this group
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isInviting || !selectedGroupId || !selectedUserId}
            className="w-full"
          >
            {isInviting ? (
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
