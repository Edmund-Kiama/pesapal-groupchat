"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { groupMeetingApi } from "@/lib/api/groups-api";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Loader2, Calendar, Users } from "lucide-react";
import { MinimalMeetingCard } from "./minimal-meeting-card";

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
            Meetings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No meetings scheduled yet.
          </p>
          {isAdmin && onCreateMeeting && (
            <Button onClick={onCreateMeeting} className="mt-4 w-full">
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Meeting
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
            Meetings
          </div>
          {isAdmin && onCreateMeeting && (
            <Button size="sm" onClick={onCreateMeeting}>
              <Calendar className="mr-1 h-4 w-4" />
              New
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {meetings.map((meeting) => (
            <MinimalMeetingCard
              key={meeting.id}
              meeting={{
                ...meeting,
                userStatus: getUserResponseStatus(meeting),
              }}
              isAdmin={isAdmin}
              onInviteClick={onCreateMeeting}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
