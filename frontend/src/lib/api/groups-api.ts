import { Group, GroupMember, GroupInvite } from "@/lib/typings/models";
import { useAuthStore } from "@/lib/stores/auth-store";

const API_BASE = "/api/v1";

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
    const response = await fetch(`${API_BASE}/group`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Get all groups (visible to all authenticated users)
  getAllGroups: async (): Promise<{ success: boolean; data: Group[] }> => {
    const response = await fetch(`${API_BASE}/group`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  // Get group by ID
  getGroupById: async (
    groupId: number
  ): Promise<{ success: boolean; data: Group }> => {
    const response = await fetch(`${API_BASE}/group/${groupId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  // Get group members
  getGroupMembers: async (
    groupId: number
  ): Promise<{ success: boolean; data: GroupMember[] }> => {
    const response = await fetch(`${API_BASE}/group/${groupId}/members`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  // Get user's groups (through GroupMember)
  getMyGroups: async (): Promise<{ success: boolean; data: GroupMember[] }> => {
    const response = await fetch(`${API_BASE}/group/memberships`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  // Add member to group (Admin only)
  addMember: async (data: { users: number[]; groupId: number }) => {
    const response = await fetch(`${API_BASE}/group/add-member`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
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
    const response = await fetch(`${API_BASE}/group-invite`, {
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
      `${API_BASE}/group-invite/receiver/${receiverId}`,
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
    const response = await fetch(
      `${API_BASE}/group-invite/sender/${senderId}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );
    return response.json();
  },

  // Accept or decline invite
  respondToInvite: async (data: {
    groupInviteId: number;
    status: "accepted" | "declined";
  }) => {
    const response = await fetch(`${API_BASE}/group-invite/response`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  },
};
