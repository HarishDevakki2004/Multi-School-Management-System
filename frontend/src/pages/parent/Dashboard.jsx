// src/pages/parent/Dashboard.jsx

import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import StatCard        from "../../components/common/StatCard";
import { useAuth }     from "../../context/AuthContext";
import api             from "../../api/axiosInstance";

export default function ParentDashboard() {
  const { user }              = useAuth();
  const [students,  setStudents]  = useState([]);
  const [homework,  setHomework]  = useState([]);
  const [attendance, setAttendance] = useState(null);
  const [fees,      setFees]      = useState([]);
  const [selected,  setSelected]  = useState(null);  // selected child
  const [loading,   setLoading]   = useState(true);

  // Load children
  useEffect(() => {
    api.get("/students/")
      .then((r) => {
        const list = r.data.results || [];
        setStudents(list);
        if (list.length > 0) setSelected(list[0]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Load data when child selected
  useEffect(() => {
    if (!selected) return;

    const month = new Date().getMonth() + 1;
    const year  = new Date().getFullYear();

    Promise.all([
      api.get("/homework/", { params: { classroom: selected.classroom } }),
      api.get("/attendance/summary/", { params: { student: selected.id, month, year } }),
      api.get("/fee-payments/student-summary/", { params: { student: selected.id } }),
    ])
      .then(([h, a, f]) => {
        setHomework(h.data.results || []);
        setAttendance(a.data);
        setFees(f.data);
      })
      .catch(console.error);
  }, [selected]);

  if (loading) {
    return (
      <DashboardLayout>
        <p style={styles.empty}>Loading your dashboard...</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Parent Dashboard</h1>
          <p style={styles.subtitle}>Welcome, {user?.full_name}! 👋</p>
        </div>
        <div style={styles.badge}>Parent</div>
      </div>

      {/* Child Selector */}
      {students.length > 1 && (
        <div style={styles.childSelector}>
          <span style={styles.childLabel}>Viewing child:</span>
          {students.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelected(s)}
              style={{
                ...styles.childBtn,
                ...(selected?.id === s.id ? styles.childBtnActive : {}),
              }}
            >
              {s.full_name}
            </button>
          ))}
        </div>
      )}

      {/* No children */}
      {students.length === 0 && (
        <div style={styles.emptyCard}>
          <div style={{ fontSize: "48px" }}>👨‍👩‍👧</div>
          <h3>No children linked yet</h3>
          <p>Please contact your school admin to link your child's profile.</p>
        </div>
      )}

      {selected && (
        <>
          {/* Child Profile Card */}
          <div style={styles.profileCard}>
            <div style={styles.profileAvatar}>
              {selected.first_name?.[0]}{selected.last_name?.[0]}
            </div>
            <div style={styles.profileInfo}>
              <h2 style={styles.profileName}>{selected.full_name}</h2>
              <div style={styles.profileMeta}>
                <span style={styles.metaItem}>🎓 {selected.classroom_name}</span>
                <span style={styles.metaItem}>🪪 Adm: {selected.admission_no}</span>
                <span style={styles.metaItem}>
                  {selected.gender === "M" ? "👦" : "👧"} Roll #{selected.roll_number}
                </span>
              </div>
            </div>
            <div style={{
              ...styles.statusDot,
              background: selected.is_active ? "#10b981" : "#ef4444",
            }}>
              {selected.is_active ? "Active" : "Inactive"}
            </div>
          </div>

          {/* Stat Cards */}
          <div style={styles.statsRow}>
            <StatCard
              icon="✅"
              label="Attendance"
              value={`${attendance?.attendance_percentage ?? "—"}%`}
              color="#10b981"
              sub={`Present: ${attendance?.present ?? 0} | Absent: ${attendance?.absent ?? 0}`}
            />
            <StatCard
              icon="📚"
              label="Homework"
              value={homework.length}
              color="#8b5cf6"
              sub="Active assignments this month"
            />
            <StatCard
              icon="💰"
              label="Fee Balance"
              value={`₹${fees?.balance ?? "—"}`}
              color={fees?.balance > 0 ? "#ef4444" : "#10b981"}
              sub={`Paid: ₹${fees?.total_paid ?? 0} of ₹${fees?.total_due ?? 0}`}
            />
          </div>

          {/* Two column layout */}
          <div style={styles.twoCol}>
            {/* Attendance Summary */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>📅 Attendance — This Month</h2>
              {attendance ? (
                <>
                  <div style={styles.attendanceBar}>
                    <div style={{
                      ...styles.attendanceFill,
                      width: `${attendance.attendance_percentage}%`,
                      background: attendance.attendance_percentage >= 75
                        ? "#10b981" : "#ef4444",
                    }} />
                  </div>
                  <p style={styles.attendancePct}>
                    {attendance.attendance_percentage}% attendance
                  </p>
                  <div style={styles.attGrid}>
                    <AttStat label="Total Days"  value={attendance.total}   color="#64748b" />
                    <AttStat label="Present"     value={attendance.present} color="#10b981" />
                    <AttStat label="Absent"      value={attendance.absent}  color="#ef4444" />
                    <AttStat label="Late"        value={attendance.late}    color="#f59e0b" />
                  </div>
                  {attendance.attendance_percentage < 75 && (
                    <div style={styles.warning}>
                      ⚠️ Attendance below 75%. Please ensure regular attendance.
                    </div>
                  )}
                </>
              ) : (
                <p style={styles.empty}>No attendance data this month.</p>
              )}
            </div>

            {/* Recent Homework */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>📚 Recent Homework</h2>
              {homework.length === 0 ? (
                <p style={styles.empty}>No homework assigned yet.</p>
              ) : (
                homework.slice(0, 5).map((hw) => (
                  <div key={hw.id} style={styles.hwRow}>
                    <div>
                      <span style={styles.hwSubject}>{hw.subject}</span>
                      <p style={styles.hwTitle}>{hw.title}</p>
                      <p style={styles.hwDesc}>{hw.description}</p>
                    </div>
                    <div style={styles.hwDue}>
                      📅 {hw.due_date}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Fee Payments */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>💰 Fee Payments</h2>
            {!fees?.payments || fees.payments.length === 0 ? (
              <p style={styles.empty}>No fee records found.</p>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thead}>
                    <th style={styles.th}>Category</th>
                    <th style={styles.th}>Due Date</th>
                    <th style={styles.th}>Amount Due</th>
                    <th style={styles.th}>Amount Paid</th>
                    <th style={styles.th}>Balance</th>
                    <th style={styles.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {fees.payments.map((p) => (
                    <tr key={p.id} style={styles.tr}>
                      <td style={styles.td}>{p.category_name}</td>
                      <td style={styles.td}>{p.due_date}</td>
                      <td style={styles.td}>₹{p.amount_due}</td>
                      <td style={styles.td}>₹{p.amount_paid}</td>
                      <td style={styles.td}>₹{p.balance}</td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.statusBadge,
                          background: p.status === "paid"    ? "#dcfce7"
                                    : p.status === "pending" ? "#fef9c3"
                                    : p.status === "overdue" ? "#fee2e2"
                                    : "#f1f5f9",
                          color:      p.status === "paid"    ? "#16a34a"
                                    : p.status === "pending" ? "#ca8a04"
                                    : p.status === "overdue" ? "#dc2626"
                                    : "#64748b",
                        }}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}

function AttStat({ label, value, color }) {
  return (
    <div style={styles.attStat}>
      <div style={{ ...styles.attValue, color }}>{value ?? 0}</div>
      <div style={styles.attLabel}>{label}</div>
    </div>
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
    background: "#dcfce7", color: "#16a34a",
    padding: "6px 14px", borderRadius: "20px",
    fontSize: "13px", fontWeight: "600",
  },
  childSelector: {
    display: "flex", alignItems: "center", gap: "10px",
    marginBottom: "20px", flexWrap: "wrap",
  },
  childLabel: { fontSize: "14px", color: "#64748b", fontWeight: "600" },
  childBtn: {
    padding: "6px 16px", borderRadius: "20px",
    border: "1px solid #d1d5db", background: "white",
    color: "#374151", cursor: "pointer", fontSize: "14px",
  },
  childBtnActive: {
    background: "#0f172a", color: "white", borderColor: "#0f172a",
  },
  emptyCard: {
    background: "white", borderRadius: "12px", padding: "60px",
    textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
    color: "#64748b",
  },
  profileCard: {
    background: "white", borderRadius: "12px", padding: "24px",
    marginBottom: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
    display: "flex", alignItems: "center", gap: "20px",
  },
  profileAvatar: {
    width: "60px", height: "60px", borderRadius: "50%",
    background: "#3b82f6", color: "white",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "22px", fontWeight: "700", flexShrink: 0,
  },
  profileInfo:  { flex: 1 },
  profileName:  { fontSize: "20px", fontWeight: "700", color: "#0f172a", margin: 0 },
  profileMeta:  { display: "flex", gap: "16px", marginTop: "8px", flexWrap: "wrap" },
  metaItem:     { fontSize: "13px", color: "#64748b" },
  statusDot: {
    padding: "4px 14px", borderRadius: "20px",
    color: "white", fontSize: "12px", fontWeight: "600",
  },
  statsRow: { display: "flex", gap: "16px", marginBottom: "20px", flexWrap: "wrap" },
  twoCol: {
    display: "grid", gridTemplateColumns: "1fr 1fr",
    gap: "20px", marginBottom: "20px",
  },
  section: {
    background: "white", borderRadius: "12px",
    padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
    marginBottom: "0",
  },
  sectionTitle: {
    fontSize: "16px", fontWeight: "700",
    color: "#0f172a", marginBottom: "16px",
  },
  attendanceBar: {
    height: "10px", background: "#f1f5f9",
    borderRadius: "10px", overflow: "hidden", marginBottom: "8px",
  },
  attendanceFill: {
    height: "100%", borderRadius: "10px", transition: "width 0.5s",
  },
  attendancePct: { fontSize: "14px", color: "#64748b", marginBottom: "16px" },
  attGrid: {
    display: "grid", gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  attStat: {
    background: "#f8fafc", borderRadius: "8px",
    padding: "12px", textAlign: "center",
  },
  attValue: { fontSize: "22px", fontWeight: "700" },
  attLabel: { fontSize: "12px", color: "#64748b", marginTop: "4px" },
  warning: {
    background: "#fef9c3", color: "#92400e",
    padding: "10px 14px", borderRadius: "8px",
    fontSize: "13px", marginTop: "12px",
  },
  hwRow: {
    display: "flex", justifyContent: "space-between",
    alignItems: "flex-start", padding: "12px 0",
    borderBottom: "1px solid #f1f5f9", gap: "12px",
  },
  hwSubject: {
    background: "#ede9fe", color: "#7c3aed",
    padding: "2px 8px", borderRadius: "20px",
    fontSize: "11px", fontWeight: "600",
  },
  hwTitle: { fontSize: "14px", fontWeight: "600", color: "#0f172a", marginTop: "4px" },
  hwDesc:  { fontSize: "13px", color: "#64748b", marginTop: "2px" },
  hwDue:   { fontSize: "12px", color: "#f59e0b", flexShrink: 0 },
  table:   { width: "100%", borderCollapse: "collapse" },
  thead:   { background: "#f8fafc" },
  th: {
    padding: "10px 14px", textAlign: "left",
    fontSize: "12px", fontWeight: "600", color: "#64748b",
    textTransform: "uppercase",
  },
  tr:  { borderBottom: "1px solid #f1f5f9" },
  td:  { padding: "12px 14px", fontSize: "14px", color: "#374151" },
  statusBadge: {
    padding: "3px 10px", borderRadius: "20px",
    fontSize: "12px", fontWeight: "600",
  },
  empty: { textAlign: "center", padding: "30px", color: "#94a3b8" },
};