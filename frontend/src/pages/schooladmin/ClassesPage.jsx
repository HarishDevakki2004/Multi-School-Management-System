// src/pages/schooladmin/ClassesPage.jsx

import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { classApi, schoolApi } from "../../api/authApi";
import { useAuth } from "../../context/AuthContext";

export default function ClassesPage() {
  const { user }           = useAuth();
  const [classes,  setClasses]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [message,  setMessage]  = useState("");
  const [saving,   setSaving]   = useState(false);
  const [editId,   setEditId]   = useState(null);

  const [form, setForm] = useState({
    name: "", section: "", academic_year: "2024-25",
    capacity: 40, school: "",
  });

  useEffect(() => {
    classApi.list()
      .then((r) => setClasses(r.data.results || []))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const resetForm = () => {
    setForm({ name: "", section: "", academic_year: "2024-25", capacity: 40, school: "" });
    setEditId(null);
  };

  const handleEdit = (cls) => {
    setForm({
      name:          cls.name,
      section:       cls.section,
      academic_year: cls.academic_year,
      capacity:      cls.capacity,
      school:        cls.school,
    });
    setEditId(cls.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this class? Students will be unassigned.")) return;
    try {
      await classApi.delete(id);
      setClasses((prev) => prev.filter((c) => c.id !== id));
      setMessage("✅ Class deleted.");
    } catch {
      setMessage("❌ Failed to delete class.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const payload = { ...form };
      if (!payload.school) payload.school = user?.school;
      if (editId) {
        const res = await classApi.update(editId, payload);
        setClasses((prev) => prev.map((c) => c.id === editId ? res.data : c));
        setMessage("✅ Class updated!");
      } else {
        const res = await classApi.create(payload);
        setClasses((prev) => [res.data, ...prev]);
        setMessage("✅ Class created!");
      }
      setShowForm(false);
      resetForm();
    } catch (err) {
      const errors = err.response?.data;
      const msg = errors ? Object.values(errors).flat().join(" ") : "Failed to save.";
      setMessage(`❌ ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  // Group by academic year
  const years = [...new Set(classes.map((c) => c.academic_year))].sort().reverse();

  return (
    <DashboardLayout>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Classes</h1>
          <p style={styles.subtitle}>{classes.length} classes across all years</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          style={styles.addBtn}
        >
          {showForm ? "✕ Cancel" : "+ Add Class"}
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

      {/* Form */}
      {showForm && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>
            {editId ? "✏️ Edit Class" : "➕ Create New Class"}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Class Name</label>
                <input name="name" value={form.name} onChange={handleChange}
                  style={styles.input} placeholder="e.g. Grade 5, Class 10" required />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Section</label>
                <input name="section" value={form.section} onChange={handleChange}
                  style={styles.input} placeholder="e.g. A, B, C" required />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Academic Year</label>
                <input name="academic_year" value={form.academic_year}
                  onChange={handleChange} style={styles.input}
                  placeholder="2024-25" required />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Capacity</label>
                <input name="capacity" type="number" value={form.capacity}
                  onChange={handleChange} style={styles.input} min={1} required />
              </div>
            </div>
            <div style={styles.formActions}>
              <button type="button" onClick={() => { setShowForm(false); resetForm(); }}
                style={styles.cancelBtn}>Cancel</button>
              <button type="submit" disabled={saving} style={styles.submitBtn}>
                {saving ? "Saving..." : editId ? "Update Class" : "Create Class"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Classes grouped by year */}
      {loading ? (
        <p style={styles.empty}>Loading...</p>
      ) : classes.length === 0 ? (
        <div style={styles.emptyCard}>
          <div style={{ fontSize: "40px" }}>🏛️</div>
          <h3 style={{ marginTop: "12px", color: "#374151" }}>No classes yet</h3>
          <p style={{ color: "#94a3b8", marginTop: "6px" }}>
            Create your first class to get started.
          </p>
        </div>
      ) : (
        years.map((year) => (
          <div key={year} style={styles.yearSection}>
            <div style={styles.yearHeader}>
              <span style={styles.yearBadge}>📅 {year}</span>
              <span style={styles.yearCount}>
                {classes.filter((c) => c.academic_year === year).length} classes
              </span>
            </div>
            <div style={styles.classGrid}>
              {classes
                .filter((c) => c.academic_year === year)
                .map((cls) => (
                  <div key={cls.id} style={styles.classCard}>
                    <div style={styles.classTop}>
                      <div style={styles.classIcon}>🏛️</div>
                      <div style={styles.classInfo}>
                        <div style={styles.className}>
                          {cls.name} — {cls.section}
                        </div>
                        <div style={styles.classMeta}>
                          {cls.school_name}
                        </div>
                      </div>
                    </div>
                    <div style={styles.classStats}>
                      <div style={styles.classStat}>
                        <div style={styles.classStatNum}>{cls.total_students}</div>
                        <div style={styles.classStatLbl}>Students</div>
                      </div>
                      <div style={styles.classStat}>
                        <div style={styles.classStatNum}>{cls.capacity}</div>
                        <div style={styles.classStatLbl}>Capacity</div>
                      </div>
                      <div style={styles.classStat}>
                        <div style={{
                          ...styles.classStatNum,
                          color: cls.total_students >= cls.capacity
                            ? "#ef4444" : "#10b981",
                        }}>
                          {cls.capacity - cls.total_students}
                        </div>
                        <div style={styles.classStatLbl}>Available</div>
                      </div>
                    </div>
                    {/* Capacity bar */}
                    <div style={styles.capBar}>
                      <div style={{
                        ...styles.capFill,
                        width: `${Math.min((cls.total_students / cls.capacity) * 100, 100)}%`,
                        background: cls.total_students >= cls.capacity
                          ? "#ef4444" : "#3b82f6",
                      }} />
                    </div>
                    <div style={styles.classFooter}>
                      <button onClick={() => handleEdit(cls)} style={styles.editBtn}>
                        ✏️ Edit
                      </button>
                      <button onClick={() => handleDelete(cls.id)} style={styles.deleteBtn}>
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))
      )}
    </DashboardLayout>
  );
}

const styles = {
  header: {
    display: "flex", justifyContent: "space-between",
    alignItems: "flex-start", marginBottom: "20px",
  },
  title:    { fontSize: "26px", fontWeight: "700", color: "#0f172a", margin: 0 },
  subtitle: { color: "#64748b", marginTop: "4px" },
  addBtn: {
    padding: "10px 20px", background: "#10b981",
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
  formTitle: { fontSize: "16px", fontWeight: "700", color: "#0f172a", marginBottom: "16px" },
  formRow:   { display: "flex", gap: "14px", flexWrap: "wrap" },
  formGroup: {
    display: "flex", flexDirection: "column",
    gap: "6px", flex: 1, minWidth: "160px", marginBottom: "14px",
  },
  label: { fontSize: "13px", fontWeight: "600", color: "#374151" },
  input: {
    padding: "9px 12px", border: "1px solid #d1d5db",
    borderRadius: "8px", fontSize: "14px", width: "100%",
  },
  formActions: {
    display: "flex", justifyContent: "flex-end", gap: "10px",
  },
  cancelBtn: {
    padding: "9px 20px", background: "white",
    border: "1px solid #d1d5db", borderRadius: "8px",
    fontSize: "14px", cursor: "pointer",
  },
  submitBtn: {
    padding: "9px 24px", background: "#10b981",
    color: "white", border: "none", borderRadius: "8px",
    fontSize: "14px", fontWeight: "600", cursor: "pointer",
  },
  yearSection:  { marginBottom: "24px" },
  yearHeader: {
    display: "flex", alignItems: "center",
    justifyContent: "space-between", marginBottom: "12px",
  },
  yearBadge: {
    background: "#f1f5f9", color: "#374151",
    padding: "4px 14px", borderRadius: "20px",
    fontSize: "13px", fontWeight: "600",
  },
  yearCount: { fontSize: "13px", color: "#94a3b8" },
  classGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "14px",
  },
  classCard: {
    background: "white", borderRadius: "12px",
    padding: "18px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
  },
  classTop: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" },
  classIcon: {
    width: "40px", height: "40px", borderRadius: "10px",
    background: "#f0fdf4", display: "flex",
    alignItems: "center", justifyContent: "center", fontSize: "20px",
  },
  classInfo:    {},
  className:    { fontSize: "15px", fontWeight: "700", color: "#0f172a" },
  classMeta:    { fontSize: "12px", color: "#94a3b8", marginTop: "2px" },
  classStats: {
    display: "flex", justifyContent: "space-between",
    marginBottom: "10px",
  },
  classStat:    { textAlign: "center" },
  classStatNum: { fontSize: "18px", fontWeight: "700", color: "#0f172a" },
  classStatLbl: { fontSize: "11px", color: "#94a3b8", marginTop: "2px" },
  capBar: {
    height: "5px", background: "#f1f5f9",
    borderRadius: "10px", overflow: "hidden", marginBottom: "14px",
  },
  capFill:   { height: "100%", borderRadius: "10px", transition: "width 0.4s" },
  classFooter: { display: "flex", justifyContent: "flex-end", gap: "8px" },
  editBtn: {
    padding: "5px 12px", background: "#f1f5f9",
    border: "none", borderRadius: "6px",
    fontSize: "12px", cursor: "pointer", color: "#374151",
  },
  deleteBtn: {
    padding: "5px 12px", background: "#fee2e2",
    border: "none", borderRadius: "6px",
    fontSize: "12px", cursor: "pointer", color: "#dc2626",
  },
  emptyCard: {
    background: "white", borderRadius: "12px",
    padding: "60px", textAlign: "center",
    boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
  },
  empty: { textAlign: "center", padding: "40px", color: "#94a3b8" },
};