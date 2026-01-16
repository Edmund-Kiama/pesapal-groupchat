"use client";

import { useEffect, useState } from "react";
import { GroupInvite, GroupInviteStatus } from "@/lib/typings/models";
import { invitesApi } from "@/lib/api/invites-api";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  UserPlus,
  X,
  Check,
  XCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

export function GroupInvitesTable() {
  const { user } = useAuthStore();
  const [receivedInvites, setReceivedInvites] = useState<GroupInvite[]>([]);
  const [sentInvites, setSentInvites] = useState<GroupInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"received" | "sent">("received");

  useEffect(() => {
    if (user) {
      fetchInvites();
    }
  }, [user]);

  const fetchInvites = async () => {
    try {
      setLoading(true);
      const [receivedResponse, sentResponse] = await Promise.all([
        invitesApi.getReceivedInvites(user!.id),
        invitesApi.getSentInvites(user!.id),
      ]);

      if (receivedResponse.success) {
        setReceivedInvites(receivedResponse.data || []);
      }
      if (sentResponse.success) {
        setSentInvites(sentResponse.data || []);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch invites");
    } finally {
      setLoading(false);
    }
  };

  const handleRespondToInvite = async (
    inviteId: number,
    status: "accepted" | "declined"
  ) => {
    try {
      setProcessing(inviteId);
      const response = await invitesApi.respondToInvite({
        groupInviteId: inviteId,
        status,
      });
      if (response.success) {
        toast.success(`Invite ${status}`);
        fetchInvites();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to respond to invite");
    } finally {
      setProcessing(null);
    }
  };

  const handleCancelInvite = async (inviteId: number) => {
    if (!confirm("Are you sure you want to cancel this invite?")) return;

    try {
      setProcessing(inviteId);
      const response = await invitesApi.cancelInvite(inviteId);
      if (response.success) {
        toast.success("Invite cancelled");
        fetchInvites();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel invite");
    } finally {
      setProcessing(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return <Badge variant="default">Accepted</Badge>;
      case "declined":
        return <Badge variant="destructive">Declined</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const renderInviteRow = (invite: GroupInvite, isReceived: boolean) => (
    <TableRow key={invite.id}>
      <TableCell className="font-medium">#{invite.id}</TableCell>
      <TableCell>
        {isReceived
          ? invite.sender?.name || `User #${invite.senderId}`
          : invite.receiver?.name || `User #${invite.receiverId}`}
      </TableCell>
      <TableCell>{invite.group?.name || `Group #${invite.groupId}`}</TableCell>
      <TableCell>{getStatusBadge(invite.status)}</TableCell>
      <TableCell className="text-sm">
        {formatDate(String(invite.createdAt))}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          {isReceived && invite.status === "pending" && (
            <>
              <Button
                variant="outline"
                size="sm"
                disabled={processing === invite.id}
                onClick={() => handleRespondToInvite(invite.id, "accepted")}
                title="Accept"
              >
                {processing === invite.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 text-green-500" />
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={processing === invite.id}
                onClick={() => handleRespondToInvite(invite.id, "declined")}
                title="Decline"
              >
                {processing === invite.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </Button>
            </>
          )}
          {!isReceived && invite.status === "pending" && (
            <Button
              variant="destructive"
              size="sm"
              disabled={processing === invite.id}
              onClick={() => handleCancelInvite(invite.id)}
              title="Cancel invite"
            >
              {processing === invite.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <X className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );

  const currentInvites =
    activeTab === "received" ? receivedInvites : sentInvites;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Group Invites
        </CardTitle>
        <Button variant="outline" size="sm" onClick={fetchInvites}>
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Button
            variant={activeTab === "received" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("received")}
          >
            Received ({receivedInvites.length})
          </Button>
          <Button
            variant={activeTab === "sent" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("sent")}
          >
            Sent ({sentInvites.length})
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8 text-red-500">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>
                    {activeTab === "received" ? "From" : "To"}
                  </TableHead>
                  <TableHead>Group</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentInvites.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No {activeTab} invites found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentInvites.map((invite) =>
                    renderInviteRow(invite, activeTab === "received")
                  )
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
