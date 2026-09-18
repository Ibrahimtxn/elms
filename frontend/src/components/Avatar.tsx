export function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      style={{
        width: size, height: size, borderRadius: "50%",
        background: "var(--color-primary-soft)", color: "var(--color-primary)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontWeight: 700, fontSize: size * 0.38, flexShrink: 0,
      }}
    >
      {initials || "?"}
    </div>
  );
}