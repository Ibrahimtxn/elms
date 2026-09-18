import { FormEvent, useEffect, useState } from "react";
import { Send, Plus, MessageCircle } from "lucide-react";

import { messagingApi, messagingContactsApi, Conversation, Message } from "@/api/messaging";
import { UserOut } from "@/api/auth";
import { useAuth } from "@/auth/AuthContext";
import { getApiErrorMessage } from "@/api/client";
import { Avatar } from "@/components/Avatar";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";

export function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [contacts, setContacts] = useState<UserOut[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const [newRecipientId, setNewRecipientId] = useState<number | "">("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const loadConversations = () => {
    messagingApi.listConversations().then(setConversations).catch((err) => setError(getApiErrorMessage(err)));
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([messagingApi.listConversations(), messagingContactsApi.listContacts()])
      .then(([convos, cs]) => {
        setConversations(convos);
        setContacts(cs);
        if (convos.length > 0) setSelectedId(convos[0].id);
      })
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedId === null) return;
    messagingApi.listMessages(selectedId).then(setMessages).catch((err) => setActionError(getApiErrorMessage(err)));
  }, [selectedId]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedId || !content.trim()) return;
    setSending(true);
    setActionError(null);
    try {
      const message = await messagingApi.sendMessage(selectedId, content);
      setMessages((prev) => [...prev, message]);
      setContent("");
    } catch (err) {
      setActionError(getApiErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  const handleStartConversation = async (e: FormEvent) => {
    e.preventDefault();
    if (!newRecipientId) return;
    setActionError(null);
    try {
      const convo = await messagingApi.startConversation([newRecipientId]);
      loadConversations();
      setSelectedId(convo.id);
      setNewRecipientId("");
      setShowNewChat(false);
    } catch (err) {
      setActionError(getApiErrorMessage(err));
    }
  };

  const contactName = (id: number) => {
    const c = contacts.find((c) => c.id === id) || (id === user?.id ? user : null);
    return c ? `${c.first_name} ${c.last_name}` : `User ${id}`;
  };

  const conversationLabel = (c: Conversation) => c.title || (c.is_group ? "Group chat" : "Direct message");

  if (loading) return <LoadingState label="Loading messages…" />;
  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <h2 style={{ marginBottom: "1.25rem" }}>Messages</h2>
      {actionError && <ErrorState message={actionError} />}

      <div
        style={{
          display: "flex", height: 560, borderRadius: 18, overflow: "hidden",
          border: "1px solid var(--color-border)", boxShadow: "var(--shadow-md)",
        }}
      >
        {/* Conversation list */}
        <div style={{ width: 280, background: "#fafaff", borderRight: "1px solid var(--color-border)", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "1rem", borderBottom: "1px solid var(--color-border)" }}>
            {showNewChat ? (
              <form onSubmit={handleStartConversation} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <select
                  value={newRecipientId}
                  onChange={(e) => setNewRecipientId(Number(e.target.value))}
                  style={{ fontSize: "0.82rem" }}
                  autoFocus
                >
                  <option value="">Choose a contact…</option>
                  {contacts.map((c) => (
                    <option key={c.id} value={c.id}>{c.first_name} {c.last_name} · {c.role}</option>
                  ))}
                </select>
                <div style={{ display: "flex", gap: "0.4rem" }}>
                  <button type="submit" style={{ flex: 1, fontSize: "0.8rem" }}>Start Chat</button>
                  <button
                    type="button"
                    onClick={() => setShowNewChat(false)}
                    style={{ background: "var(--color-bg)", color: "var(--color-text)", border: "1px solid var(--color-border)", fontSize: "0.8rem" }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowNewChat(true)}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem", fontSize: "0.85rem" }}
              >
                <Plus size={15} /> New Conversation
              </button>
            )}
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "0.5rem" }}>
            {conversations.length === 0 ? (
              <p style={{ color: "var(--color-muted)", fontSize: "0.82rem", padding: "0.75rem" }}>
                No conversations yet. Start one above.
              </p>
            ) : (
              conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: "0.6rem",
                    padding: "0.6rem 0.7rem", borderRadius: 12, marginBottom: "0.25rem", textAlign: "left",
                    background: selectedId === c.id ? "var(--color-primary-soft)" : "transparent",
                    color: selectedId === c.id ? "var(--color-primary)" : "var(--color-text)",
                  }}
                >
                  <Avatar name={conversationLabel(c)} size={34} />
                  <span style={{ fontSize: "0.85rem", fontWeight: selectedId === c.id ? 700 : 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {conversationLabel(c)}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Thread */}
        <div
          style={{
            flex: 1, display: "flex", flexDirection: "column",
            background: "linear-gradient(180deg, #fbfbff 0%, #f5f6fb 100%)",
          }}
        >
          {selectedId === null ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--color-muted)", gap: "0.5rem" }}>
              <MessageCircle size={40} strokeWidth={1.2} />
              <p style={{ fontSize: "0.88rem" }}>Select or start a conversation to begin messaging.</p>
            </div>
          ) : (
            <>
              <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>
                {messages.map((m, i) => {
                  const isMine = m.sender_id === user?.id;
                  const showAvatar = i === 0 || messages[i - 1].sender_id !== m.sender_id;
                  return (
                    <div
                      key={m.id}
                      style={{
                        display: "flex", flexDirection: isMine ? "row-reverse" : "row",
                        alignItems: "flex-end", gap: "0.5rem", marginBottom: "0.7rem",
                      }}
                    >
                      <div style={{ width: 28, flexShrink: 0 }}>
                        {showAvatar && !isMine && <Avatar name={contactName(m.sender_id)} size={28} />}
                      </div>
                      <div style={{ maxWidth: "65%" }}>
                        <div
                          style={{
                            padding: "0.6rem 0.9rem", borderRadius: isMine ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                            background: isMine ? "var(--color-primary)" : "white",
                            color: isMine ? "white" : "var(--color-text)",
                            fontSize: "0.88rem", boxShadow: "0 1px 2px rgba(16,24,40,0.06)",
                          }}
                        >
                          {m.content}
                        </div>
                        <div style={{ fontSize: "0.68rem", color: "var(--color-muted)", marginTop: 3, textAlign: isMine ? "right" : "left" }}>
                          {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <form onSubmit={handleSend} style={{ display: "flex", gap: "0.6rem", padding: "1rem 1.25rem", background: "white", borderTop: "1px solid var(--color-border)" }}>
                <input
                  placeholder="Type a message…"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  style={{ flex: 1, borderRadius: 999, padding: "0.65rem 1.1rem" }}
                />
                <button
                  type="submit"
                  disabled={sending || !content.trim()}
                  style={{ borderRadius: "50%", width: 42, height: 42, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <Send size={17} />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}