const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api";

type SessionScope = "user" | "admin";

const KEYS = {
  user: {
    access: "solenne-user-access",
    refresh: "solenne-user-refresh",
  },
  admin: {
    access: "solenne-admin-access",
    refresh: "solenne-admin-refresh",
  },
};

export interface ApiError extends Error {
  status: number;
}

export function getAccessToken(scope: SessionScope = "user") {
  return window.localStorage.getItem(KEYS[scope].access);
}

export function storeTokens(scope: SessionScope, access: string, refresh?: string) {
  window.localStorage.setItem(KEYS[scope].access, access);
  if (refresh) window.localStorage.setItem(KEYS[scope].refresh, refresh);
}

export function clearTokens(scope: SessionScope) {
  window.localStorage.removeItem(KEYS[scope].access);
  window.localStorage.removeItem(KEYS[scope].refresh);
}

async function request<T>(
  scope: SessionScope,
  path: string,
  init: RequestInit = {},
  retry = true
): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const access = getAccessToken(scope);
  if (access) {
    headers.set("Authorization", `Bearer ${access}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });

  if (response.status === 401 && retry) {
    const refresh = window.localStorage.getItem(KEYS[scope].refresh);
    if (refresh) {
      const tokenResponse = await fetch(`${API_BASE_URL}/auth/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      });

      if (tokenResponse.ok) {
        const tokens = (await tokenResponse.json()) as { access: string; refresh?: string };
        storeTokens(scope, tokens.access, tokens.refresh ?? refresh);
        return request<T>(scope, path, init, false);
      }
    }
    clearTokens(scope);
  }

  const payload = (await response.json().catch(() => null)) as {
    detail?: string;
    message?: string;
  } | null;

  if (!response.ok) {
    const error = new Error(
      payload?.detail ?? payload?.message ?? `API request failed (${response.status}).`
    ) as ApiError;
    error.status = response.status;
    throw error;
  }

  return payload as T;
}

export const userApi = {
  get: <T>(path: string) => request<T>("user", path),
  post: <T>(path: string, body: unknown) =>
    request<T>("user", path, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  patch: <T>(path: string, body: unknown) =>
    request<T>("user", path, { method: "PATCH", body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>("user", path, { method: "PUT", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>("user", path, { method: "DELETE" }),
};

export const adminApi = {
  get: <T>(path: string) => request<T>("admin", path),
  post: <T>(path: string, body: unknown) =>
    request<T>("admin", path, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  patch: <T>(path: string, body: unknown) =>
    request<T>("admin", path, { method: "PATCH", body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>("admin", path, { method: "PUT", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>("admin", path, { method: "DELETE" }),
};

// Default api alias for user scope to maintain compatibility
export const api = userApi;
