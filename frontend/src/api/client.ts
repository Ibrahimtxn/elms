import axios, { AxiosError } from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";

export const apiClient = axios.create({
  baseURL,
  timeout: 10000,
});

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorBody>;
    const message = axiosError.response?.data?.error?.message;
    if (message) return message;
    if (axiosError.message) return axiosError.message;
  }
  return "Something went wrong. Please try again.";
}

// --- Token storage ---
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getRefreshToken(): string | null {
  return localStorage.getItem("elms_refresh_token");
}

export function setRefreshToken(token: string | null) {
  if (token) localStorage.setItem("elms_refresh_token", token);
  else localStorage.removeItem("elms_refresh_token");
}

apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

interface TokenPair {
  access_token: string;
  refresh_token: string;
}

// Shared in-flight refresh promise: if several requests 401 at once
// (e.g. React StrictMode's double-invoked effects in dev), they all
// await the SAME refresh call instead of racing or bailing on each other.
let refreshPromise: Promise<TokenPair> | null = null;

async function performRefresh(): Promise<TokenPair> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token available");

  const { data } = await axios.post<TokenPair>(`${baseURL}/auth/refresh`, {
    refresh_token: refreshToken,
  });
  setAccessToken(data.access_token);
  setRefreshToken(data.refresh_token);
  return data;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as typeof error.config & { _retried?: boolean };

    if (error.response?.status === 401 && original && !original._retried) {
      original._retried = true;
      try {
        if (!refreshPromise) {
          refreshPromise = performRefresh().finally(() => {
            refreshPromise = null;
          });
        }
        const tokens = await refreshPromise;
        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${tokens.access_token}`;
        return apiClient(original);
      } catch {
        setAccessToken(null);
        setRefreshToken(null);
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);