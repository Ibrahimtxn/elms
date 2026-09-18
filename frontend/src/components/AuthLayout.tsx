import { ReactNode } from "react";

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #eef0fe 0%, #f4f6fb 100%)",
        padding: "1.5rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          background: "var(--color-surface)",
          borderRadius: 16,
          padding: "2.5rem",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontWeight: 700, fontSize: "1.3rem", color: "var(--color-primary)", marginBottom: "0.3rem" }}>
            ELMS
          </div>
          <h2 style={{ margin: "0 0 0.3rem", fontSize: "1.3rem" }}>{title}</h2>
          {subtitle && <p style={{ color: "var(--color-muted)", fontSize: "0.9rem", margin: 0 }}>{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}