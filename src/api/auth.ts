import { userApi, adminApi, clearTokens, storeTokens } from "./client";

export interface ApiUser {
  uid: string;
  email: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: "admin" | "customer";
}

interface AuthResponse {
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
    is_staff: boolean;
  };
  access: string;
  refresh: string;
}

function toUser(user: AuthResponse["user"]): ApiUser {
  return {
    uid: String(user.id),
    email: user.email,
    displayName: `${user.first_name} ${user.last_name}`.trim() || user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    phone: user.phone,
    role: user.is_staff ? "admin" : "customer",
  };
}

// Scoped Auth Implementation
function createAuthService(scope: "user" | "admin") {
  const api = scope === "admin" ? adminApi : userApi;

  return {
    register: async (name: string, email: string, password: string) => {
      const parts = name.trim().split(/\s+/);
      const response = await api.post<AuthResponse>("/auth/register/", {
        email,
        password,
        first_name: parts[0] ?? "",
        last_name: parts.slice(1).join(" "),
      });
      storeTokens(scope, response.access, response.refresh);
      return toUser(response.user);
    },

    login: async (email: string, password: string) => {
      const response = await api.post<AuthResponse>("/auth/login/", { email, password });
      storeTokens(scope, response.access, response.refresh);
      return toUser(response.user);
    },

    currentUser: async () => {
      const user = await api.get<AuthResponse["user"]>("/auth/me/");
      return toUser(user);
    },

    updateProfile: async (name: string, phone = "") => {
      const parts = name.trim().split(/\s+/);
      const user = await api.patch<AuthResponse["user"]>("/auth/me/", {
        first_name: parts[0] ?? "",
        last_name: parts.slice(1).join(" "),
        phone,
      });
      return toUser(user);
    },

    requestPasswordReset: async (email: string) => {
      return api.post<{ detail: string }>("/auth/password-reset/", { email });
    },

    logout: async () => {
      clearTokens(scope);
      return Promise.resolve();
    },
  };
}

export const userAuth = createAuthService("user");
export const adminAuth = createAuthService("admin");

// Legacy exports for compatibility (defaulting to user scope)
export const { register, login, currentUser, updateProfile, requestPasswordReset, logout } = userAuth;
