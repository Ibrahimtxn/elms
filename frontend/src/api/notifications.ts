import { apiClient } from "./client";

export interface Notification {
  id: number;
  title: string;
  message: string;
  notification_type: "announcement" | "assignment" | "message" | "grade" | "system";
  related_entity_type: string | null;
  related_entity_id: number | null;
  is_read: boolean;
  created_at: string;
}

export const notificationsApi = {
  list: () => apiClient.get<Notification[]>("/notifications").then((r) => r.data),
  markRead: (id: number) =>
    apiClient.patch<Notification>(`/notifications/${id}/read`).then((r) => r.data),
  markAllRead: () => apiClient.patch("/notifications/read-all"),
};