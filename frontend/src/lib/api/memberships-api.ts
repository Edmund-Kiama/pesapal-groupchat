import { GroupMember, Group } from "@/lib/typings/models";
import { useAuthStore } from "@/lib/stores/auth-store";

const API_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001/api/v1";

export interface MembershipsResponse {
  success: boolean;
  data: (GroupMember & { user: any; group: any })[];
  message?: string;
}

export interface MembershipResponse {
  success: boolean;
  data: GroupMember;
  message?: string;
}

export interface GroupsResponse {
  success: boolean;
  data: (Group & { creator?: any; memberCount?: number })[];
  message?: string;
}

export interface GroupResponse {
  success: boolean;
  data: Group;
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

export const membershipsApi = {
  // Get all memberships (group members)
  getAllMemberships: async (): Promise<MembershipsResponse> => {
    const response = await fetch(`${API_URL}/group/memberships`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch memberships");
    }

    return response.json();
  },

  // Get memberships by user ID
  getUserMemberships: async (userId: number): Promise<MembershipsResponse> => {
    const response = await fetch(`${API_URL}/user/memberships/${userId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user memberships");
    }

    return response.json();
  },

  // Get memberships for groups created by a specific user (admin's groups)
  getCreatorMemberships: async (
    userId: number
  ): Promise<MembershipsResponse> => {
    const response = await fetch(
      `${API_URL}/group/memberships/creator/${userId}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch creator memberships");
    }

    return response.json();
  },

  // Get group members
  getGroupMembers: async (
    groupId: number
  ): Promise<{ success: boolean; data: any[] }> => {
    const response = await fetch(`${API_URL}/group/${groupId}/members`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch group members");
    }

    return response.json();
  },

  // Create a group
  createGroup: async (data: {
    name: string;
    description?: string;
  }): Promise<{ success: boolean; data: Group; message?: string }> => {
    const response = await fetch(`${API_URL}/group`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to create group");
    }

    return response.json();
  },

  // Get all groups
  getAllGroups: async (): Promise<GroupsResponse> => {
    const response = await fetch(`${API_URL}/group`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch groups");
    }

    return response.json();
  },

  // Get groups created by a specific user
  getGroupsByCreator: async (userId: number): Promise<GroupsResponse> => {
    const response = await fetch(`${API_URL}/group/creator/${userId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch groups by creator");
    }

    return response.json();
  },

  // Get group by ID
  getGroupById: async (groupId: number): Promise<GroupResponse> => {
    const response = await fetch(`${API_URL}/group/${groupId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch group");
    }

    return response.json();
  },

  // Delete a group (admin only)
  deleteGroup: async (groupId: number): Promise<DeleteResponse> => {
    const response = await fetch(`${API_URL}/group/${groupId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to delete group");
    }

    return response.json();
  },

  // Leave a group
  leaveGroup: async (groupId: number): Promise<DeleteResponse> => {
    const response = await fetch(`${API_URL}/group/${groupId}/leave`, {
      method: "POST",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to leave group");
    }

    return response.json();
  },

  // Add member to group (admin only)
  addMember: async (data: {
    users: number[];
    groupId: number;
  }): Promise<{
    success: boolean;
    message: string;
    addedCount?: number;
    skippedCount?: number;
  }> => {
    const response = await fetch(`${API_URL}/group/add-member`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to add member");
    }

    return response.json();
  },

  // Remove a member from a group (creator only)
  removeMember: async (
    groupId: number,
    userId: number
  ): Promise<DeleteResponse> => {
    const response = await fetch(
      `${API_URL}/group/${groupId}/members/${userId}`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to remove member");
    }

    return response.json();
  },

  // Get memberships for groups that a user is a member of
  getMembershipsByUserMembership: async (
    userId: number
  ): Promise<MembershipsResponse> => {
    const response = await fetch(
      `${API_URL}/group/memberships/user/${userId}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch memberships by user membership");
    }

    return response.json();
  },
};
