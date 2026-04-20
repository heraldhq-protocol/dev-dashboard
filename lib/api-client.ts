import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { getSession, signIn } from "next-auth/react";

export class HeraldApiError extends Error {
  public statusCode: number;
  public data: unknown;

  constructor(message: string, statusCode: number, data?: unknown) {
    super(message);
    this.name = "HeraldApiError";
    this.statusCode = statusCode;
    this.data = data;
  }
}

const ADMIN_API_URL =
  process.env.NEXT_PUBLIC_HERALD_ADMIN_API_URL ||
  "https://admin-api.useherald.xyz";

export const apiClient = axios.create({
  baseURL: ADMIN_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Notification Gateway API URL (dynamic based on environment)
export function getNotificationGatewayUrl(): string {
  if (process.env.NEXT_PUBLIC_NOTIFICATION_GATEWAY_URL) {
    return process.env.NEXT_PUBLIC_NOTIFICATION_GATEWAY_URL;
  }
  // Default to local in development, production API otherwise
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3002";
  }
  return "https://api.useherald.xyz";
}

export function getNotificationApiClient(apiKey: string) {
  const client = axios.create({
    baseURL: getNotificationGatewayUrl(),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
  });

  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      const message =
        (error.response?.data as { message?: string })?.message ||
        error.message ||
        "Notification gateway error";
      return Promise.reject(
        new HeraldApiError(
          message,
          error.response?.status || 500,
          error.response?.data,
        ),
      );
    },
  );

  return client;
}

// Request interceptor for injecting auth token
apiClient.interceptors.request.use(
  async (config) => {
    // Inject token automatically for client-side requests
    // Server-side usage should manually attach headers
    if (typeof window !== "undefined") {
      const session = await getSession();
      if (session?.accessToken) {
        config.headers.Authorization = `Bearer ${session.accessToken}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor for token refresh & error normalization
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 Unauthorized (Token expiry)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (typeof window !== "undefined") {
        // Calling getSession triggers NextAuth's JWT callback which handles the refresh logic internally
        const session = await getSession();

        if (session?.error === "RefreshAccessTokenError") {
          // Hard token expiry/revocation — kick user
          signIn("wallet");
          return Promise.reject(error);
        }

        if (session?.accessToken) {
          // Retry the original request with the fresh token
          originalRequest.headers.Authorization = `Bearer ${session.accessToken}`;
          return apiClient(originalRequest);
        }
      }
    }

    const message =
      (error.response?.data as { message?: string })?.message ||
      error.message ||
      "An unexpected error occurred";
    const statusCode = error.response?.status || 500;

    return Promise.reject(
      new HeraldApiError(message, statusCode, error.response?.data),
    );
  },
);
