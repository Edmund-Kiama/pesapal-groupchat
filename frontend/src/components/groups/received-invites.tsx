import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { groupInviteApi } from "@/lib/api/groups-api";
import { useAuthStore } from "@/lib/stores/auth-store";
import { GroupInvite, GroupInviteStatus } from "@/lib/typings/models";
import {
  Loader2,
  Check,
  X,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  Inbox,
} from "lucide-react";

interface ReceivedInvitesProps {
  onInviteAccepted?: (groupId: number) => void;
}

export function ReceivedInvites({ onInviteAccepted }: ReceivedInvitesProps) {
  const [invites, setInvites] = useState<GroupInvite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [respondingId, setRespondingId] = useState<number | null>(null);
  const [filter, setFilter] = useState<
    "all" | "pending" | "accepted" | "declined"
  >("all");
  const { toast } = useToast();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchReceivedInvites();
  }, [user?.id]);

  const fetchReceivedInvites = async () => {
    if (!user?.id) return;

    try {
      const response = await groupInviteApi.getReceivedInvites(user.id);
      if (response.success) {
        setInvites(response.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch received invites:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResponse = async (
    inviteId: number,
    status: "accepted" | "declined"
  ) => {
    setRespondingId(inviteId);
    try {
      const response = await groupInviteApi.respondToInvite({
        groupInviteId: inviteId,
        status,
      });

      if (response.success) {
        if (status === "accepted") {
          toast.success("Invite accepted! You have joined the group.");
        } else {
          toast.info("You have declined the invitation.");
        }

        // Remove the processed invite from the list
        setInvites((prev) => prev.filter((inv) => inv.id !== inviteId));

        if (status === "accepted" && response.data?.groupId) {
          onInviteAccepted?.(response.data.groupId);
        }
      } else {
        toast.error(response.message || "Failed to respond to invitation");
      }
    } catch (error) {
      toast.error("An error occurred while responding to invitation");
    } finally {
      setRespondingId(null);
    }
  };

  const getStatusBadge = (status: GroupInviteStatus) => {
    switch (status) {
      case GroupInviteStatus.PENDING:
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case GroupInviteStatus.ACCEPTED:
        return (
          <Badge className="bg-green-500 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Accepted
          </Badge>
        );
      case GroupInviteStatus.DECLINED:
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Declined
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredInvites = invites.filter((invite) => {
    if (filter === "all") return true;
    return invite.status === filter;
  });

  const pendingCount = invites.filter(
    (inv) => inv.status === GroupInviteStatus.PENDING
  ).length;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (invites.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Inbox className="h-5 w-5" />
            Received Invitations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No invitations received
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Received Invitations
          {pendingCount > 0 && (
            <Badge variant="secondary">{pendingCount}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4">
          {(["all", "pending", "accepted", "declined"] as const).map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? "default" : "outline"}
              onClick={() => setFilter(f)}
              className="capitalize"
            >
              {f}
              {f === "pending" && pendingCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {pendingCount}
                </Badge>
              )}
            </Button>
          ))}
        </div>

        {/* Invites List */}
        {filteredInvites.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No {filter !== "all" ? filter : ""} invitations
          </p>
        ) : (
          <div className="space-y-4">
            {filteredInvites.map((invite) => (
              <div
                key={invite.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium">
                    {invite.group?.name || "Unknown Group"}
                  </p>
                  {invite.group?.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {invite.group.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    Invited by: {invite.sender?.name || "Unknown"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(invite.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(invite.status)}
                  {invite.status === GroupInviteStatus.PENDING && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleResponse(invite.id, "declined")}
                        disabled={respondingId === invite.id}
                      >
                        {respondingId === invite.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                        <span className="ml-1 hidden sm:inline">Decline</span>
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleResponse(invite.id, "accepted")}
                        disabled={respondingId === invite.id}
                      >
                        {respondingId === invite.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                        <span className="ml-1 hidden sm:inline">Accept</span>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
