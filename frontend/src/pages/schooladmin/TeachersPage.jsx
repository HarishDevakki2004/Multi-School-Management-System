// src/pages/schooladmin/TeachersPage.jsx

import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { teacherApi } from "../../api/authApi";

export default function TeachersPage() {
  const [teachers, setTeachers] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search,   setSearch]   = useState("");
  const [message,  setMessage]  = useState("");
  const [saving,   setSaving]   = useState(false);

  const [form, setForm] = useState({
    email: "", first_name: "", last_name: "",
    phone: "", password: "Teacher1234@",
    employee_id: "", qualification: "",
    specialization: "", joining_date: "",
  });

  useEffect(() => {
    teacherApi.list()
      .then((r) => setTeachers(r.data.results || []))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const resetForm = () => {
    setForm({
      email: "", first_name: "", last_name: "",
      phone: "", password: "Teacher1234@",
      employee_id: "", qualification: "",
      specialization: "", joining_date: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const res = await teacherApi.create(form);
      setTeachers((prev) => [res.data, ...prev]);
      setMessage("✅ Teacher added successfully! Default password: Teacher1234@");
      setShowForm(false);
      resetForm();
    } catch (err) {
      const errors = err.response?.data;
      const msg = errors
        ? Object.values(errors).flat().join(" ")
        : "Failed to add teacher.";
      setMessage(`❌ ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this teacher?")) return;
    try {
      await teacherApi.delete(id);
      setTeachers((prev) => prev.filter((t) => t.id !== id));
      setMessage("✅ Teacher deleted.");
    } catch {
      setMessage("❌ Failed to delete teacher.");
    }
  };

  const filtered = teachers.filter((t) =>
    t.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    t.employee_id?.toLowerCase().includes(search.toLowerCase()) ||
    t.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Teachers</h1>
          <p style={styles.subtitle}>{teachers.length} teachers on staff</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          style={styles.addBtn}
        >
          {showForm ? "✕ Cancel" : "+ Add Teacher"}
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

      {/* Add Teacher Form */}
      {showForm && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>➕ Add New Teacher</h3>
          <p style={styles.formNote}>
            This will create a login account for the teacher.
          </p>
          <form onSubmit={handleSubmit}>
            <div style={styles.formRow}>
              <Field label="First Name"   name="first_name"   value={form.first_name}   onChange={handleChange} required />
              <Field label="Last Name"    name="last_name"    value={form.last_name}    onChange={handleChange} required />
              <Field label="Email"        name="email"        value={form.email}        onChange={handleChange} type="email" required />
            </div>
            <div style={styles.formRow}>
              <Field label="Phone"        name="phone"        value={form.phone}        onChange={handleChange} />
              <Field label="Employee ID"  name="employee_id"  value={form.employee_id}  onChange={handleChange} required />
              <Field label="Joining Date" name="joining_date" value={form.joining_date} onChange={handleChange} type="date" required />
            </div>
            <div style={styles.formRow}>
              <Field label="Qualification"  name="qualification"  value={form.qualification}  onChange={handleChange} required />
              <Field label="Specialization" name="specialization" value={form.specialization} onChange={handleChange} />
              <Field label="Default Password" name="password"    value={form.password}        onChange={handleChange} required />
            </div>
            <div style={styles.formActions}>
              <button type="button" onClick={() => setShowForm(false)} style={styles.cancelBtn}>
                Cancel
              </button>
              <button type="submit" disabled={saving} style={styles.submitBtn}>
                {saving ? "Adding..." : "Add Teacher"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div style={styles.toolbar}>
        <input
          placeholder="🔍 Search by name, email or employee ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchInput}
        />
        <span style={styles.resultCount}>
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Teachers Grid */}
      {loading ? (
        <p style={styles.empty}>Loading...</p>
      ) : filtered.length === 0 ? (
        <p style={styles.empty}>
          {search ? "No teachers match your search." : "No teachers added yet."}
        </p>
      ) : (
        <div style={styles.grid}>
          {filtered.map((t) => (
            <div key={t.id} style={styles.teacherCard}>
              <div style={styles.cardTop}>
                <div style={styles.avatar}>
                  {t.full_name?.[0]}
                </div>
                <div style={styles.teacherInfo}>
                  <div style={styles.teacherName}>{t.full_name}</div>
                  <div style={styles.teacherEmail}>{t.email}</div>
                </div>
              </div>
              <div style={styles.cardBody}>
                <InfoRow label="Employee ID"    value={t.employee_id} />
                <InfoRow label="Qualification"  value={t.qualification} />
                <InfoRow label="Specialization" value={t.specialization || "—"} />
                <InfoRow label="Joining Date"   value={t.joining_date} />
              </div>
              {/* Assigned Classes */}
              {t.assignments?.length > 0 && (
                <div style={styles.cardAssign}>
                  <div style={styles.assignLabel}>Assigned Classes:</div>
                  <div style={styles.assignList}>
                    {t.assignments.map((a) => (
                      <span key={a.id} style={styles.assignBadge}>
                        {a.subject}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div style={styles.cardFooter}>
                <span style={{
                  ...styles.statusBadge,
                  background: t.is_active ? "#dcfce7" : "#fee2e2",
                  color:      t.is_active ? "#16a34a" : "#dc2626",
                }}>
                  {t.is_active ? "Active" : "Inactive"}
                </span>
                <button
                  onClick={() => handleDelete(t.id)}
                  style={styles.deleteBtn}
                >
                  🗑️ Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

function Field({ label, name, value, onChange, type = "text", required }) {
  return (
    <div style={styles.formGroup}>
      <label style={styles.label}>{label}</label>
      <input
        type={type} name={name} value={value}
        onChange={onChange} required={required}
        style={styles.input} placeholder={label}
      />
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={styles.infoRow}>
      <span style={styles.infoLabel}>{label}:</span>
      <span style={styles.infoValue}>{value}</span>
    </div>
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
    padding: "10px 20px", background: "#8b5cf6",
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
  formTitle: { fontSize: "16px", fontWeight: "700", color: "#0f172a", marginBottom: "6px" },
  formNote:  { fontSize: "13px", color: "#64748b", marginBottom: "16px" },
  formRow:   { display: "flex", gap: "14px", flexWrap: "wrap" },
  formGroup: {
    display: "flex", flexDirection: "column",
    gap: "6px", flex: 1, minWidth: "180px", marginBottom: "14px",
  },
  label: { fontSize: "13px", fontWeight: "600", color: "#374151" },
  input: {
    padding: "9px 12px", border: "1px solid #d1d5db",
    borderRadius: "8px", fontSize: "14px", width: "100%", fontFamily: "inherit",
  },
  formActions: {
    display: "flex", justifyContent: "flex-end",
    gap: "10px", marginTop: "4px",
  },
  cancelBtn: {
    padding: "9px 20px", background: "white",
    border: "1px solid #d1d5db", borderRadius: "8px",
    fontSize: "14px", cursor: "pointer",
  },
  submitBtn: {
    padding: "9px 24px", background: "#8b5cf6",
    color: "white", border: "none", borderRadius: "8px",
    fontSize: "14px", fontWeight: "600", cursor: "pointer",
  },
  toolbar: {
    display: "flex", gap: "12px",
    marginBottom: "16px", alignItems: "center",
  },
  searchInput: {
    flex: 1, padding: "9px 14px",
    border: "1px solid #d1d5db", borderRadius: "8px",
    fontSize: "14px", background: "white",
  },
  resultCount: { fontSize: "13px", color: "#64748b", whiteSpace: "nowrap" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "16px",
  },
  teacherCard: {
    background: "white", borderRadius: "12px",
    padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
  },
  cardTop: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" },
  avatar: {
    width: "46px", height: "46px", borderRadius: "50%",
    background: "#8b5cf6", color: "white",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "18px", fontWeight: "700", flexShrink: 0,
  },
  teacherInfo:  {},
  teacherName:  { fontSize: "16px", fontWeight: "700", color: "#0f172a" },
  teacherEmail: { fontSize: "13px", color: "#64748b", marginTop: "2px" },
  cardBody: { borderTop: "1px solid #f1f5f9", paddingTop: "14px" },
  infoRow: {
    display: "flex", justifyContent: "space-between",
    fontSize: "13px", marginBottom: "6px",
  },
  infoLabel: { color: "#64748b" },
  infoValue: { color: "#0f172a", fontWeight: "500" },
  cardAssign: { marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #f1f5f9" },
  assignLabel: { fontSize: "12px", color: "#64748b", marginBottom: "6px" },
  assignList:  { display: "flex", gap: "6px", flexWrap: "wrap" },
  assignBadge: {
    background: "#ede9fe", color: "#7c3aed",
    padding: "2px 8px", borderRadius: "6px", fontSize: "12px",
  },
  cardFooter: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", marginTop: "14px",
    paddingTop: "14px", borderTop: "1px solid #f1f5f9",
  },
  statusBadge: {
    padding: "3px 10px", borderRadius: "20px",
    fontSize: "12px", fontWeight: "600",
  },
  deleteBtn: {
    padding: "5px 12px", background: "#fee2e2",
    border: "none", borderRadius: "6px",
    fontSize: "12px", cursor: "pointer", color: "#dc2626",
  },
  empty: { textAlign: "center", padding: "40px", color: "#94a3b8" },
};