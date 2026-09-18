import { apiClient } from "./client";

export interface BackpackItem {
  id: number;
  user_id: number;
  material_id: number | null;
  title: string;
  file_path: string | null;
  created_at: string;
}

export const backpackApi = {
  list: () => apiClient.get<BackpackItem[]>("/backpack").then((r) => r.data),
  saveMaterial: (materialId: number, title?: string) =>
    apiClient
      .post<BackpackItem>("/backpack/materials", { material_id: materialId, title })
      .then((r) => r.data),
  remove: (itemId: number) => apiClient.delete(`/backpack/${itemId}`),
};