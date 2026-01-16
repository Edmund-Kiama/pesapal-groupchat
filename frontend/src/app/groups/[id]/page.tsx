"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { groupApi } from "@/lib/api/groups-api";
import { Group } from "@/lib/typings/models";
import { useAuthStore } from "@/lib/stores/auth-store";
import { ChatWindow } from "@/components/groups/chat";
import { MeetingList } from "@/components/groups/meeting-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Users, Calendar, Clock, User } from "lucide-react";

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const groupId = parseInt(params.id as string);

  const [group, setGroup] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (groupId) {
      fetchGroup();
    }
  }, [groupId]);

  const fetchGroup = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await groupApi.getGroupById(groupId);
      if (response.success && response.data) {
        setGroup(response.data);
      } else {
        setError("Group not found");
      }
    } catch (err) {
      console.error("Failed to fetch group:", err);
      setError("Failed to load group");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string | Date) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateStr: string | Date) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || "Group not found"}</p>
          <Button onClick={() => router.push("/groups")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Groups
          </Button>
        </div>
      </div>
    );
  }

  const isCreator = group.created_by === user?.id;

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Header with back button */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/groups")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{group.name}</h1>
          <p className="text-muted-foreground text-sm">Group Chat</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Group Info & Meetings */}
        <div className="space-y-6">
          {/* Group Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Group Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {group.description && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Description
                  </p>
                  <p className="text-sm">{group.description}</p>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="font-medium">{group.memberCount || 0}</span>{" "}
                  members
                </span>
              </div>

              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Created by{" "}
                  <span className="font-medium">
                    {group.creator?.name || "Unknown"}
                  </span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Created on {formatDate(group.createdAt)}
                </span>
              </div>

              {isCreator && (
                <Badge variant="outline" className="mt-2">
                  You are the creator
                </Badge>
              )}
            </CardContent>
          </Card>

          {/* Meetings Card */}
          <MeetingList
            groupId={groupId}
            onCreateMeeting={
              isCreator
                ? () => {
                    // Could open a modal or navigate to create meeting
                    console.log("Create meeting for group:", groupId);
                  }
                : undefined
            }
          />
        </div>

        {/* Right column: Chat Window */}
        <div className="lg:col-span-2">
          <Card className="h-[calc(100vh-200px)] min-h-[500px]">
            <CardHeader className="border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Group Chat
              </CardTitle>
            </CardHeader>
            <div className="h-[calc(100%-60px)]">
              <ChatWindow groupId={groupId} groupName={group.name} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
