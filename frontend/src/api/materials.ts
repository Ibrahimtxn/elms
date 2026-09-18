import { apiClient } from "./client";

export interface Material {
  id: number;
  class_id: number;
  uploaded_by: number;
  title: string;
  description: string | null;
  file_path: string;
  created_at: string;
}

export const materialsApi = {
  listForClass: (classId: number) =>
    apiClient.get<Material[]>(`/classes/${classId}/materials`).then((r) => r.data),

  upload: (classId: number, title: string, description: string, file: File) => {
    const form = new FormData();
    form.append("title", title);
    if (description) form.append("description", description);
    form.append("file", file);
    return apiClient
      .post<Material>(`/classes/${classId}/materials`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },

    download: async (materialId: number, filename: string) => {
    const response = await apiClient.get(`/materials/${materialId}/download`, {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  remove: (materialId: number) => apiClient.delete(`/materials/${materialId}`),
};