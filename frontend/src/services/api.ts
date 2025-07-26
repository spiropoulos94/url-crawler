import axios, { type AxiosResponse } from "axios";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  URL,
  URLListResponse,
  AddURLRequest,
  BulkActionRequest,
  User,
  PaginationParams,
} from "../types";
import { getErrorMessage, handleAuthError } from "../utils/errorHandler";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important: This sends cookies with requests
});

/**
 * Connects the API layer to React's error context for global error handling.
 * This bridges axios interceptors (imperative) with React context (declarative).
 * Returns a cleanup function to remove the interceptor.
 */
export function setupErrorInterceptor(showError: (message: string) => void) {
  const interceptor = api.interceptors.response.use(
    // Success: pass response through unchanged
    (response) => response,
    // Error: handle globally, then still reject for local handling
    (error) => {
      if (error.response?.status === 401) {
        // Auth errors: redirect to login (don't show toast)
        handleAuthError();
      } else {
        // Other errors: show user-friendly message in toast
        const message = getErrorMessage(error);
        showError(message);
      }
      // Always reject so components can still handle errors locally if needed
      return Promise.reject(error);
    }
  );

  // Return cleanup function to remove this specific interceptor
  return () => {
    api.interceptors.response.eject(interceptor);
  };
}

export const authAPI = {
  login: (data: LoginRequest): Promise<AxiosResponse<AuthResponse>> =>
    api.post("/auth/login", data),

  register: (data: RegisterRequest): Promise<AxiosResponse<{ user: User }>> =>
    api.post("/auth/register", data),

  logout: (): Promise<AxiosResponse<{ message: string }>> =>
    api.post("/auth/logout"),
};

export const urlAPI = {
  getAll: (params: PaginationParams): Promise<AxiosResponse<URLListResponse>> => 
    api.get("/urls", { params }),

  getById: (id: number): Promise<AxiosResponse<URL>> => api.get(`/urls/${id}`),

  add: (data: AddURLRequest): Promise<AxiosResponse<URL>> =>
    api.post("/urls", data),

  bulkAction: (
    data: BulkActionRequest
  ): Promise<AxiosResponse<{ message: string }>> =>
    api.post("/urls/bulk", data),
};

export default api;
