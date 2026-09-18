import { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Building2, BookOpen, Layers, UserCog,
  ClipboardList, Megaphone, MessageSquare, Backpack, CalendarDays, Activity,
} from "lucide-react";

import { useAuth } from "@/auth/AuthContext";

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
  end?: boolean;
  badge?: string;
}

export function Sidebar() {
  const { user } = useAuth();

  const roleLabel =
    user?.role === "admin" ? "Admin Workspace" : user?.role === "lecturer" ? "Lecturer Workspace" : "Student Workspace";
  const roleHint =
    user?.role === "admin"
      ? "System administration"
      : user?.role === "lecturer"
      ? "Manage classes & grades"
      : "Access courses & tasks";

  const items: NavItem[] = [
    { to: "/", label: "Dashboard", icon: <LayoutDashboard size={17} />, end: true },
    ...(user?.role === "admin"
      ? [
          { to: "/academic-setup", label: "Academic Setup", icon: <Building2 size={17} /> },
          { to: "/courses", label: "Courses", icon: <BookOpen size={17} /> },
          { to: "/classes", label: "Classes", icon: <Layers size={17} /> },
          { to: "/enrollment-management", label: "Enrollment", icon: <UserCog size={17} /> },
        ]
      : []),
    ...(user?.role === "lecturer" ? [{ to: "/my-classes", label: "My Classes", icon: <Layers size={17} /> }] : []),
    ...(user?.role === "student"
      ? [{ to: "/catalogue", label: "Course Catalogue", icon: <ClipboardList size={17} /> }]
      : []),
    { to: "/announcements", label: "Announcements", icon: <Megaphone size={17} /> },
    { to: "/messages", label: "Messages", icon: <MessageSquare size={17} /> },
    { to: "/backpack", label: "Backpack", icon: <Backpack size={17} /> },
    { to: "/calendar", label: "Calendar", icon: <CalendarDays size={17} /> },
    { to: "/status", label: "Status", icon: <Activity size={17} /> },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-badge">
        <span className="sidebar-badge-label">{roleLabel}</span>
        <p className="sidebar-badge-hint">{roleHint}</p>
      </div>
      <nav className="sidebar-nav">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}