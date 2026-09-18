import { useEffect, useState } from "react";
import {
  Users, GraduationCap, Building2, BookOpen, Layers, ClipboardCheck,
  FileWarning, Megaphone, CheckSquare, Bell, CalendarDays,
} from "lucide-react";

import {
  fetchDashboard,
  DashboardData,
  AdminDashboard,
  LecturerDashboard,
} from "@/api/dashboard";
import { getApiErrorMessage } from "@/api/client";
import { useAuth } from "@/auth/AuthContext";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";

function isAdminData(data: DashboardData): data is AdminDashboard {
  return "total_users" in data;
}
function isLecturerData(data: DashboardData): data is LecturerDashboard {
  return "total_students_taught" in data;
}

function StatCard({ label, value, icon, tint }: { label: string; value: number; icon: React.ReactNode; tint: string }) {
  return (
    <div className="card" style={{ marginBottom: 0, padding: "1.1rem 1.25rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: "0.8rem", color: "var(--color-muted)", marginBottom: 4 }}>{label}</div>
          <div style={{ fontSize: "1.6rem", fontWeight: 700 }}>{value}</div>
        </div>
        <div
          style={{
            width: 42, height: 42, borderRadius: 12, background: tint,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

const TINTS = {
  indigo: { bg: "#eef0ff", fg: "#4f46e5" },
  emerald: { bg: "#ecfdf5", fg: "#059669" },
  amber: { bg: "#fffbeb", fg: "#d97706" },
  sky: { bg: "#eff8ff", fg: "#0284c7" },
  rose: { bg: "#fef2f2", fg: "#dc2626" },
  violet: { bg: "#f5f3ff", fg: "#7c3aed" },
};

function Icon({ tone, children }: { tone: keyof typeof TINTS; children: React.ReactNode }) {
  return <div style={{ color: TINTS[tone].fg }}>{children}</div>;
}

export function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    setError(null);
    fetchDashboard()
      .then(setData)
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  if (loading) return <LoadingState label="Loading your dashboard…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!data) return null;

  const bannerCopy = isAdminData(data)
    ? { eyebrow: "Admin Dashboard", note: `Overseeing ${data.total_students} students across ${data.total_departments} departments.` }
    : isLecturerData(data)
    ? { eyebrow: "Lecturer Dashboard", note: `${data.pending_grading} submission${data.pending_grading === 1 ? "" : "s"} awaiting your review.` }
    : { eyebrow: "Student Dashboard", note: `${data.pending_assignments} assignment${data.pending_assignments === 1 ? "" : "s"} still pending across your classes.` };

  return (
    <div>
      <div
        style={{
          background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
          borderRadius: 20, padding: "1.75rem 2rem", marginBottom: "1.75rem", color: "white",
          position: "relative", overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute", top: -30, right: -20, opacity: 0.15,
          }}
        >
          <GraduationCap size={140} />
        </div>
        <span
          style={{
            fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase",
            background: "rgba(255,255,255,0.18)", padding: "0.25rem 0.7rem", borderRadius: 999,
          }}
        >
          {bannerCopy.eyebrow}
        </span>
        <h2 style={{ color: "white", margin: "0.6rem 0 0.3rem", fontSize: "1.5rem" }}>
          Welcome back, {user?.first_name}
        </h2>
        <p style={{ margin: 0, opacity: 0.9, fontSize: "0.9rem", maxWidth: 460 }}>{bannerCopy.note}</p>
      </div>

      {isAdminData(data) && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
          <StatCard label="Total Users" value={data.total_users} tint={TINTS.indigo.bg} icon={<Icon tone="indigo"><Users size={20} /></Icon>} />
          <StatCard label="Students" value={data.total_students} tint={TINTS.sky.bg} icon={<Icon tone="sky"><GraduationCap size={20} /></Icon>} />
          <StatCard label="Lecturers" value={data.total_lecturers} tint={TINTS.violet.bg} icon={<Icon tone="violet"><Users size={20} /></Icon>} />
          <StatCard label="Departments" value={data.total_departments} tint={TINTS.emerald.bg} icon={<Icon tone="emerald"><Building2 size={20} /></Icon>} />
          <StatCard label="Courses" value={data.total_courses} tint={TINTS.amber.bg} icon={<Icon tone="amber"><BookOpen size={20} /></Icon>} />
          <StatCard label="Classes" value={data.total_classes} tint={TINTS.sky.bg} icon={<Icon tone="sky"><Layers size={20} /></Icon>} />
          <StatCard label="Active Enrollments" value={data.active_enrollments} tint={TINTS.indigo.bg} icon={<Icon tone="indigo"><ClipboardCheck size={20} /></Icon>} />
          <StatCard label="Pending Submissions" value={data.pending_submissions} tint={TINTS.rose.bg} icon={<Icon tone="rose"><FileWarning size={20} /></Icon>} />
          <StatCard label="Announcements" value={data.total_announcements} tint={TINTS.violet.bg} icon={<Icon tone="violet"><Megaphone size={20} /></Icon>} />
        </div>
      )}

      {!isAdminData(data) && isLecturerData(data) && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
          <StatCard label="My Classes" value={data.my_classes} tint={TINTS.indigo.bg} icon={<Icon tone="indigo"><Layers size={20} /></Icon>} />
          <StatCard label="Students Taught" value={data.total_students_taught} tint={TINTS.sky.bg} icon={<Icon tone="sky"><Users size={20} /></Icon>} />
          <StatCard label="Pending Grading" value={data.pending_grading} tint={TINTS.amber.bg} icon={<Icon tone="amber"><CheckSquare size={20} /></Icon>} />
          <StatCard label="Upcoming Events" value={data.upcoming_events} tint={TINTS.violet.bg} icon={<Icon tone="violet"><CalendarDays size={20} /></Icon>} />
        </div>
      )}

      {!isAdminData(data) && !isLecturerData(data) && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
          <StatCard label="My Classes" value={data.my_classes} tint={TINTS.indigo.bg} icon={<Icon tone="indigo"><Layers size={20} /></Icon>} />
          <StatCard label="Pending Assignments" value={data.pending_assignments} tint={TINTS.rose.bg} icon={<Icon tone="rose"><FileWarning size={20} /></Icon>} />
          <StatCard label="Unread Notifications" value={data.unread_notifications} tint={TINTS.amber.bg} icon={<Icon tone="amber"><Bell size={20} /></Icon>} />
          <StatCard label="Upcoming Events" value={data.upcoming_events} tint={TINTS.violet.bg} icon={<Icon tone="violet"><CalendarDays size={20} /></Icon>} />
        </div>
      )}
    </div>
  );
}