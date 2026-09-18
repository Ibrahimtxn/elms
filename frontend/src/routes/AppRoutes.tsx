import { Route, Routes } from "react-router-dom";

import { MainLayout } from "@/layouts/MainLayout";
import { DashboardPage } from "@/pages/DashboardPage";
import { StatusPage } from "@/pages/StatusPage";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { AdminLoginPage } from "@/pages/AdminLoginPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { CataloguePage } from "@/pages/CataloguePage";
import { ClassDetailPage } from "@/pages/ClassDetailPage";
import { AssignmentDetailPage } from "@/pages/AssignmentDetailPage";
import { AnnouncementsPage } from "@/pages/AnnouncementsPage";
import { MessagesPage } from "@/pages/MessagesPage";
import { BackpackPage } from "@/pages/BackpackPage";
import { CalendarPage } from "@/pages/CalendarPage";
import { AcademicSetupPage } from "@/pages/admin/AcademicSetupPage";
import { CoursesPage } from "@/pages/admin/CoursesPage";
import { ClassesPage } from "@/pages/admin/ClassesPage";
import { EnrollmentManagementPage } from "@/pages/admin/EnrollmentManagementPage";
import { MyClassesPage } from "@/pages/lecturer/MyClassesPage";
import { ProtectedRoute } from "@/routes/ProtectedRoute";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />
      <Route path="register" element={<RegisterPage />} />
      <Route path="admin-login" element={<AdminLoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="status" element={<StatusPage />} />
          <Route path="academic-setup" element={<AcademicSetupPage />} />
          <Route path="courses" element={<CoursesPage />} />
          <Route path="classes" element={<ClassesPage />} />
          <Route path="classes/:classId" element={<ClassDetailPage />} />
          <Route path="assignments/:assignmentId" element={<AssignmentDetailPage />} />
          <Route path="enrollment-management" element={<EnrollmentManagementPage />} />
          <Route path="my-classes" element={<MyClassesPage />} />
          <Route path="catalogue" element={<CataloguePage />} />
          <Route path="announcements" element={<AnnouncementsPage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="backpack" element={<BackpackPage />} />
          <Route path="calendar" element={<CalendarPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}