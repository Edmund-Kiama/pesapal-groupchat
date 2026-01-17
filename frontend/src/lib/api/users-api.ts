import { User } from "@/lib/typings/models";
import { useAuthStore } from "@/lib/stores/auth-store";

const API_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "https://pesapal-groupchat-production.up.railway.app/api/v1"  || "http://localhost:3001/api/v1";

export interface UsersResponse {
  success: boolean;
  data: User[];
  message?: string;
}

export interface UserResponse {
  success: boolean;
  data: User;
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

export const usersApi = {
  // Get all users
  getAllUsers: async (): Promise<UsersResponse> => {
    const response = await fetch(`${API_URL}/user`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }

    return response.json();
  },

  // Get user by ID
  getUserById: async (userId: number): Promise<UserResponse> => {
    const response = await fetch(`${API_URL}/user/${userId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user");
    }

    return response.json();
  },

  // Delete user (admin only)
  deleteUser: async (userId: number): Promise<DeleteResponse> => {
    const response = await fetch(`${API_URL}/user/${userId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to delete user");
    }

    return response.json();
  },
};
