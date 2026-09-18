import { apiClient } from "./client";

export interface AdminDashboard {
  total_users: number;
  total_students: number;
  total_lecturers: number;
  total_departments: number;
  total_courses: number;
  total_classes: number;
  active_enrollments: number;
  total_submissions: number;
  pending_submissions: number;
  total_announcements: number;
}

export interface LecturerDashboard {
  my_classes: number;
  total_students_taught: number;
  pending_grading: number;
  upcoming_events: number;
}

export interface StudentDashboard {
  my_classes: number;
  pending_assignments: number;
  unread_notifications: number;
  upcoming_events: number;
}

export type DashboardData = AdminDashboard | LecturerDashboard | StudentDashboard;

export async function fetchDashboard(): Promise<DashboardData> {
  const { data } = await apiClient.get<DashboardData>("/dashboard");
  return data;
}