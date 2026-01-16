"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { groupMeetingApi } from "@/lib/api/groups-api";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Loader2, Calendar, MapPin, Clock, Users } from "lucide-react";

interface MeetingListProps {
  groupId: number;
  onCreateMeeting?: () => void;
}

export function MeetingList({ groupId, onCreateMeeting }: MeetingListProps) {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    fetchMeetings();
  }, [groupId]);

  const fetchMeetings = async () => {
    try {
      setIsLoading(true);
      const response = await groupMeetingApi.getMeetingsByGroupId(groupId);
      if (response.success) {
        setMeetings(response.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch meetings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getUserResponseStatus = (meeting: any): string => {
    if (!user?.id) return "unknown";
    const invite = meeting.invited?.find((inv: any) => inv.userId === user.id);
    return invite?.status || "unknown";
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

  if (meetings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Group Meetings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No meetings scheduled for this group yet.
          </p>
          {isAdmin && onCreateMeeting && (
            <Button onClick={onCreateMeeting} className="mt-4 w-full">
              <Calendar className="mr-2 h-4 w-4" />
              Schedule a Meeting
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Group Meetings
          </div>
          {isAdmin && onCreateMeeting && (
            <Button size="sm" onClick={onCreateMeeting}>
              <Calendar className="mr-1 h-4 w-4" />
              New Meeting
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {meetings.map((meeting) => {
            const userStatus = getUserResponseStatus(meeting);
            const inviteCount = meeting.invited?.length || 0;
            const acceptedCount =
              meeting.invited?.filter((inv: any) => inv.status === "accepted")
                .length || 0;

            return (
              <div
                key={meeting.id}
                className="border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium text-lg">
                      {meeting.group?.name || "Group Meeting"}
                    </h4>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{meeting.location}</span>
                    </div>
                  </div>
                  <Badge
                    variant={
                      userStatus === "accepted"
                        ? "default"
                        : userStatus === "declined"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {userStatus === "accepted"
                      ? "Accepted"
                      : userStatus === "declined"
                      ? "Declined"
                      : "Pending"}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>From: {formatDateTime(meeting.time_from)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>To: {formatDateTime(meeting.time_to)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>
                      {acceptedCount}/{inviteCount} confirmed
                    </span>
                  </div>
                </div>

                {meeting.creator && (
                  <p className="text-xs text-muted-foreground">
                    Organized by: {meeting.creator.name}
                  </p>
                )}

                {isAdmin && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground mb-2">
                      Invited members:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {meeting.invited?.map((inv: any) => (
                        <Badge
                          key={inv.id}
                          variant={
                            inv.status === "accepted"
                              ? "default"
                              : inv.status === "declined"
                              ? "destructive"
                              : "outline"
                          }
                          className="text-xs"
                        >
                          {inv.user?.name || "Unknown"}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
