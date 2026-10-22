import { api } from "@/lib/api";
import type { HealthStatus } from "@/features/health/health.types";

export async function healthService(): Promise<HealthStatus> {
  const { data } = await api.get<HealthStatus>("/health");
  return data;
}