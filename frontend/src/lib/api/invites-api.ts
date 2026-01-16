import { GroupInvite, GroupMeetingInvite } from "@/lib/typings/models";
import { useAuthStore } from "@/lib/stores/auth-store";

const API_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001/api/v1";

export interface GroupInvitesResponse {
  success: boolean;
  data: GroupInvite[];
  message?: string;
}

export interface GroupMeetingInvitesResponse {
  success: boolean;
  data: any[];
  message?: string;
}

export interface InviteResponse {
  success: boolean;
  data?: any;
  message?: string;
}

export interface DeleteResponse {
  success: boolean;
  message: string;
}

const getAuthHeaders = () => {
  const token = useAuthStore.getState().token;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const invitesApi = {
  // ============================
  // Group Invites
  // ============================

  // Create group invite
  createGroupInvite: async (data: {
    receiverId: number;
    groupId: number;
  }): Promise<InviteResponse> => {
    const response = await fetch(`${API_URL}/group-invite`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to create group invite");
    }

    return response.json();
  },

  // Get received invites (by receiver ID)
  getReceivedInvites: async (
    receiverId: number
  ): Promise<GroupInvitesResponse> => {
    const response = await fetch(
      `${API_URL}/group-invite/receiver/${receiverId}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch received invites");
    }

    return response.json();
  },

  // Get sent invites (by sender ID)
  getSentInvites: async (senderId: number): Promise<GroupInvitesResponse> => {
    const response = await fetch(`${API_URL}/group-invite/sender/${senderId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch sent invites");
    }

    return response.json();
  },

  // Respond to group invite (accept/decline)
  respondToInvite: async (data: {
    groupInviteId: number;
    status: "accepted" | "declined";
  }): Promise<InviteResponse> => {
    const response = await fetch(`${API_URL}/group-invite/response`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to respond to invite");
    }

    return response.json();
  },

  // Cancel a pending invite
  cancelInvite: async (inviteId: number): Promise<DeleteResponse> => {
    const response = await fetch(`${API_URL}/group-invite/${inviteId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to cancel invite");
    }

    return response.json();
  },

  // ============================
  // Group Meeting Invites
  // ============================

  // Create group meeting invite
  createMeetingInvite: async (data: {
    meetingId: number;
    userId: number;
  }): Promise<InviteResponse> => {
    const response = await fetch(`${API_URL}/group-meeting-invite`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to create meeting invite");
    }

    return response.json();
  },

  // Get meeting invites by user ID
  getMeetingInvitesByUser: async (
    userId: number
  ): Promise<GroupMeetingInvitesResponse> => {
    const response = await fetch(
      `${API_URL}/group-meeting-invite/user/${userId}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch meeting invites");
    }

    return response.json();
  },

  // Respond to meeting invite (accept/decline)
  respondToMeetingInvite: async (data: {
    meetingId: number;
    status: "accepted" | "declined";
  }): Promise<InviteResponse> => {
    const response = await fetch(`${API_URL}/group-meeting/response`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to respond to meeting invite");
    }

    return response.json();
  },
};
