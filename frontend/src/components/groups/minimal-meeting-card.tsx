"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Calendar,
  MapPin,
  Users,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface MinimalMeetingCardProps {
  meeting: any;
  isAdmin?: boolean;
  onInviteClick?: () => void;
}

export function MinimalMeetingCard({
  meeting,
  isAdmin = false,
  onInviteClick,
}: MinimalMeetingCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

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

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return (
          <Badge variant="default" className="text-xs">
            Going
          </Badge>
        );
      case "declined":
        return (
          <Badge variant="destructive" className="text-xs">
            Can't go
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="text-xs">
            Pending
          </Badge>
        );
    }
  };

  const acceptedCount =
    meeting.invited?.filter((inv: any) => inv.status === "accepted").length ||
    0;
  const inviteCount = meeting.invited?.length || 0;

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Main compact row - always visible */}
      <div
        className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 text-primary shrink-0">
          <Calendar className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm truncate">
              {formatDate(meeting.time_from)}
            </span>
            {getStatusBadge(meeting.userStatus || "pending")}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTime(meeting.time_from)} - {formatTime(meeting.time_to)}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {acceptedCount}/{inviteCount}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="border-t px-3 py-3 bg-muted/30">
          <div className="space-y-2 text-sm">
            {/* Location */}
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />
              <span>{meeting.location}</span>
            </div>

            {/* Full time info */}
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4 shrink-0" />
              <span>
                {formatDateTime(meeting.time_from)} →{" "}
                {formatTime(meeting.time_to)}
              </span>
            </div>

            {/* Organizer */}
            {meeting.creator && (
              <p className="text-xs text-muted-foreground pt-1">
                Organized by {meeting.creator.name}
              </p>
            )}

            {/* Admin section - invited members */}
            {isAdmin && meeting.invited && meeting.invited.length > 0 && (
              <div className="pt-2">
                <p className="text-xs text-muted-foreground mb-1">Invited:</p>
                <div className="flex flex-wrap gap-1">
                  {meeting.invited.map((inv: any) => (
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

            {/* Action button for admin */}
            {/* {isAdmin && onInviteClick && (
              <Button
                size="sm"
                variant="outline"
                className="mt-2 w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  onInviteClick();
                }}
              >
                <Users className="h-3 w-3 mr-1" />
                Manage Invitees
              </Button>
            )} */}
          </div>
        </div>
      )}
    </div>
  );
}
