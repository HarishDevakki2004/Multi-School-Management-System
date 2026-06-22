// src/pages/teacher/Dashboard.jsx

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import StatCard        from "../../components/common/StatCard";
import { useAuth }     from "../../context/AuthContext";
import { homeworkApi, classApi } from "../../api/authApi";

export default function TeacherDashboard() {
  const { user }            = useAuth();
  const [classes,  setClasses]  = useState([]);
  const [homework, setHomework] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([
      classApi.list(),
      homeworkApi.list(),
    ])
      .then(([c, h]) => {
        setClasses(c.data.results  || []);
        setHomework(h.data.results || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Teacher Dashboard</h1>
          <p style={styles.subtitle}>Welcome, {user?.full_name}! 👋</p>
        </div>
        <div style={styles.badge}>Teacher</div>
      </div>

      <div style={styles.statsRow}>
        <StatCard icon="🏛️" label="My Classes"    value={classes.length}  color="#3b82f6" />
        <StatCard icon="📚" label="Homework Given" value={homework.length} color="#8b5cf6" />
        <StatCard icon="📅" label="Today"
          value={new Date().toLocaleDateString("en-IN", { day:"numeric", month:"short" })}
          color="#10b981"
        />
      </div>

      {/* Quick Actions */}
      <div style={styles.actionsRow}>
        <ActionCard
          icon="✅"
          title="Mark Attendance"
          desc="Record today's attendance"
          color="#10b981"
          link="/teacher/attendance"
        />
        <ActionCard
          icon="📚"
          title="Assign Homework"
          desc="Create a new homework task"
          color="#8b5cf6"
          link="/teacher/homework"
        />
        <ActionCard
          icon="📊"
          title="Upload Marks"
          desc="Enter exam results"
          color="#f59e0b"
          link="/teacher/marks"
        />
      </div>

      {/* Recent Homework */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Recent Homework</h2>
        {loading ? (
          <p style={styles.empty}>Loading...</p>
        ) : homework.length === 0 ? (
          <p style={styles.empty}>No homework created yet.</p>
        ) : (
          homework.slice(0, 5).map((hw) => (
            <div key={hw.id} style={styles.hwRow}>
              <div style={styles.hwSubject}>{hw.subject}</div>
              <div style={styles.hwTitle}>{hw.title}</div>
              <div style={styles.hwDue}>Due: {hw.due_date}</div>
            </div>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}

// ✅ Uses Link — no page reload
function ActionCard({ icon, title, desc, color, link }) {
  return (
    <Link to={link} style={{ ...styles.actionCard, borderTop: `4px solid ${color}` }}>
      <div style={{ fontSize: "28px", marginBottom: "10px" }}>{icon}</div>
      <div style={styles.actionTitle}>{title}</div>
      <div style={styles.actionDesc}>{desc}</div>
    </Link>
  );
}

const styles = {
  header: {
    display: "flex", justifyContent: "space-between",
    alignItems: "flex-start", marginBottom: "28px",
  },
  title:    { fontSize: "26px", fontWeight: "700", color: "#0f172a", margin: 0 },
  subtitle: { color: "#64748b", marginTop: "4px" },
  badge: {
    background: "#ede9fe", color: "#7c3aed",
    padding: "6px 14px", borderRadius: "20px",
    fontSize: "13px", fontWeight: "600",
  },
  statsRow:   { display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap" },
  actionsRow: { display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap" },
  actionCard: {
    flex: 1, minWidth: "160px",
    background: "white", borderRadius: "12px",
    padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
    textDecoration: "none", display: "block", cursor: "pointer",
  },
  actionTitle: { fontWeight: "700", fontSize: "15px", color: "#0f172a" },
  actionDesc:  { fontSize: "13px", color: "#64748b", marginTop: "4px" },
  section: {
    background: "white", borderRadius: "12px",
    padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
  },
  sectionTitle: {
    fontSize: "16px", fontWeight: "700",
    color: "#0f172a", marginBottom: "16px",
  },
  hwRow: {
    display: "flex", alignItems: "center", gap: "16px",
    padding: "12px 0", borderBottom: "1px solid #f1f5f9",
  },
  hwSubject: {
    background: "#ede9fe", color: "#7c3aed",
    padding: "3px 10px", borderRadius: "20px",
    fontSize: "12px", fontWeight: "600",
  },
  hwTitle: { flex: 1, fontSize: "14px", color: "#374151" },
  hwDue:   { fontSize: "12px", color: "#94a3b8" },
  empty:   { textAlign: "center", padding: "30px", color: "#94a3b8" },
};