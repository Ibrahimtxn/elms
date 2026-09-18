import { apiClient } from "./client";

export interface Assignment {
  id: number;
  class_id: number;
  created_by: number;
  title: string;
  description: string | null;
  due_date: string;
  max_score: number;
}

export interface Submission {
  id: number;
  assignment_id: number;
  student_id: number;
  file_path: string;
  score: number | null;
  feedback: string | null;
  status: "submitted" | "late" | "graded" | "returned";
  submitted_at: string;
}

export const assignmentsApi = {
  listForClass: (classId: number) =>
    apiClient.get<Assignment[]>(`/classes/${classId}/assignments`).then((r) => r.data),

  create: (classId: number, data: { title: string; description?: string; due_date: string; max_score: number }) =>
    apiClient.post<Assignment>(`/classes/${classId}/assignments`, data).then((r) => r.data),

  submit: (assignmentId: number, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return apiClient
      .post<Submission>(`/assignments/${assignmentId}/submissions`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },

  mySubmission: (assignmentId: number) =>
    apiClient
      .get<Submission>(`/assignments/${assignmentId}/submissions/me`)
      .then((r) => r.data)
      .catch((err) => {
        if (err.response?.status === 404) return null;
        throw err;
      }),

  listSubmissions: (assignmentId: number) =>
    apiClient.get<Submission[]>(`/assignments/${assignmentId}/submissions`).then((r) => r.data),

  grade: (submissionId: number, score: number, feedback: string) =>
    apiClient
      .patch<Submission>(`/submissions/${submissionId}/grade`, { score, feedback })
      .then((r) => r.data),
};