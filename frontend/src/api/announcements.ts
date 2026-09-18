import { apiClient } from "./client";

export interface Announcement {
  id: number;
  class_id: number | null;
  posted_by: number;
  title: string;
  content: string;
  created_at: string;
}

export const announcementsApi = {
  listGlobal: () => apiClient.get<Announcement[]>("/announcements").then((r) => r.data),
  postGlobal: (title: string, content: string) =>
    apiClient.post<Announcement>("/announcements", { title, content }).then((r) => r.data),

  listForClass: (classId: number) =>
    apiClient.get<Announcement[]>(`/classes/${classId}/announcements`).then((r) => r.data),
  postToClass: (classId: number, title: string, content: string) =>
    apiClient
      .post<Announcement>(`/classes/${classId}/announcements`, { title, content })
      .then((r) => r.data),
};