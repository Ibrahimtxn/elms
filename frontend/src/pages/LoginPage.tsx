import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "@/auth/AuthContext";
import { getApiErrorMessage } from "@/api/client";
import { AuthLayout } from "@/components/AuthLayout";
import { FormField } from "@/components/FormField";
import { ErrorState } from "@/components/ErrorState";

export function LoginPage() {
  const { login } = useAuth();
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
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Sign in to ELMS" subtitle="Federal University Dutse">
      <form onSubmit={handleSubmit}>
        <FormField label="Email" type="email" value={email} onChange={setEmail} required />
        <FormField label="Password" type="password" value={password} onChange={setPassword} required />

        {error && <ErrorState message={error} />}

        <button type="submit" disabled={submitting} style={{ width: "100%", padding: "0.7rem", marginTop: "0.5rem" }}>
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p style={{ textAlign: "center", fontSize: "0.88rem", color: "var(--color-muted)", marginTop: "1.5rem" }}>
        New here? <Link to="/register">Create a student or lecturer account</Link>
      </p>
      <p style={{ textAlign: "center", fontSize: "0.8rem", color: "var(--color-muted)", marginTop: "0.5rem" }}>
        Administrator? <Link to="/admin-login">Sign in here</Link>
      </p>
    </AuthLayout>
  );
}