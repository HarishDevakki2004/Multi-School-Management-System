// src/components/layout/Sidebar.jsx

import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const NAV_ITEMS = {
  super_admin: [
    { path: "/super-admin/dashboard", icon: "⊞", label: "Dashboard" },
    { path: "/super-admin/schools",   icon: "🏫", label: "Schools" },
    { path: "/super-admin/users",     icon: "👥", label: "Users" },
  ],
  school_admin: [
    { path: "/school-admin/dashboard", icon: "⊞", label: "Dashboard" },
    { path: "/school-admin/students",  icon: "🎓", label: "Students" },
    { path: "/school-admin/teachers",  icon: "👨‍🏫", label: "Teachers" },
    { path: "/school-admin/classes",   icon: "🏛️", label: "Classes" },
    { path: "/school-admin/fees",      icon: "💰", label: "Fees" },
  ],
  teacher: [
    { path: "/teacher/dashboard",  icon: "⊞", label: "Dashboard" },
    { path: "/teacher/attendance", icon: "✅", label: "Attendance" },
    { path: "/teacher/homework",   icon: "📚", label: "Homework" },
    { path: "/teacher/marks",      icon: "📊", label: "Marks" },
  ],
  parent: [
    { path: "/parent/dashboard",  icon: "⊞", label: "Dashboard" },
    { path: "/parent/attendance", icon: "✅", label: "Attendance" },
    { path: "/parent/fees",       icon: "💰", label: "Fees" },
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const items            = NAV_ITEMS[user?.role] || [];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <aside style={styles.sidebar}>
      {/* Logo */}
      <div style={styles.logo}>
        <span style={styles.logoIcon}>🏫</span>
        <div>
          <div style={styles.logoTitle}>EduManage</div>
          <div style={styles.logoSub}>School System</div>
        </div>
      </div>

      {/* User info */}
      <div style={styles.userCard}>
        <div style={styles.avatar}>
          {user?.first_name?.[0]}{user?.last_name?.[0]}
        </div>
        <div style={styles.userInfo}>
          <div style={styles.userName}>{user?.full_name}</div>
          <div style={styles.userRole}>
            {user?.role?.replace("_", " ").toUpperCase()}
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav style={styles.nav}>
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              ...styles.navLink,
              ...(isActive ? styles.navLinkActive : {}),
            })}
          >
            <span style={styles.navIcon}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <button onClick={handleLogout} style={styles.logoutBtn}>
        🚪 Logout
      </button>
    </aside>
  );
}

const styles = {
  sidebar: {
    width:          "240px",
    minHeight:      "100vh",
    background:     "#0f172a",
    display:        "flex",
    flexDirection:  "column",
    padding:        "0",
    flexShrink:     0,
  },
  logo: {
    display:        "flex",
    alignItems:     "center",
    gap:            "12px",
    padding:        "24px 20px",
    borderBottom:   "1px solid #1e293b",
  },
  logoIcon:  { fontSize: "28px" },
  logoTitle: { color: "#f1f5f9", fontWeight: "700", fontSize: "16px" },
  logoSub:   { color: "#64748b", fontSize: "11px", marginTop: "2px" },
  userCard: {
    display:        "flex",
    alignItems:     "center",
    gap:            "10px",
    padding:        "16px 20px",
    background:     "#1e293b",
    margin:         "16px 12px",
    borderRadius:   "10px",
  },
  avatar: {
    width:          "36px",
    height:         "36px",
    borderRadius:   "50%",
    background:     "#3b82f6",
    color:          "white",
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    fontWeight:     "700",
    fontSize:       "13px",
    flexShrink:     0,
  },
  userInfo: { overflow: "hidden" },
  userName: {
    color:        "#f1f5f9",
    fontSize:     "13px",
    fontWeight:   "600",
    whiteSpace:   "nowrap",
    overflow:     "hidden",
    textOverflow: "ellipsis",
  },
  userRole: { color: "#3b82f6", fontSize: "10px", marginTop: "2px" },
  nav: {
    flex:          1,
    padding:       "8px 12px",
    display:       "flex",
    flexDirection: "column",
    gap:           "4px",
  },
  navLink: {
    display:       "flex",
    alignItems:    "center",
    gap:           "10px",
    padding:       "10px 14px",
    borderRadius:  "8px",
    color:         "#94a3b8",
    textDecoration:"none",
    fontSize:      "14px",
    fontWeight:    "500",
    transition:    "all 0.15s",
  },
  navLinkActive: {
    background: "#1d4ed8",
    color:      "#ffffff",
  },
  navIcon: { fontSize: "16px", width: "20px", textAlign: "center" },
  logoutBtn: {
    margin:        "12px",
    padding:       "10px 14px",
    background:    "transparent",
    border:        "1px solid #1e293b",
    borderRadius:  "8px",
    color:         "#64748b",
    cursor:        "pointer",
    fontSize:      "14px",
    textAlign:     "left",
  },
};