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

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data: LoginRequest): Promise<AxiosResponse<AuthResponse>> =>
    api.post("/auth/login", data),

  register: (data: RegisterRequest): Promise<AxiosResponse<{ user: User }>> =>
    api.post("/auth/register", data),
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
