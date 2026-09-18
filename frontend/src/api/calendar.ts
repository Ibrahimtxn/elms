import { apiClient } from "./client";

export type EventType = "class" | "exam" | "deadline" | "holiday" | "other";

export interface CalendarEvent {
  id: number;
  class_id: number | null;
  created_by: number;
  title: string;
  description: string | null;
  event_type: EventType;
  start_time: string;
  end_time: string;
}

export const calendarApi = {
  myCalendar: () => apiClient.get<CalendarEvent[]>("/calendar").then((r) => r.data),

  createGlobalEvent: (data: {
    title: string; description?: string; event_type: EventType; start_time: string; end_time: string;
  }) => apiClient.post<CalendarEvent>("/events", data).then((r) => r.data),

  createClassEvent: (
    classId: number,
    data: { title: string; description?: string; event_type: EventType; start_time: string; end_time: string }
  ) => apiClient.post<CalendarEvent>(`/classes/${classId}/events`, data).then((r) => r.data),
};