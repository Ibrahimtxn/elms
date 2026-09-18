import { apiClient } from "./client";

export interface HealthResponse {
  status: "ok" | "degraded";
  app: string;
  environment: string;
  database: "connected" | "unreachable";
}

export async function fetchHealth(): Promise<HealthResponse> {
  const { data } = await apiClient.get<HealthResponse>("/health");
  return data;
}
