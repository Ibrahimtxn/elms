import { apiClient } from "./client";

export interface Enrollment {
  id: number;
  student_id: number;
  class_id: number;
  status: "active" | "completed" | "dropped";
  is_carryover: boolean;
  enrolled_at: string;
}

export const enrollmentApi = {
  enroll: (classId: number) =>
    apiClient.post<Enrollment>("/enrollments", { class_id: classId }).then((r) => r.data),
  drop: (enrollmentId: number) =>
    apiClient.patch<Enrollment>(`/enrollments/${enrollmentId}/drop`).then((r) => r.data),
  myEnrollments: () => apiClient.get<Enrollment[]>("/enrollments/me").then((r) => r.data),
    classRoster: (classId: number) =>
    apiClient.get<RosterEntry[]>(`/classes/${classId}/roster`).then((r) => r.data),
  // Admin
  adminEnroll: (studentId: number, classId: number, isCarryover: boolean) =>
    apiClient
      .post<Enrollment>("/admin/enrollments", { student_id: studentId, class_id: classId, is_carryover: isCarryover })
      .then((r) => r.data),
  adminUpdateStatus: (enrollmentId: number, status: Enrollment["status"]) =>
    apiClient.patch<Enrollment>(`/admin/enrollments/${enrollmentId}/status`, { status }).then((r) => r.data),
  adminStudentHistory: (studentId: number) =>
    apiClient.get<Enrollment[]>(`/admin/students/${studentId}/enrollments`).then((r) => r.data),
};

export interface RosterEntry {
  enrollment_id: number;
  student_id: number;
  student_name: string;
  student_email: string;
  status: "active" | "completed" | "dropped";
  is_carryover: boolean;
  enrolled_at: string;
}