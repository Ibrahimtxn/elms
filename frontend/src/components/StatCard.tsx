interface StatCardProps {
  label: string;
  value: number | string;
}

export function StatCard({ label, value }: StatCardProps) {
  return (
    <div
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: 10,
        padding: "1.25rem",
        minWidth: 160,
      }}
    >
      <div style={{ fontSize: "0.85rem", color: "var(--color-muted)", marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: "1.75rem", fontWeight: 600 }}>{value}</div>
    </div>
  );
}