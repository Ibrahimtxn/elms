import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "@/auth/AuthContext";
import { LoadingState } from "@/components/LoadingState";

export function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingState label="Checking session…" />;
  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />;
}