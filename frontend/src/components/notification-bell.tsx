"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth-store";
import {
  notificationsApi,
  NotificationsResponse,
} from "@/lib/api/notifications-api";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, formatDistanceToNow } from "@/lib/utils";
import { Notification } from "@/lib/typings/models";

export function NotificationBell() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: notificationsData, isLoading } =
    useQuery<NotificationsResponse>({
      queryKey: ["notifications", user?.id],
      queryFn: async () => {
        if (!user?.id) return { success: true, data: [] };
        return notificationsApi.getUserNotifications(user.id);
      },
      enabled: !!user?.id,
    });

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: number) =>
      notificationsApi.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notifications", user?.id],
      });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!notificationsData?.data) return;
      const unreadNotifications = notificationsData.data.filter(
        (n: Notification) => !n.isRead
      );
      await Promise.all(
        unreadNotifications.map((n: Notification) =>
          notificationsApi.markAsRead(n.id)
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notifications", user?.id],
      });
    },
  });

  const notifications = notificationsData?.data || [];
  const unreadCount = notifications.filter(
    (n: Notification) => !n.isRead
  ).length;

  const handleMarkAsRead = (notificationId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    markAsReadMutation.mutate(notificationId);
  };

  const handleMarkAllAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAllAsReadMutation.mutate();
  };

  if (!user) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={markAllAsReadMutation.isPending}
              className="text-xs"
            >
              <CheckCheck className="h-4 w-4 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        {isLoading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No notifications
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="p-2">
              {notifications.map((notification: Notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "flex flex-col gap-1 p-3 rounded-lg mb-2 last:mb-0 transition-colors",
                    !notification.isRead
                      ? "bg-primary/5 border border-primary/10"
                      : "hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={cn(
                        "text-sm",
                        !notification.isRead
                          ? "font-medium"
                          : "text-muted-foreground"
                      )}
                    >
                      {notification.message}
                    </span>
                    {!notification.isRead && (
                      <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                    {!notification.isRead && (
                      <Button
                        variant="link"
                        size="sm"
                        className="text-xs h-auto p-0 text-muted-foreground hover:text-primary"
                        onClick={(e) => handleMarkAsRead(notification.id, e)}
                        disabled={markAsReadMutation.isPending}
                      >
                        Mark as read
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  );
}
