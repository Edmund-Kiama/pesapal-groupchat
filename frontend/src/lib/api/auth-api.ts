import { User } from "@/lib/typings/models";
import { Tokens } from "@/lib/typings/auth-typings";
import { useAuthStore } from "@/lib/stores/auth-store";

const API_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "https://pesapal-groupchat-production.up.railway.app/api/v1" || "http://localhost:3001/api/v1";

const getAuthHeaders = () => {
  const token = useAuthStore.getState().token;
  return {
    Authorization: token ? `Bearer ${token}` : "",
  };
};

export interface LoginResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
  message?: string;
}

export interface SignupResponse {
  success: boolean;
  data: {
    token: string;
    user: User;
  };
  message?: string;
}

export interface ApiError {
  success: boolean;
  message: string;
}

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await fetch(`${API_URL}/auth/log-in`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Login failed");
    }

    return response.json();
  },

  signup: async (
    name: string,
    email: string,
    password: string
  ): Promise<SignupResponse> => {
    const response = await fetch(`${API_URL}/auth/sign-up`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Signup failed");
    }

    return response.json();
  },

  getUsers: async (): Promise<{ data: User[] }> => {
    const response = await fetch(`${API_URL}/user`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }

    return response.json();
  },

  deleteUser: async (
    userId: number
  ): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_URL}/user/${userId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete user");
    }

    return response.json();
  },
};
