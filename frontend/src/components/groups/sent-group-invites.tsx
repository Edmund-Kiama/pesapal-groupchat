import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { groupInviteApi } from "@/lib/api/groups-api";
import { useAuthStore } from "@/lib/stores/auth-store";
import { GroupInvite, GroupInviteStatus } from "@/lib/typings/models";
import { Loader2, X, Mail, Clock, CheckCircle, XCircle } from "lucide-react";

interface SentGroupInvitesProps {
  onInviteCancelled?: () => void;
}

export function SentGroupInvites({ onInviteCancelled }: SentGroupInvitesProps) {
  const [invites, setInvites] = useState<GroupInvite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const { toast } = useToast();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchSentInvites();
  }, [user?.id]);

  const fetchSentInvites = async () => {
    if (!user?.id) return;

    try {
      const response = await groupInviteApi.getSentInvites(user.id);
      if (response.success) {
        setInvites(response.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch sent invites:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelInvite = async (inviteId: number) => {
    setCancellingId(inviteId);
    try {
      const response = await groupInviteApi.cancelInvite(inviteId);

      if (response.success) {
        toast.success("Invitation cancelled successfully");
        // Remove from list
        setInvites((prev) => prev.filter((inv) => inv.id !== inviteId));
        onInviteCancelled?.();
      } else {
        toast.error(response.message || "Failed to cancel invitation");
      }
    } catch (error) {
      toast.error("An error occurred while cancelling invitation");
    } finally {
      setCancellingId(null);
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
            <Mail className="h-5 w-5" />
            Sent Invitations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No invitations sent yet
          </p>
        </CardContent>
      </Card>
    );
  }

  // Group invites by status
  const pendingInvites = invites.filter(
    (inv) => inv.status === GroupInviteStatus.PENDING
  );
  const processedInvites = invites.filter(
    (inv) => inv.status !== GroupInviteStatus.PENDING
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Sent Invitations
          {pendingInvites.length > 0 && (
            <Badge variant="secondary">{pendingInvites.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Pending Invites Section */}
          {pendingInvites.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-3">Pending Invitations</h3>
              <div className="space-y-3">
                {pendingInvites.map((invite) => (
                  <div
                    key={invite.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-lg bg-yellow-50/50"
                  >
                    <div className="flex-1">
                      <p className="font-medium">
                        {invite.receiver?.name || "Unknown User"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {invite.receiver?.email}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        To group: {invite.group?.name || "Unknown Group"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Sent: {new Date(invite.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(invite.status)}
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleCancelInvite(invite.id)}
                        disabled={cancellingId === invite.id}
                      >
                        {cancellingId === invite.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                        <span className="ml-1 hidden sm:inline">Cancel</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Processed Invites Section */}
          {processedInvites.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-3">
                Processed Invitations
              </h3>
              <div className="space-y-3">
                {processedInvites.map((invite) => (
                  <div
                    key={invite.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium">
                        {invite.receiver?.name || "Unknown User"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {invite.receiver?.email}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        To group: {invite.group?.name || "Unknown Group"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Sent: {new Date(invite.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>{getStatusBadge(invite.status)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
