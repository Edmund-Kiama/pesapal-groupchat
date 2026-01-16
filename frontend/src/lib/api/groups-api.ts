import { Group, GroupMember, GroupInvite } from "@/lib/typings/models";
import { useAuthStore } from "@/lib/stores/auth-store";

const API_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001/api/v1";

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = useAuthStore.getState().token;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// ============================================
// Group API
// ============================================

export const groupApi = {
  // Create a new group (Admin only)
  createGroup: async (data: { name: string; description: string }) => {
    const response = await fetch(`${API_URL}/group`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Get all groups (visible to all authenticated users)
  getAllGroups: async (): Promise<{ success: boolean; data: Group[] }> => {
    const response = await fetch(`${API_URL}/group`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  // Get group by ID
  getGroupById: async (
    groupId: number
  ): Promise<{ success: boolean; data: Group }> => {
    const response = await fetch(`${API_URL}/group/${groupId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  // Get group members
  getGroupMembers: async (
    groupId: number
  ): Promise<{ success: boolean; data: GroupMember[] }> => {
    const response = await fetch(`${API_URL}/group/${groupId}/members`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  // Get user's groups (through GroupMember)
  getMyGroups: async (): Promise<{ success: boolean; data: GroupMember[] }> => {
    const response = await fetch(`${API_URL}/group/memberships`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  // Delete a group (only creator can delete)
  deleteGroup: async (
    groupId: number
  ): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_URL}/group/${groupId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  // Leave a group (non-creator members only)
  leaveGroup: async (
    groupId: number
  ): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_URL}/group/${groupId}/leave`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  // Add member to group (Admin only)
  addMember: async (data: { users: number[]; groupId: number }) => {
    const response = await fetch(`${API_URL}/group/add-member`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Get all users (for inviting)
  getUsers: async (): Promise<{ success: boolean; data: any[] }> => {
    const response = await fetch(`${API_URL}/user`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return response.json();
  },
};

// ============================================
// Group Invite API
// ============================================

export const groupInviteApi = {
  // Create group invite (Admin only)
  createInvite: async (data: { receiverId: number; groupId: number }) => {
    const response = await fetch(`${API_URL}/group-invite`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Get pending invites received by user
  getReceivedInvites: async (
    receiverId: number
  ): Promise<{ success: boolean; data: GroupInvite[] }> => {
    const response = await fetch(
      `${API_URL}/group-invite/receiver/${receiverId}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );
    return response.json();
  },

  // Get invites sent by user
  getSentInvites: async (
    senderId: number
  ): Promise<{ success: boolean; data: GroupInvite[] }> => {
    const response = await fetch(`${API_URL}/group-invite/sender/${senderId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  // Accept or decline invite
  respondToInvite: async (data: {
    groupInviteId: number;
    status: "accepted" | "declined";
  }) => {
    const response = await fetch(`${API_URL}/group-invite/response`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Cancel a pending invite (admin only)
  cancelInvite: async (
    inviteId: number
  ): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_URL}/group-invite/${inviteId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return response.json();
  },
};
