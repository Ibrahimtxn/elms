import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

import { useAuth } from "@/auth/AuthContext";
import { getApiErrorMessage } from "@/api/client";
import { ErrorState } from "@/components/ErrorState";

export function AdminLoginPage() {
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const me = await login(email, password);
      if (me.role !== "admin") {
        logout();
        setError("This portal is for administrators only. Use the regular sign-in page instead.");
        return;
      }
      navigate("/");
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "linear-gradient(160deg, #0f1120 0%, #1e2230 60%, #2d1b4e 100%)", padding: "1.5rem",
      }}
    >
      <div
        style={{
          width: "100%", maxWidth: 400, background: "#161927", borderRadius: 18,
          padding: "2.5rem", boxShadow: "0 20px 50px rgba(0,0,0,0.4)", border: "1px solid #2a2f45",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
              display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem",
            }}
          >
            <ShieldCheck size={26} color="white" />
          </div>
          <h2 style={{ margin: "0 0 0.3rem", color: "white", fontSize: "1.3rem" }}>Administrator Access</h2>
          <p style={{ color: "#9ca3af", fontSize: "0.85rem", margin: 0 }}>ELMS System Control Panel</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.8rem", color: "#9ca3af", marginBottom: "0.35rem" }}>
              Admin Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: "100%", padding: "0.6rem 0.7rem", background: "#0f1120", border: "1px solid #2a2f45", color: "white" }}
            />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.8rem", color: "#9ca3af", marginBottom: "0.35rem" }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: "100%", padding: "0.6rem 0.7rem", background: "#0f1120", border: "1px solid #2a2f45", color: "white" }}
            />
          </div>

          {error && <ErrorState message={error} />}

          <button
            type="submit"
            disabled={submitting}
            style={{ width: "100%", padding: "0.7rem", marginTop: "0.5rem", background: "linear-gradient(135deg, #4f46e5, #7c3aed)" }}
          >
            {submitting ? "Verifying…" : "Access Control Panel"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: "0.8rem", color: "#6b7280", marginTop: "1.5rem" }}>
          Not an administrator? <Link to="/login" style={{ color: "#a5b4fc" }}>Go to regular sign-in</Link>
        </p>
      </div>
    </div>
  );
}