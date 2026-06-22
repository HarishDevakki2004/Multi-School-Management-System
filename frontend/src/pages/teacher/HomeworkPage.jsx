// src/pages/teacher/HomeworkPage.jsx

import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { homeworkApi, classApi } from "../../api/authApi";

export default function HomeworkPage() {
  const [homework,  setHomework]  = useState([]);
  const [classes,   setClasses]   = useState([]);
  const [showForm,  setShowForm]  = useState(false);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [message,   setMessage]   = useState("");
  const [form, setForm] = useState({
    classroom: "", subject: "", title: "", description: "", due_date: "",
  });

  useEffect(() => {
    Promise.all([homeworkApi.list(), classApi.list()])
      .then(([h, c]) => {
        setHomework(h.data.results || []);
        const classList = c.data.results || [];
        setClasses(classList);
        if (classList.length > 0)
          setForm((f) => ({ ...f, classroom: classList[0].id }));
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const res = await homeworkApi.create(form);
      setHomework((prev) => [res.data, ...prev]);
      setShowForm(false);
      setMessage("✅ Homework created successfully!");
      setForm((f) => ({ ...f, subject: "", title: "", description: "", due_date: "" }));
    } catch {
      setMessage("❌ Failed to create homework.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Homework</h1>
          <p style={styles.subtitle}>Create and manage homework assignments</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>
          {showForm ? "✕ Cancel" : "+ New Homework"}
        </button>
      </div>

      {message && (
        <div style={{
          ...styles.message,
          background: message.startsWith("✅") ? "#dcfce7" : "#fee2e2",
          color:      message.startsWith("✅") ? "#16a34a" : "#dc2626",
        }}>
          {message}
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>New Homework Assignment</h3>
          <form onSubmit={handleSubmit}>
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Class</label>
                <select name="classroom" value={form.classroom}
                  onChange={handleChange} style={styles.input} required>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} - {c.section}</option>
                  ))}
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Subject</label>
                <input name="subject" value={form.subject} onChange={handleChange}
                  style={styles.input} placeholder="e.g. Mathematics" required />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Due Date</label>
                <input type="date" name="due_date" value={form.due_date}
                  onChange={handleChange} style={styles.input} required />
              </div>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Title</label>
              <input name="title" value={form.title} onChange={handleChange}
                style={styles.input} placeholder="Homework title" required />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Description</label>
              <textarea name="description" value={form.description}
                onChange={handleChange} style={{ ...styles.input, height: "90px" }}
                placeholder="Describe the homework task..." required />
            </div>
            <button type="submit" disabled={saving} style={styles.submitBtn}>
              {saving ? "Creating..." : "Create Homework"}
            </button>
          </form>
        </div>
      )}

      {/* Homework list */}
      <div style={styles.list}>
        {loading ? (
          <p style={styles.empty}>Loading...</p>
        ) : homework.length === 0 ? (
          <p style={styles.empty}>No homework yet. Create your first one!</p>
        ) : (
          homework.map((hw) => (
            <div key={hw.id} style={styles.hwCard}>
              <div style={styles.hwLeft}>
                <span style={styles.subject}>{hw.subject}</span>
                <h3 style={styles.hwTitle}>{hw.title}</h3>
                <p style={styles.hwDesc}>{hw.description}</p>
              </div>
              <div style={styles.hwRight}>
                <div style={styles.hwClass}>{hw.classroom_name}</div>
                <div style={styles.hwDue}>📅 Due: {hw.due_date}</div>
                <div style={styles.hwDate}>
                  Created: {new Date(hw.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}

const styles = {
  header: {
    display: "flex", justifyContent: "space-between",
    alignItems: "flex-start", marginBottom: "24px",
  },
  title:    { fontSize: "26px", fontWeight: "700", color: "#0f172a", margin: 0 },
  subtitle: { color: "#64748b", marginTop: "4px" },
  addBtn: {
    padding: "10px 20px", background: "#7c3aed",
    color: "white", border: "none", borderRadius: "8px",
    fontSize: "14px", fontWeight: "600", cursor: "pointer",
  },
  message: {
    padding: "12px 16px", borderRadius: "8px",
    marginBottom: "16px", fontSize: "14px",
  },
  formCard: {
    background: "white", borderRadius: "12px",
    padding: "24px", marginBottom: "20px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
  },
  formTitle: { fontSize: "16px", fontWeight: "700", marginBottom: "16px", color: "#0f172a" },
  formRow:   { display: "flex", gap: "16px", flexWrap: "wrap" },
  formGroup: { display: "flex", flexDirection: "column", gap: "6px", marginBottom: "14px", flex: 1, minWidth: "180px" },
  label:     { fontSize: "13px", fontWeight: "600", color: "#374151" },
  input: {
    padding: "9px 12px", border: "1px solid #d1d5db",
    borderRadius: "8px", fontSize: "14px", width: "100%",
    resize: "vertical", fontFamily: "inherit",
  },
  submitBtn: {
    padding: "10px 24px", background: "#7c3aed",
    color: "white", border: "none", borderRadius: "8px",
    fontSize: "14px", fontWeight: "600", cursor: "pointer",
  },
  list: { display: "flex", flexDirection: "column", gap: "12px" },
  hwCard: {
    background: "white", borderRadius: "12px",
    padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
    display: "flex", justifyContent: "space-between",
    alignItems: "flex-start", gap: "20px",
  },
  hwLeft:  { flex: 1 },
  hwRight: { textAlign: "right", flexShrink: 0 },
  subject: {
    background: "#ede9fe", color: "#7c3aed",
    padding: "3px 10px", borderRadius: "20px",
    fontSize: "12px", fontWeight: "600",
  },
  hwTitle: { fontSize: "16px", fontWeight: "700", color: "#0f172a", marginTop: "8px" },
  hwDesc:  { fontSize: "14px", color: "#64748b", marginTop: "4px" },
  hwClass: { fontSize: "13px", color: "#374151", fontWeight: "600" },
  hwDue:   { fontSize: "13px", color: "#f59e0b", marginTop: "6px" },
  hwDate:  { fontSize: "12px", color: "#94a3b8", marginTop: "4px" },
  empty:   { textAlign: "center", padding: "40px", color: "#94a3b8" },
};