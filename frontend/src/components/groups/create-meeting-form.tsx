"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { groupApi, groupMeetingApi } from "@/lib/api/groups-api";
import { useAuthStore } from "@/lib/stores/auth-store";
import { GroupMember, User } from "@/lib/typings/models";
import { Loader2, Calendar, MapPin, Users, Clock, X } from "lucide-react";

interface CreateMeetingFormProps {
  groupId?: number;
  onMeetingCreated?: () => void;
  onCancel?: () => void;
}

export function CreateMeetingForm({
  groupId: initialGroupId,
  onMeetingCreated,
  onCancel,
}: CreateMeetingFormProps) {
  const [groups, setGroups] = useState<GroupMember[]>([]);
  const [groupMembers, setGroupMembers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [selectedGroupId, setSelectedGroupId] = useState<string>(
    initialGroupId?.toString() || ""
  );
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [timeFrom, setTimeFrom] = useState("");
  const [timeTo, setTimeTo] = useState("");
  const [inviteAll, setInviteAll] = useState(true);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);

  const { toast } = useToast();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchData();
  }, [user?.id, selectedGroupId]);

  const fetchData = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);

      // If no initial group, fetch user's groups
      if (!initialGroupId) {
        const groupsResponse = await groupApi.getMyGroups(user?.id);
        if (groupsResponse.success) {
          // Filter to only show groups the user created (as admin)
          const adminGroups = (groupsResponse.data || []).filter(
            (membership) => membership.group?.created_by === user.id
          );
          setGroups(adminGroups);
        }
      }

      // Fetch group members if a group is selected
      const currentGroupId = selectedGroupId || initialGroupId?.toString();
      if (currentGroupId) {
        const groupId = parseInt(currentGroupId);
        const membersResponse = await groupApi.getGroupMembers(groupId);
        if (membersResponse.success) {
          const members = (membersResponse.data || []).map(
            (m: GroupMember) => m.user
          );
          setGroupMembers(members as User[]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserToggle = (userId: number) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const currentGroupId = selectedGroupId || initialGroupId?.toString();
    if (!currentGroupId) {
      toast.error("Please select a group");
      return;
    }

    const groupId = parseInt(currentGroupId);
    if (!location || !date || !timeFrom || !timeTo) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Build datetime strings
    const timeFromStr = new Date(`${date}T${timeFrom}`).toISOString();
    const timeToStr = new Date(`${date}T${timeTo}`).toISOString();

    setIsSubmitting(true);
    try {
      const response = await groupMeetingApi.createMeeting({
        location,
        time: { from: timeFromStr, to: timeToStr },
        groupId,
        invited: inviteAll ? [] : selectedUserIds,
      });

      if (response.success) {
        toast.success("Meeting created successfully!");
        onMeetingCreated?.();
      } else {
        toast.error(response.message || "Failed to create meeting");
      }
    } catch (error) {
      toast.error("An error occurred while creating meeting");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="relative">
        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // If no initial group and no admin groups, show error
  if (!initialGroupId && groups.length === 0) {
    return (
      <Card className="relative">
        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <CardHeader>
          <CardTitle className="flex items-center gap-2 pr-8">
            <Calendar className="h-5 w-5" />
            Create Group Meeting
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            You need to create a group first before scheduling meetings.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative">
      {/* Close Button */}
      <button
        onClick={onCancel}
        className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </button>

      <CardHeader>
        <CardTitle className="flex items-center gap-2 pr-8">
          <Calendar className="h-5 w-5" />
          Create Group Meeting
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Group Selection (only if no initial group) */}
          {!initialGroupId && (
            <div className="space-y-2">
              <Label>Select Group</Label>
              <Select
                value={selectedGroupId}
                onValueChange={setSelectedGroupId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a group" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((membership) => (
                    <SelectItem
                      key={membership.groupId}
                      value={membership.groupId.toString()}
                    >
                      {membership.group?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="location"
                placeholder="Enter meeting location"
                className="pl-9"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {/* Time From and Time To */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timeFrom">Time From</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="timeFrom"
                  type="time"
                  className="pl-9"
                  value={timeFrom}
                  onChange={(e) => setTimeFrom(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeTo">Time To</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="timeTo"
                  type="time"
                  className="pl-9"
                  value={timeTo}
                  onChange={(e) => setTimeTo(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Invite Option */}
          <div className="space-y-3">
            <Label>Invite Members</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="inviteAll"
                checked={inviteAll}
                onChange={(e) => setInviteAll(e.target.checked)}
              />
              <Label htmlFor="inviteAll" className="text-sm font-normal">
                Invite all group members
              </Label>
            </div>

            {!inviteAll && groupMembers.length > 0 && (
              <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                <p className="text-xs text-muted-foreground mb-2">
                  Select specific members to invite:
                </p>
                {groupMembers.map((member) => (
                  <div key={member?.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`user-${member?.id}`}
                      checked={selectedUserIds.includes(member?.id)}
                      onChange={(e) => handleUserToggle(member?.id)}
                    />
                    <Label
                      htmlFor={`user-${member?.id}`}
                      className="text-sm font-normal flex-1"
                    >
                      {member?.name} ({member?.email})
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Buttons - Stacked vertically */}
          <div className="flex flex-col gap-2 pt-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Calendar className="mr-2 h-4 w-4" />
                  Create Meeting
                </>
              )}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
