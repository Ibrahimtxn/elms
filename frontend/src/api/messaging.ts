import { apiClient } from "./client";

export interface Conversation {
  id: number;
  title: string | null;
  is_group: boolean;
  created_at: string;
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  content: string;
  is_read: boolean;
  created_at: string;
}

export const messagingApi = {
  listConversations: () => apiClient.get<Conversation[]>("/conversations").then((r) => r.data),
  startConversation: (participantIds: number[], title?: string) =>
    apiClient
      .post<Conversation>("/conversations", { participant_ids: participantIds, title })
      .then((r) => r.data),
  listMessages: (conversationId: number) =>
    apiClient.get<Message[]>(`/conversations/${conversationId}/messages`).then((r) => r.data),
  sendMessage: (conversationId: number, content: string) =>
    apiClient
      .post<Message>(`/conversations/${conversationId}/messages`, { content })
      .then((r) => r.data),
};

import { UserOut } from "./auth";

export const messagingContactsApi = {
  listContacts: () => apiClient.get<UserOut[]>("/messaging/contacts").then((r) => r.data),
};