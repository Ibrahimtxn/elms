import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/auth/AuthContext";

export function ProfileMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = `${user?.first_name?.[0] ?? ""}${user?.last_name?.[0] ?? ""}`.toUpperCase();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: 38, height: 38, borderRadius: "50%", background: "var(--color-primary)",
          color: "white", fontWeight: 700, fontSize: "0.85rem", padding: 0,
        }}
      >
        {initials || "?"}
      </button>

      {open && (
        <div
          style={{
            position: "absolute", top: "115%", right: 0, width: 220,
            background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 10,
            boxShadow: "var(--shadow-md)", zIndex: 20, overflow: "hidden",
          }}
        >
          <div style={{ padding: "0.9rem 1rem", borderBottom: "1px solid var(--color-border)" }}>
            <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{user?.first_name} {user?.last_name}</div>
            <div style={{ fontSize: "0.78rem", color: "var(--color-muted)", textTransform: "capitalize" }}>{user?.role}</div>
          </div>
          <MenuItem label="Profile" onClick={() => setOpen(false)} />
          <MenuItem label="Settings" onClick={() => setOpen(false)} />
          <MenuItem label="Log out" onClick={handleLogout} danger />
        </div>
      )}
    </div>
  );
}

function MenuItem({ label, onClick, danger }: { label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "block", width: "100%", textAlign: "left", background: "transparent",
        color: danger ? "var(--color-danger)" : "var(--color-text)", padding: "0.7rem 1rem",
        fontSize: "0.85rem", fontWeight: 500, borderRadius: 0,
      }}
    >
      {label}
    </button>
  );
}