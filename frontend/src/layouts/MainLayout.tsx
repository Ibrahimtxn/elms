import { FormEvent, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { GraduationCap } from "lucide-react";

import { useAuth } from "@/auth/AuthContext";
import { StudentSearch } from "@/components/StudentSearch";
import { LecturerSearch } from "@/components/LecturerSearch";
import { AdminSearch } from "@/components/AdminSearch";

import { LiveClock } from "@/components/LiveClock";
import { NotificationBell } from "@/components/NotificationBell";
import { ProfileMenu } from "@/components/ProfileMenu";
import { Sidebar } from "@/components/SideBar";

export function MainLayout() {
  const { user } = useAuth();

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header className="top-header">
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div
            style={{
              width: 34, height: 34, borderRadius: 10, background: "var(--color-primary)",
              display: "flex", alignItems: "center", justifyContent: "center", color: "white",
            }}
          >
            <GraduationCap size={19} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "1.05rem", lineHeight: 1.1 }}>ELMS</div>
            <div style={{ fontSize: "0.72rem", color: "var(--color-muted)" }}>Federal University Dutse</div>
          </div>
        </div>

                {user?.role === "admin" && <AdminSearch />}
        {user?.role === "lecturer" && <LecturerSearch />}
        {user?.role === "student" && <StudentSearch />}

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <LiveClock />
          <NotificationBell />
          <ProfileMenu />
        </div>
      </header>

      <div style={{ flex: 1, display: "flex" }}>
        <Sidebar />
        <main className="app-main" style={{ flex: 1, minWidth: 0 }}>
          <div style={{ maxWidth: 1200 }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}