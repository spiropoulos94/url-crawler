import axios, { type AxiosResponse } from "axios";
import type {
  LoginRequest,
  RegisterRequest,
  AddURLRequest,
  BulkActionRequest,
  PaginationParams,
} from "../types";
import {
  URLSchema,
  URLListResponseSchema,
  AuthResponseSchema,
  RegisterResponseSchema,
  LogoutResponseSchema,
  BulkActionResponseSchema,
  AddURLResponseSchema,
  type URL,
  type URLListResponse,
  type AuthResponse,
  type RegisterResponse,
  type LogoutResponse,
  type BulkActionResponse,
  type AddURLResponse,
} from "../schemas/api";
import { getErrorMessage, handleAuthError } from "../utils/errorHandler";
import { createValidatedAPIFunction } from "../utils/validation";

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

// Raw API functions (internal use only)
const rawAuthAPI = {
  login: (data: LoginRequest): Promise<AxiosResponse<AuthResponse>> =>
    api.post("/auth/login", data),

  register: (data: RegisterRequest): Promise<AxiosResponse<RegisterResponse>> =>
    api.post("/auth/register", data),

  logout: (): Promise<AxiosResponse<LogoutResponse>> =>
    api.post("/auth/logout"),
};

// Validated API functions (public interface)
export const authAPI = {
  login: createValidatedAPIFunction(rawAuthAPI.login, AuthResponseSchema),
  register: createValidatedAPIFunction(rawAuthAPI.register, RegisterResponseSchema),
  logout: createValidatedAPIFunction(rawAuthAPI.logout, LogoutResponseSchema),
};

// Raw URL API functions (internal use only)
const rawUrlAPI = {
  getAll: (params: PaginationParams): Promise<AxiosResponse<URLListResponse>> => 
    api.get("/urls", { params }),

  getById: (id: number): Promise<AxiosResponse<URL>> => api.get(`/urls/${id}`),

  add: (data: AddURLRequest): Promise<AxiosResponse<AddURLResponse>> =>
    api.post("/urls", data),

  bulkAction: (
    data: BulkActionRequest
  ): Promise<AxiosResponse<BulkActionResponse>> =>
    api.post("/urls/bulk", data),
};

// Validated URL API functions (public interface)
export const urlAPI = {
  getAll: createValidatedAPIFunction(rawUrlAPI.getAll, URLListResponseSchema),
  getById: createValidatedAPIFunction(rawUrlAPI.getById, URLSchema),
  add: createValidatedAPIFunction(rawUrlAPI.add, AddURLResponseSchema),
  bulkAction: createValidatedAPIFunction(rawUrlAPI.bulkAction, BulkActionResponseSchema),
};

export default api;
