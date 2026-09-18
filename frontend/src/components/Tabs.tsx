interface TabsProps {
  tabs: { key: string; label: string }[];
  active: string;
  onChange: (key: string) => void;
}

export function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div style={{ display: "flex", gap: "0.25rem", borderBottom: "1px solid var(--color-border)", marginBottom: "1.5rem" }}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          style={{
            background: "transparent",
            color: active === tab.key ? "var(--color-primary)" : "var(--color-muted)",
            border: "none",
            borderBottom: active === tab.key ? "2px solid var(--color-primary)" : "2px solid transparent",
            borderRadius: 0,
            padding: "0.6rem 0.2rem",
            marginRight: "1.25rem",
            fontWeight: 600,
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}