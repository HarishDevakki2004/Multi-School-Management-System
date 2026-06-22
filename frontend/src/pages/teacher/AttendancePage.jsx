// src/pages/teacher/AttendancePage.jsx

import { useEffect, useState } from "react";
import DashboardLayout  from "../../components/layout/DashboardLayout";
import { classApi, attendanceApi } from "../../api/authApi";
import api from "../../api/axiosInstance";

export default function AttendancePage() {
  const [classes,    setClasses]    = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [students,   setStudents]   = useState([]);
  const [attendance, setAttendance] = useState({});
  const [date,       setDate]       = useState(today());
  const [saving,     setSaving]     = useState(false);
  const [message,    setMessage]    = useState("");

  function today() {
    return new Date().toISOString().split("T")[0];
  }

  // Load classes on mount
  useEffect(() => {
    classApi.list().then((r) => {
      const list = r.data.results || [];
      setClasses(list);
      if (list.length > 0) setSelectedClass(list[0].id);
    });
  }, []);

  // Load students when class changes
  useEffect(() => {
    if (!selectedClass) return;
    api.get("/students/", { params: { classroom: selectedClass } })
      .then((r) => {
        const list = r.data.results || [];
        setStudents(list);
        // Default all to present
        const defaults = {};
        list.forEach((s) => { defaults[s.id] = "present"; });
        setAttendance(defaults);
      });
  }, [selectedClass]);

  const handleStatus = (studentId, status) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = async () => {
    if (!selectedClass || students.length === 0) return;
    setSaving(true);
    setMessage("");
    try {
      const payload = {
        classroom: selectedClass,
        date,
        attendance: students.map((s) => ({
          student: s.id,
          status:  attendance[s.id] || "present",
          remarks: "",
        })),
      };
      await attendanceApi.markBulk(payload);
      setMessage(`✅ Attendance saved for ${students.length} students!`);
    } catch (e) {
      setMessage("❌ Failed to save attendance. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const counts = {
    present: Object.values(attendance).filter((s) => s === "present").length,
    absent:  Object.values(attendance).filter((s) => s === "absent").length,
    late:    Object.values(attendance).filter((s) => s === "late").length,
  };

  return (
    <DashboardLayout>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Mark Attendance</h1>
          <p style={styles.subtitle}>Record daily attendance for your class</p>
        </div>
      </div>

      {/* Controls */}
      <div style={styles.controls}>
        <div style={styles.controlGroup}>
          <label style={styles.label}>Class</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            style={styles.select}
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name} - {c.section}</option>
            ))}
          </select>
        </div>
        <div style={styles.controlGroup}>
          <label style={styles.label}>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={styles.select}
          />
        </div>
      </div>

      {/* Summary badges */}
      {students.length > 0 && (
        <div style={styles.summary}>
          <span style={{ ...styles.summaryBadge, background: "#dcfce7", color: "#16a34a" }}>
            ✅ Present: {counts.present}
          </span>
          <span style={{ ...styles.summaryBadge, background: "#fee2e2", color: "#dc2626" }}>
            ❌ Absent: {counts.absent}
          </span>
          <span style={{ ...styles.summaryBadge, background: "#fef9c3", color: "#ca8a04" }}>
            ⏰ Late: {counts.late}
          </span>
        </div>
      )}

      {/* Students list */}
      <div style={styles.section}>
        {students.length === 0 ? (
          <p style={styles.empty}>
            {selectedClass ? "No students in this class." : "Select a class to start."}
          </p>
        ) : (
          students.map((student, idx) => (
            <div key={student.id} style={styles.studentRow}>
              <div style={styles.rollNo}>{idx + 1}</div>
              <div style={styles.studentName}>{student.full_name}</div>
              <div style={styles.statusButtons}>
                {["present", "absent", "late", "excused"].map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatus(student.id, s)}
                    style={{
                      ...styles.statusBtn,
                      ...(attendance[student.id] === s
                        ? STATUS_ACTIVE[s]
                        : styles.statusBtnInactive),
                    }}
                  >
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Save button */}
      {students.length > 0 && (
        <div style={styles.footer}>
          {message && (
            <span style={{
              color: message.startsWith("✅") ? "#16a34a" : "#dc2626",
              fontSize: "14px",
            }}>
              {message}
            </span>
          )}
          <button
            onClick={handleSubmit}
            disabled={saving}
            style={{ ...styles.saveBtn, opacity: saving ? 0.7 : 1 }}
          >
            {saving ? "Saving..." : `Save Attendance (${students.length} students)`}
          </button>
        </div>
      )}
    </DashboardLayout>
  );
}

const STATUS_LABELS = {
  present: "✅ Present",
  absent:  "❌ Absent",
  late:    "⏰ Late",
  excused: "📋 Excused",
};

const STATUS_ACTIVE = {
  present: { background: "#dcfce7", color: "#16a34a", borderColor: "#16a34a" },
  absent:  { background: "#fee2e2", color: "#dc2626", borderColor: "#dc2626" },
  late:    { background: "#fef9c3", color: "#ca8a04", borderColor: "#ca8a04" },
  excused: { background: "#dbeafe", color: "#1d4ed8", borderColor: "#1d4ed8" },
};

const styles = {
  header:   { marginBottom: "24px" },
  title:    { fontSize: "26px", fontWeight: "700", color: "#0f172a", margin: 0 },
  subtitle: { color: "#64748b", marginTop: "4px" },
  controls: {
    display: "flex", gap: "16px",
    background: "white", borderRadius: "12px",
    padding: "20px", marginBottom: "16px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.07)", flexWrap: "wrap",
  },
  controlGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  label:  { fontSize: "13px", fontWeight: "600", color: "#374151" },
  select: {
    padding: "8px 12px", border: "1px solid #d1d5db",
    borderRadius: "8px", fontSize: "14px", minWidth: "180px",
  },
  summary: { display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" },
  summaryBadge: {
    padding: "6px 14px", borderRadius: "20px",
    fontSize: "13px", fontWeight: "600",
  },
  section: {
    background: "white", borderRadius: "12px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden",
  },
  studentRow: {
    display: "flex", alignItems: "center", gap: "16px",
    padding: "14px 20px", borderBottom: "1px solid #f1f5f9",
  },
  rollNo: {
    width: "28px", height: "28px", borderRadius: "50%",
    background: "#f1f5f9", display: "flex", alignItems: "center",
    justifyContent: "center", fontSize: "12px", fontWeight: "700",
    color: "#64748b", flexShrink: 0,
  },
  studentName: { flex: 1, fontSize: "15px", fontWeight: "600", color: "#0f172a" },
  statusButtons: { display: "flex", gap: "6px", flexWrap: "wrap" },
  statusBtn: {
    padding: "5px 12px", borderRadius: "6px", border: "1px solid #e2e8f0",
    fontSize: "12px", fontWeight: "600", cursor: "pointer",
    background: "white", color: "#64748b",
  },
  statusBtnInactive: { background: "white", color: "#94a3b8", borderColor: "#e2e8f0" },
  footer: {
    display: "flex", justifyContent: "flex-end", alignItems: "center",
    gap: "16px", marginTop: "20px",
  },
  saveBtn: {
    padding: "12px 28px", background: "#2563eb",
    color: "white", border: "none", borderRadius: "10px",
    fontSize: "15px", fontWeight: "600", cursor: "pointer",
  },
  empty: { textAlign: "center", padding: "40px", color: "#94a3b8" },
};