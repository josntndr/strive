"use client";

import axios from "axios";

export const AUTH_TOKEN_KEY = "striveToken";
export const AUTH_USER_KEY = "striveUser";
export const AUTH_CHANGED_EVENT = "strive-auth-changed";

export type AuthUser = {
  id: string;
  fullName?: string;
  name?: string;
  email: string;
  role: "user" | "admin";
};

// When NEXT_PUBLIC_API_URL is "" (or unset in production), API calls go to the
// same origin. Local frontend-only dev still falls back to the backend port.
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  (process.env.NODE_ENV === "production" ? "" : "http://localhost:5000");

export const api = axios.create({
  baseURL: API_BASE_URL,
});

type JsonResponse<T> = {
  ok: boolean;
  status: number;
  data: T | null;
  message: string;
};

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

const notifyAuthChanged = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
};

export const saveAuth = (token: string, user: AuthUser) => {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  notifyAuthChanged();
};

export const getStoredUser = (): AuthUser | null => {
  if (typeof window === "undefined") return null;

  const rawUser = localStorage.getItem(AUTH_USER_KEY);
  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser);
  } catch {
    return null;
  }
};

export const clearAuth = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  sessionStorage.removeItem(AUTH_TOKEN_KEY);
  sessionStorage.removeItem(AUTH_USER_KEY);
  notifyAuthChanged();
};

export const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

export const hasAuthSession = () => Boolean(getToken());

export const isUnauthorizedError = (error: unknown) =>
  axios.isAxiosError(error) && error.response?.status === 401;

export const getCurrentUser = async () => {
  const token = getToken();
  if (!token) return null;

  const response = await api.get<{ user: AuthUser }>("/api/auth/me");
  if (response.data.user) {
    saveAuth(token, response.data.user);
  }

  return response.data.user;
};

export const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    const data = error.response?.data;

    if (data && typeof data === "object" && "message" in data && typeof data.message === "string") {
      return data.message;
    }

    return fallback;
  }

  return fallback;
};

const isJsonContentType = (contentType: string | null) =>
  Boolean(contentType && contentType.includes("application/json"));

const isOfflineError = (error: unknown) =>
  error instanceof TypeError && error.message === "Failed to fetch";

export const postJson = async <T>(
  path: string,
  body: unknown
): Promise<JsonResponse<T>> => {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const contentType = response.headers.get("content-type");
    let data: T | null = null;

    if (isJsonContentType(contentType)) {
      data = (await response.json()) as T;
    }

    const message =
      data && typeof data === "object" && data !== null && "message" in data && typeof (data as { message?: unknown }).message === "string"
        ? ((data as { message: string }).message)
        : response.ok
          ? "Request completed successfully."
          : "Registration failed. Please check if the backend server is running.";

    return {
      ok: response.ok,
      status: response.status,
      data,
      message,
    };
  } catch (error: unknown) {
    if (isOfflineError(error)) {
      throw new Error(`Unable to connect to the backend server. Please make sure the backend is running on ${API_BASE_URL}.`);
    }

    throw new Error("Registration failed. Please check if the backend server is running.");
  }
};
