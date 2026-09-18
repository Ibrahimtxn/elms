import { apiClient } from "./client";

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface UserOut {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: "admin" | "lecturer" | "student";
  is_active: boolean;
  created_at: string;
}

export async function login(email: string, password: string): Promise<TokenPair> {
  const { data } = await apiClient.post<TokenPair>("/auth/login", { email, password });
  return data;
}

export async function fetchMe(): Promise<UserOut> {
  const { data } = await apiClient.get<UserOut>("/auth/me");
  return data;
}

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role: "student" | "lecturer";
}

export async function register(payload: RegisterPayload): Promise<UserOut> {
  const { data } = await apiClient.post<UserOut>("/auth/register", payload);
  return data;
}