import { apiClient } from "./client";
import { UserOut } from "./auth";

export const usersApi = {
  listAll: () => apiClient.get<UserOut[]>("/users").then((r) => r.data),
};