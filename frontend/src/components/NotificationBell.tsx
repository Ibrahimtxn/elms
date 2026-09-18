import { useEffect, useRef, useState } from "react";

import { notificationsApi, Notification } from "@/api/notifications";

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const load = () => {
    notificationsApi.list().then(setNotifications).catch(() => {});
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkRead = async (id: number) => {
    await notificationsApi.markRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  };

  const handleMarkAllRead = async () => {
    await notificationsApi.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{ background: "var(--color-bg)", color: "var(--color-text)", border: "1px solid var(--color-border)", position: "relative", padding: "0.5rem 0.7rem" }}
      >
        🔔
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute", top: -4, right: -4, background: "var(--color-danger)",
              color: "white", borderRadius: "50%", fontSize: "0.65rem", width: 18, height: 18,
              display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700,
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: "absolute", top: "115%", right: 0, width: 320, maxHeight: 400, overflowY: "auto",
            background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 10,
            boxShadow: "var(--shadow-md)", zIndex: 20,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 1rem", borderBottom: "1px solid var(--color-border)" }}>
            <strong style={{ fontSize: "0.9rem" }}>Notifications</strong>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} style={{ background: "transparent", color: "var(--color-primary)", padding: 0, fontSize: "0.8rem" }}>
                Mark all read
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <p style={{ padding: "1rem", color: "var(--color-muted)", fontSize: "0.85rem" }}>No notifications yet.</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.is_read && handleMarkRead(n.id)}
                style={{
                  padding: "0.75rem 1rem", borderBottom: "1px solid var(--color-border)",
                  background: n.is_read ? "transparent" : "#f5f4ff", cursor: n.is_read ? "default" : "pointer",
                }}
              >
                <div style={{ fontSize: "0.85rem", fontWeight: n.is_read ? 400 : 600 }}>{n.title}</div>
                <div style={{ fontSize: "0.8rem", color: "var(--color-muted)", marginTop: 2 }}>{n.message}</div>
                <div style={{ fontSize: "0.7rem", color: "var(--color-muted)", marginTop: 4 }}>
                  {new Date(n.created_at).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}