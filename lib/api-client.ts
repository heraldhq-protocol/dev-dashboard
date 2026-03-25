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

const ADMIN_API_URL = process.env.NEXT_PUBLIC_HERALD_ADMIN_API_URL || "https://admin-api.herald.xyz";

export const apiClient = axios.create({
  baseURL: ADMIN_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

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
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh & error normalization
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

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

    const message = (error.response?.data as { message?: string })?.message || error.message || "An unexpected error occurred";
    const statusCode = error.response?.status || 500;
    
    return Promise.reject(new HeraldApiError(message, statusCode, error.response?.data));
  }
);
