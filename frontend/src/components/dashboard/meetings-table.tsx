"use client";

import { useEffect, useState } from "react";
import { GroupMeeting } from "@/lib/typings/models";
import { groupMeetingApi } from "@/lib/api/groups-api";
import { useAuthStore } from "@/lib/stores/auth-store";
import { UserRole } from "@/lib/typings/models";
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
  Calendar,
  Clock,
  MapPin,
  Eye,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

export function MeetingsTable() {
  const { user } = useAuthStore();
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      let response;
      // Get meetings for groups the user is a member of
      if (user) {
        response = await groupMeetingApi.getMeetingsByUserMembership(user.id);
        if (response.success) {
          setMeetings(response.data || []);
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch meetings");
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTimeOnly = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInviteStats = (meeting: any) => {
    const invited = meeting.invited || [];
    const accepted = invited.filter((i: any) => i.status === "accepted").length;
    const declined = invited.filter((i: any) => i.status === "declined").length;
    const pending = invited.filter((i: any) => i.status === "pending").length;
    return { accepted, declined, pending, total: invited.length };
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Group Meetings
        </CardTitle>
        <Button variant="outline" size="sm" onClick={fetchMeetings}>
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
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
                  <TableHead>Meeting</TableHead>
                  <TableHead>Group</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Organizer</TableHead>
                  <TableHead>Invites</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {meetings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      No meetings found
                    </TableCell>
                  </TableRow>
                ) : (
                  meetings.map((meeting) => {
                    const stats = getInviteStats(meeting);
                    return (
                      <TableRow key={meeting.id}>
                        <TableCell className="font-medium">
                          #{meeting.id}
                        </TableCell>
                        <TableCell className="font-medium">
                          Group Meeting
                        </TableCell>
                        <TableCell>
                          {meeting.group?.name || `Group #${meeting.groupId}`}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            {meeting.location}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {
                            formatDateTime(String(meeting.time_from)).split(
                              ","
                            )[0]
                          }
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            {formatTimeOnly(String(meeting.time_from))} -{" "}
                            {formatTimeOnly(String(meeting.time_to))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {meeting.creator?.name ||
                            `User #${meeting.created_by}`}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 justify-center">
                            <Badge variant="default" className="text-xs">
                              {stats.accepted} ✓
                            </Badge>
                            <Badge variant="destructive" className="text-xs">
                              {stats.declined} ✗
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {stats.pending} ⏳
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
