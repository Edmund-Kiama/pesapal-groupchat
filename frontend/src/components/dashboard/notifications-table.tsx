"use client";

import { useEffect, useState } from "react";
import { Notification, NotificationType } from "@/lib/typings/models";
import { notificationsApi } from "@/lib/api/notifications-api";
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
import { Bell, Check, Trash2, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export function NotificationsTable() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationsApi.getUserNotifications(user!.id);
      if (response.success) {
        setNotifications(response.data || []);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      setProcessing(notificationId);
      const response = await notificationsApi.markAsRead(notificationId);
      if (response.success) {
        toast.success("Notification marked as read");
        fetchNotifications();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to mark notification as read");
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

  const getNotificationTypeLabel = (type: string) => {
    return type
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getNotificationBadgeVariant = (type: string) => {
    if (type.includes("CREATED") || type.includes("ACCEPTED")) {
      return "default";
    }
    if (type.includes("DELETED") || type.includes("DECLINED")) {
      return "destructive";
    }
    return "secondary";
  };

  const getRelatedEntity = (notification: Notification) => {
    if (notification.groupId) return `Group #${notification.groupId}`;
    if (notification.meetingId) return `Meeting #${notification.meetingId}`;
    if (notification.inviteId) return `Invite #${notification.inviteId}`;
    if (notification.electionId) return `Election #${notification.electionId}`;
    if (notification.positionId) return `Position #${notification.positionId}`;
    return "-";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notifications
        </CardTitle>
        <Button variant="outline" size="sm" onClick={fetchNotifications}>
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
                  <TableHead>Type</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Related</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No notifications found
                    </TableCell>
                  </TableRow>
                ) : (
                  notifications.map((notification) => (
                    <TableRow
                      key={notification.id}
                      className={notification.isRead ? "opacity-60" : ""}
                    >
                      <TableCell>
                        <Badge
                          variant={getNotificationBadgeVariant(
                            notification.type
                          )}
                        >
                          {getNotificationTypeLabel(notification.type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {notification.message}
                      </TableCell>
                      <TableCell>{getRelatedEntity(notification)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            notification.isRead ? "secondary" : "default"
                          }
                        >
                          {notification.isRead ? "Read" : "Unread"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(String(notification.createdAt))}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {!notification.isRead && (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={processing === notification.id}
                              onClick={() => handleMarkAsRead(notification.id)}
                              title="Mark as read"
                            >
                              {processing === notification.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Check className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
