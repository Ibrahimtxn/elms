import { useEffect, useState } from "react";

import { fetchHealth, HealthResponse } from "@/api/health";
import { getApiErrorMessage } from "@/api/client";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";

function StatusPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div
      style={{
        display: "flex", alignItems: "center", gap: "0.6rem", padding: "1rem 1.25rem",
        background: "var(--color-surface)", border: "1px solid var(--color-border)",
        borderRadius: 12, boxShadow: "var(--shadow-sm)",
      }}
    >
      <span
        style={{
          width: 10, height: 10, borderRadius: "50%",
          background: ok ? "#059669" : "var(--color-danger)",
          boxShadow: ok ? "0 0 0 4px rgba(5, 150, 105, 0.15)" : "0 0 0 4px rgba(220, 38, 38, 0.15)",
        }}
      />
      <div>
        <div style={{ fontWeight: 600, fontSize: "0.92rem" }}>{label}</div>
        <div style={{ fontSize: "0.8rem", color: "var(--color-muted)" }}>
          {ok ? "Operational" : "Unavailable"}
        </div>
      </div>
    </div>
  );
}

export function StatusPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkedAt, setCheckedAt] = useState<Date | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    fetchHealth()
      .then((data) => {
        setHealth(data);
        setCheckedAt(new Date());
      })
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  if (loading) return <LoadingState label="Checking system status…" />;

  const apiUp = !error && health?.status === "ok";
  const dbUp = !error && health?.database === "connected";

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ marginBottom: "0.2rem" }}>System Status</h2>
          <p style={{ color: "var(--color-muted)", margin: 0, fontSize: "0.88rem" }}>
            Live health of the ELMS platform's core services.
          </p>
        </div>
        <button onClick={load} style={{ background: "var(--color-bg)", color: "var(--color-text)", border: "1px solid var(--color-border)", fontSize: "0.85rem" }}>
          ⟳ Refresh
        </button>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}>
            <StatusPill ok={apiUp} label="API Server" />
            <StatusPill ok={dbUp} label="Database" />
          </div>
          <div
            style={{
              padding: "0.9rem 1.1rem", borderRadius: 10, fontSize: "0.85rem",
              background: apiUp && dbUp ? "#ecfdf5" : "#fef2f2",
              color: apiUp && dbUp ? "#047857" : "var(--color-danger)",
              border: `1px solid ${apiUp && dbUp ? "#a7f3d0" : "#fecaca"}`,
            }}
          >
            {apiUp && dbUp
              ? "All systems are running normally."
              : "One or more services are currently degraded. Some features may be unavailable."}
          </div>
          {checkedAt && (
            <p style={{ fontSize: "0.78rem", color: "var(--color-muted)", marginTop: "1rem" }}>
              Last checked: {checkedAt.toLocaleTimeString()} · Environment: {health?.environment}
            </p>
          )}
        </>
      )}
    </div>
  );
}