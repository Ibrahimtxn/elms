import { useNavigate } from "react-router-dom";

export function BackLink({ label = "Back" }: { label?: string }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(-1)}
      style={{ background: "transparent", color: "var(--color-muted)", padding: "0.3rem 0", marginBottom: "1rem", fontWeight: 500, fontSize: "0.85rem" }}
    >
      ← {label}
    </button>
  );
}