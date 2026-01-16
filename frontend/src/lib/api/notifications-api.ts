import { Notification } from "@/lib/typings/models";

const API_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001/api/v1";

export interface NotificationsResponse {
  success: boolean;
  data: Notification[];
  message?: string;
}

export interface MarkAsReadResponse {
  success: boolean;
  data: Notification;
  message?: string;
}

export const notificationsApi = {
  getUserNotifications: async (
    userId: number
  ): Promise<NotificationsResponse> => {
    const response = await fetch(`${API_URL}/notification/user`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch notifications");
    }

    return response.json();
  },

  markAsRead: async (notificationId: number): Promise<MarkAsReadResponse> => {
    const response = await fetch(
      `${API_URL}/notification/${notificationId}/read`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to mark notification as read");
    }

    return response.json();
  },
};
