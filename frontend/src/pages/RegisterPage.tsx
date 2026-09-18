import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { register as apiRegister } from "@/api/auth";
import { useAuth } from "@/auth/AuthContext";
import { getApiErrorMessage } from "@/api/client";
import { AuthLayout } from "@/components/AuthLayout";
import { FormField } from "@/components/FormField";
import { ErrorState } from "@/components/ErrorState";

type Role = "student" | "lecturer";

export function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<Role>("student");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await apiRegister({ first_name: firstName, last_name: lastName, email, password, role });
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="For students and lecturers of Federal University Dutse">
      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
          {(["student", "lecturer"] as Role[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              style={{
                flex: 1,
                background: role === r ? "var(--color-primary)" : "var(--color-bg)",
                color: role === r ? "white" : "var(--color-text)",
                border: "1px solid var(--color-border)",
                textTransform: "capitalize",
              }}
            >
              {r}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <div style={{ flex: 1 }}>
            <FormField label="First name" value={firstName} onChange={setFirstName} required />
          </div>
          <div style={{ flex: 1 }}>
            <FormField label="Last name" value={lastName} onChange={setLastName} required />
          </div>
        </div>
        <FormField label="Email" type="email" value={email} onChange={setEmail} required />
        <FormField label="Password" type="password" value={password} onChange={setPassword} required />

        {error && <ErrorState message={error} />}

        <button type="submit" disabled={submitting} style={{ width: "100%", padding: "0.7rem", marginTop: "0.5rem" }}>
          {submitting ? "Creating account…" : `Sign up as ${role}`}
        </button>
      </form>

      <p style={{ textAlign: "center", fontSize: "0.88rem", color: "var(--color-muted)", marginTop: "1.5rem" }}>
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </AuthLayout>
  );
}