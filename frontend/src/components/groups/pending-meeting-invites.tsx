"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { groupMeetingApi } from "@/lib/api/groups-api";
import { useAuthStore } from "@/lib/stores/auth-store";
import { GroupMeetingInvite, MeetingInviteStatus } from "@/lib/typings/models";
import { Loader2, Check, X, Calendar, MapPin, Clock } from "lucide-react";

interface PendingMeetingInvitesProps {
  onInviteResponded?: (meetingId: number, status: string) => void;
}

export function PendingMeetingInvites({
  onInviteResponded,
}: PendingMeetingInvitesProps) {
  const [invites, setInvites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [respondingInvite, setRespondingInvite] = useState<{
    id: number;
    action: "accepted" | "declined";
  } | null>(null);
  const { toast } = useToast();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchInvites();
  }, [user?.id]);

  const fetchInvites = async () => {
    if (!user?.id) return;

    try {
      const response = await groupMeetingApi.getMeetings();
      if (response.success) {
        // Filter to only pending invites for this user
        const pendingInvites = response.data.filter((meeting: any) =>
          meeting.invited?.some(
            (invite: GroupMeetingInvite) =>
              invite.userId === user.id &&
              invite.status === MeetingInviteStatus.PENDING
          )
        );
        setInvites(pendingInvites);
      }
    } catch (error) {
      console.error("Failed to fetch meeting invites:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResponse = async (
    meetingId: number,
    status: "accepted" | "declined"
  ) => {
    setRespondingInvite({ id: meetingId, action: status });
    try {
      const response = await groupMeetingApi.respondToMeetingInvite({
        meetingId,
        status,
      });

      if (response.success) {
        if (status === "accepted") {
          toast.success("You have accepted the meeting invite!");
        } else {
          toast.info("You have declined the meeting invite.");
        }

        // Remove the processed invite from the list
        setInvites((prev) => prev.filter((m) => m.id !== meetingId));
        onInviteResponded?.(meetingId, status);
      } else {
        toast.error(response.message || "Failed to respond to invite");
      }
    } catch (error) {
      toast.error("An error occurred while responding to invite");
    } finally {
      setRespondingInvite(null);
    }
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
            <Calendar className="h-5 w-5" />
            Meeting Invitations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No pending meeting invitations
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Meeting Invitations
          <Badge variant="secondary">{invites.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {invites.map((meeting) => {
            const userInvite = meeting.invited?.find(
              (inv: any) => inv.userId === user?.id
            );

            return (
              <div key={meeting.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium">
                      {meeting.group?.name || "Group Meeting"}
                    </h4>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{meeting.location}</span>
                    </div>
                  </div>
                  <Badge
                    variant={
                      userInvite?.status === "pending"
                        ? "outline"
                        : userInvite?.status === "accepted"
                        ? "default"
                        : "destructive"
                    }
                  >
                    {userInvite?.status || "Pending"}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>From: {formatDateTime(meeting.time_from)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>To: {formatDateTime(meeting.time_to)}</span>
                  </div>
                </div>

                {meeting.creator && (
                  <p className="text-xs text-muted-foreground">
                    Organized by: {meeting.creator.name}
                  </p>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-500 hover:text-red-600"
                    onClick={() => handleResponse(meeting.id, "declined")}
                    disabled={respondingInvite?.id === meeting.id}
                  >
                    {respondingInvite?.id === meeting.id &&
                    respondingInvite?.action === "declined" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                    <span className="ml-1">Decline</span>
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleResponse(meeting.id, "accepted")}
                    disabled={respondingInvite?.id === meeting.id}
                  >
                    {respondingInvite?.id === meeting.id &&
                    respondingInvite?.action === "accepted" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    <span className="ml-1">Accept</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
