// src/pages/schooladmin/Dashboard.jsx

import { useEffect, useState } from "react";
import { Link }         from "react-router-dom";
import DashboardLayout  from "../../components/layout/DashboardLayout";
import StatCard         from "../../components/common/StatCard";
import { useAuth }      from "../../context/AuthContext";
import api              from "../../api/axiosInstance";

export default function SchoolAdminDashboard() {
  const { user }              = useAuth();
  const [students,  setStudents]  = useState([]);
  const [teachers,  setTeachers]  = useState([]);
  const [classes,   setClasses]   = useState([]);
  const [fees,      setFees]      = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/students/"),
      api.get("/teachers/"),
      api.get("/classes/"),
      api.get("/fee-payments/"),
    ])
      .then(([s, t, c, f]) => {
        setStudents(s.data.results || []);
        setTeachers(t.data.results || []);
        setClasses(c.data.results  || []);
        setFees(f.data.results     || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const pendingFees = fees.filter((f) => f.status === "pending").length;
  const paidFees    = fees.filter((f) => f.status === "paid").length;

  return (
    <DashboardLayout>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>School Admin Dashboard</h1>
          <p style={styles.subtitle}>Welcome, {user?.full_name}! 👋</p>
        </div>
        <div style={styles.badge}>School Admin</div>
      </div>

      {/* Stats */}
      <div style={styles.statsRow}>
        <StatCard icon="🎓" label="Total Students" value={students.length} color="#3b82f6" />
        <StatCard icon="👨‍🏫" label="Teachers"      value={teachers.length} color="#8b5cf6" />
        <StatCard icon="🏛️" label="Classes"        value={classes.length}  color="#10b981" />
        <StatCard icon="💰" label="Pending Fees"   value={pendingFees}     color="#f59e0b" />
      </div>

      {/* Quick Actions */}
      <div style={styles.actionsRow}>
        <QuickAction icon="🎓" label="Add Student"  link="/school-admin/students" color="#3b82f6" />
        <QuickAction icon="👨‍🏫" label="Add Teacher"  link="/school-admin/teachers" color="#8b5cf6" />
        <QuickAction icon="🏛️" label="Add Class"    link="/school-admin/classes"  color="#10b981" />
        <QuickAction icon="💰" label="Manage Fees"  link="/school-admin/fees"     color="#f59e0b" />
      </div>

      <div style={styles.twoCol}>
        {/* Recent Students */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>🎓 Recent Students</h2>
            <Link to="/school-admin/students" style={styles.viewAll}>View All</Link>
          </div>
          {loading ? <p style={styles.empty}>Loading...</p>
          : students.length === 0 ? <p style={styles.empty}>No students yet.</p>
          : students.slice(0, 6).map((s) => (
            <div key={s.id} style={styles.listRow}>
              <div style={styles.avatar}>
                {s.first_name?.[0]}{s.last_name?.[0]}
              </div>
              <div style={styles.listInfo}>
                <div style={styles.listName}>{s.full_name}</div>
                <div style={styles.listSub}>{s.classroom_name} · Roll #{s.roll_number}</div>
              </div>
              <div style={styles.admNo}>{s.admission_no}</div>
            </div>
          ))}
        </div>

        {/* Recent Teachers */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>👨‍🏫 Teachers</h2>
            <Link to="/school-admin/teachers" style={styles.viewAll}>View All</Link>
          </div>
          {loading ? <p style={styles.empty}>Loading...</p>
          : teachers.length === 0 ? <p style={styles.empty}>No teachers yet.</p>
          : teachers.slice(0, 6).map((t) => (
            <div key={t.id} style={styles.listRow}>
              <div style={{ ...styles.avatar, background: "#8b5cf6" }}>
                {t.full_name?.[0]}
              </div>
              <div style={styles.listInfo}>
                <div style={styles.listName}>{t.full_name}</div>
                <div style={styles.listSub}>{t.qualification}</div>
              </div>
              <div style={styles.empId}>{t.employee_id}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Fee Summary */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>💰 Fee Overview</h2>
        <div style={styles.feeRow}>
          <div style={{ ...styles.feeBox, borderColor: "#10b981" }}>
            <div style={{ ...styles.feeNum, color: "#10b981" }}>{paidFees}</div>
            <div style={styles.feeLbl}>Paid</div>
          </div>
          <div style={{ ...styles.feeBox, borderColor: "#f59e0b" }}>
            <div style={{ ...styles.feeNum, color: "#f59e0b" }}>{pendingFees}</div>
            <div style={styles.feeLbl}>Pending</div>
          </div>
          <div style={{ ...styles.feeBox, borderColor: "#3b82f6" }}>
            <div style={{ ...styles.feeNum, color: "#3b82f6" }}>{fees.length}</div>
            <div style={styles.feeLbl}>Total Records</div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function QuickAction({ icon, label, link, color }) {
  return (
    <Link to={link} style={{ ...styles.actionCard, borderTop: `4px solid ${color}` }}>
      <div style={{ fontSize: "26px" }}>{icon}</div>
      <div style={styles.actionLabel}>{label}</div>
    </Link>
  );
}

const styles = {
  header: {
    display: "flex", justifyContent: "space-between",
    alignItems: "flex-start", marginBottom: "24px",
  },
  title:    { fontSize: "26px", fontWeight: "700", color: "#0f172a", margin: 0 },
  subtitle: { color: "#64748b", marginTop: "4px" },
  badge: {
    background: "#dbeafe", color: "#1d4ed8",
    padding: "6px 14px", borderRadius: "20px",
    fontSize: "13px", fontWeight: "600",
  },
  statsRow:   { display: "flex", gap: "16px", marginBottom: "20px", flexWrap: "wrap" },
  actionsRow: { display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" },
  actionCard: {
    flex: 1, minWidth: "120px", background: "white",
    borderRadius: "12px", padding: "16px 20px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
    textDecoration: "none", display: "flex",
    alignItems: "center", gap: "12px",
  },
  actionLabel: { fontWeight: "700", fontSize: "14px", color: "#0f172a" },
  twoCol: {
    display: "grid", gridTemplateColumns: "1fr 1fr",
    gap: "20px", marginBottom: "20px",
  },
  section: {
    background: "white", borderRadius: "12px",
    padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
    marginBottom: "20px",
  },
  sectionHeader: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", marginBottom: "16px",
  },
  sectionTitle: { fontSize: "16px", fontWeight: "700", color: "#0f172a", margin: 0 },
  viewAll: { fontSize: "13px", color: "#3b82f6", textDecoration: "none" },
  listRow: {
    display: "flex", alignItems: "center", gap: "12px",
    padding: "10px 0", borderBottom: "1px solid #f1f5f9",
  },
  avatar: {
    width: "36px", height: "36px", borderRadius: "50%",
    background: "#3b82f6", color: "white",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "13px", fontWeight: "700", flexShrink: 0,
  },
  listInfo:  { flex: 1 },
  listName:  { fontSize: "14px", fontWeight: "600", color: "#0f172a" },
  listSub:   { fontSize: "12px", color: "#64748b", marginTop: "2px" },
  admNo:     { fontSize: "12px", color: "#94a3b8" },
  empId:     { fontSize: "12px", color: "#94a3b8" },
  feeRow: { display: "flex", gap: "16px", flexWrap: "wrap" },
  feeBox: {
    flex: 1, minWidth: "120px", padding: "20px",
    borderRadius: "10px", border: "2px solid",
    textAlign: "center", background: "#f8fafc",
  },
  feeNum: { fontSize: "32px", fontWeight: "700" },
  feeLbl: { fontSize: "13px", color: "#64748b", marginTop: "4px" },
  empty:  { textAlign: "center", padding: "30px", color: "#94a3b8" },
};