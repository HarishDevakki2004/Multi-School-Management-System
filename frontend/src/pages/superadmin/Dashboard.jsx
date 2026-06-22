// src/pages/superadmin/Dashboard.jsx

import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import StatCard        from "../../components/common/StatCard";
import { useAuth }     from "../../context/AuthContext";
import { schoolApi }   from "../../api/authApi";

export default function SuperAdminDashboard() {
  const { user }        = useAuth();
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    schoolApi.list()
      .then((r) => setSchools(r.data.results || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const approved = schools.filter((s) => s.status === "approved").length;
  const pending  = schools.filter((s) => s.status === "pending").length;
  const rejected = schools.filter((s) => s.status === "rejected").length;

  return (
    <DashboardLayout>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Dashboard</h1>
          <p style={styles.subtitle}>Welcome back, {user?.full_name}! 👋</p>
        </div>
        <div style={styles.badge}>Super Admin</div>
      </div>

      {/* Stat Cards */}
      <div style={styles.statsRow}>
        <StatCard icon="🏫" label="Total Schools"    value={schools.length} color="#3b82f6" />
        <StatCard icon="✅" label="Approved"         value={approved}       color="#10b981" />
        <StatCard icon="⏳" label="Pending Approval" value={pending}        color="#f59e0b" />
        <StatCard icon="❌" label="Rejected"         value={rejected}       color="#ef4444" />
      </div>

      {/* Schools Table */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>All Schools</h2>
          <span style={styles.count}>{schools.length} total</span>
        </div>

        {loading ? (
          <div style={styles.loading}>Loading schools...</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>School Name</th>
                <th style={styles.th}>Code</th>
                <th style={styles.th}>City</th>
                <th style={styles.th}>Board</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {schools.length === 0 ? (
                <tr>
                  <td colSpan={5} style={styles.empty}>No schools found.</td>
                </tr>
              ) : (
                schools.map((s) => (
                  <tr key={s.id} style={styles.tr}>
                    <td style={styles.td}>
                      <strong>{s.name}</strong>
                    </td>
                    <td style={styles.td}>{s.code}</td>
                    <td style={styles.td}>{s.city}</td>
                    <td style={styles.td}>{s.board || "—"}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge2,
                        background: s.status === "approved" ? "#dcfce7"
                                  : s.status === "pending"  ? "#fef9c3"
                                  : "#fee2e2",
                        color:      s.status === "approved" ? "#16a34a"
                                  : s.status === "pending"  ? "#ca8a04"
                                  : "#dc2626",
                      }}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
}

const styles = {
  header: {
    display:        "flex",
    justifyContent: "space-between",
    alignItems:     "flex-start",
    marginBottom:   "28px",
  },
  title:    { fontSize: "26px", fontWeight: "700", color: "#0f172a", margin: 0 },
  subtitle: { color: "#64748b", marginTop: "4px", fontSize: "15px" },
  badge: {
    background:   "#dbeafe",
    color:        "#1d4ed8",
    padding:      "6px 14px",
    borderRadius: "20px",
    fontSize:     "13px",
    fontWeight:   "600",
  },
  statsRow: {
    display:       "flex",
    gap:           "16px",
    marginBottom:  "28px",
    flexWrap:      "wrap",
  },
  section: {
    background:   "white",
    borderRadius: "12px",
    padding:      "24px",
    boxShadow:    "0 1px 4px rgba(0,0,0,0.07)",
  },
  sectionHeader: {
    display:        "flex",
    justifyContent: "space-between",
    alignItems:     "center",
    marginBottom:   "16px",
  },
  sectionTitle: { fontSize: "16px", fontWeight: "700", color: "#0f172a", margin: 0 },
  count:        { color: "#64748b", fontSize: "14px" },
  loading:      { textAlign: "center", padding: "40px", color: "#64748b" },
  table:        { width: "100%", borderCollapse: "collapse" },
  thead:        { background: "#f8fafc" },
  th: {
    padding:   "10px 14px",
    textAlign: "left",
    fontSize:  "12px",
    fontWeight:"600",
    color:     "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  tr: { borderBottom: "1px solid #f1f5f9" },
  td: { padding: "12px 14px", fontSize: "14px", color: "#374151" },
  empty: { textAlign: "center", padding: "40px", color: "#94a3b8" },
  badge2: {
    padding:      "3px 10px",
    borderRadius: "20px",
    fontSize:     "12px",
    fontWeight:   "600",
  },
};