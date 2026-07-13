import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL } from "./constants";
import { storage } from "./storage";

export type ApiErrorResponse = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = storage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const redirectToLogin = () => {
  if (typeof window === "undefined") return;
  storage.clearAll();
  if (!window.location.pathname.startsWith("/login")) {
    window.location.href = "/login";
  }
};

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response?.status === 401) {
      redirectToLogin();
    }
    return Promise.reject(error);
  }
);

export const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.message || error.message || "Request failed";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Request failed";
};
