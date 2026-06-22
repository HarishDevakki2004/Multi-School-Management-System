// src/routes/AppRouter.jsx

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import LoginPage            from "../pages/auth/LoginPage";
import SuperAdminDashboard  from "../pages/superadmin/Dashboard";
import SchoolAdminDashboard from "../pages/schooladmin/Dashboard";
import TeacherDashboard     from "../pages/teacher/Dashboard";
import AttendancePage       from "../pages/teacher/AttendancePage";
import HomeworkPage         from "../pages/teacher/HomeworkPage";
import MarksPage            from "../pages/teacher/MarksPage";
import ParentDashboard      from "../pages/parent/Dashboard";
import ProtectedRoute       from "./ProtectedRoute";
import StudentsPage         from "../pages/schooladmin/StudentsPage";
import TeachersPage         from "../pages/schooladmin/TeachersPage";
import ClassesPage          from "../pages/schooladmin/ClassesPage";
import FeesPage             from "../pages/schooladmin/FeesPage";

const ROLE_HOME = {
  super_admin:  "/super-admin/dashboard",
  school_admin: "/school-admin/dashboard",
  teacher:      "/teacher/dashboard",
  parent:       "/parent/dashboard",
};

function RoleRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={ROLE_HOME[user.role] || "/login"} replace />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Super Admin */}
        <Route path="/super-admin" element={<ProtectedRoute role="super_admin" />}>
          <Route path="dashboard" element={<SuperAdminDashboard />} />
        </Route>

        {/* School Admin */}
        <Route path="/school-admin" element={<ProtectedRoute role="school_admin" />}>
          <Route path="dashboard" element={<SchoolAdminDashboard />} />
          <Route path="students"  element={<StudentsPage />} />
          <Route path="teachers"  element={<TeachersPage />} />
          <Route path="classes"   element={<ClassesPage />} />
          <Route path="fees"      element={<FeesPage />} />
        </Route>

        {/* Teacher */}
        <Route path="/teacher" element={<ProtectedRoute role="teacher" />}>
          <Route path="dashboard"  element={<TeacherDashboard />} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="homework"   element={<HomeworkPage />} />
          <Route path="marks"      element={<MarksPage />} />
        </Route>

        {/* Parent */}
        <Route path="/parent" element={<ProtectedRoute role="parent" />}>
          <Route path="dashboard" element={<ParentDashboard />} />
        </Route>

        <Route path="/"  element={<RoleRedirect />} />
        <Route path="*"  element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}