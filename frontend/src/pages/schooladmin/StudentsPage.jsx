// src/pages/schooladmin/StudentsPage.jsx
// src/pages/schooladmin/StudentsPage.jsx

import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { studentApi, classApi } from "../../api/authApi";

export default function StudentsPage() {
  const { user }           = useAuth();
  const [students, setStudents] = useState([]);
  const [classes,  setClasses]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState("");
  const [message,  setMessage]  = useState("");
  const [saving,   setSaving]   = useState(false);
  const [editId,   setEditId]   = useState(null);

  const [form, setForm] = useState({
    first_name: "", last_name: "", admission_no: "",
    date_of_birth: "", gender: "M", classroom: "",
    roll_number: "", emergency_contact: "",
    address: "", admission_date: "",
  });

  useEffect(() => {
    Promise.all([studentApi.list(), classApi.list()])
      .then(([s, c]) => {
        setStudents(s.data.results || []);
        const classList = c.data.results || [];
        setClasses(classList);
        if (classList.length > 0)
          setForm((f) => ({ ...f, classroom: classList[0].id }));
      })
      .catch((err) => console.error("Load error:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const resetForm = () => {
    setForm({
      first_name: "", last_name: "", admission_no: "",
      date_of_birth: "", gender: "M",
      classroom: classes[0]?.id || "",
      roll_number: "", emergency_contact: "",
      address: "", admission_date: "",
    });
    setEditId(null);
  };

  const handleEdit = (student) => {
    setForm({
      first_name:        student.first_name        || "",
      last_name:         student.last_name         || "",
      admission_no:      student.admission_no      || "",
      date_of_birth:     student.date_of_birth     || "",
      gender:            student.gender            || "M",
      classroom:         student.classroom         || "",
      roll_number:       student.roll_number       || "",
      emergency_contact: student.emergency_contact || "",
      address:           student.address           || "",
      admission_date:    student.admission_date    || "",
    });
    setEditId(student.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this student?")) return;
    try {
      await studentApi.delete(id);
      setStudents((prev) => prev.filter((s) => s.id !== id));
      setMessage("✅ Student deleted.");
    } catch {
      setMessage("❌ Failed to delete student.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      // school is set by backend automatically from logged-in user
      const payload = { ...form };

      if (editId) {
        const res = await studentApi.update(editId, payload);
        setStudents((prev) =>
          prev.map((s) => (s.id === editId ? res.data : s))
        );
        setMessage("✅ Student updated successfully!");
      } else {
        const res = await studentApi.create(payload);
        setStudents((prev) => [res.data, ...prev]);
        setMessage("✅ Student added successfully!");
      }
      setShowForm(false);
      resetForm();
    } catch (err) {
      const errors = err.response?.data;
      if (errors) {
        const msgs = Object.entries(errors)
          .map(([field, errs]) =>
            `${field}: ${Array.isArray(errs) ? errs.join(", ") : errs}`
          )
          .join(" | ");
        setMessage(`❌ ${msgs}`);
      } else {
        setMessage("❌ Failed to save student.");
      }
    } finally {
      setSaving(false);
    }
  };

  const filtered = students.filter((s) => {
    const matchSearch =
      (s.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.admission_no || "").toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter ? s.classroom === filter : true;
    return matchSearch && matchFilter;
  });

  return (
    <DashboardLayout>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Students</h1>
          <p style={styles.subtitle}>
            {students.length} total students enrolled
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          style={styles.addBtn}
        >
          {showForm ? "✕ Cancel" : "+ Add Student"}
        </button>
      </div>

      {/* Message */}
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
            {editId ? "✏️ Edit Student" : "➕ Add New Student"}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>First Name</label>
                <input name="first_name" value={form.first_name}
                  onChange={handleChange} style={styles.input}
                  placeholder="First Name" required />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Last Name</label>
                <input name="last_name" value={form.last_name}
                  onChange={handleChange} style={styles.input}
                  placeholder="Last Name" required />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Admission No</label>
                <input name="admission_no" value={form.admission_no}
                  onChange={handleChange} style={styles.input}
                  placeholder="e.g. ADM004" required />
              </div>
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Date of Birth</label>
                <input name="date_of_birth" type="date"
                  value={form.date_of_birth} onChange={handleChange}
                  style={styles.input} required />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Gender</label>
                <select name="gender" value={form.gender}
                  onChange={handleChange} style={styles.input}>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="O">Other</option>
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Class</label>
                <select name="classroom" value={form.classroom}
                  onChange={handleChange} style={styles.input} required>
                  {classes.length === 0 && (
                    <option value="">No classes found</option>
                  )}
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} - {c.section}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Roll Number</label>
                <input name="roll_number" type="number"
                  value={form.roll_number} onChange={handleChange}
                  style={styles.input} placeholder="Roll No" />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Admission Date</label>
                <input name="admission_date" type="date"
                  value={form.admission_date} onChange={handleChange}
                  style={styles.input} required />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Emergency Contact</label>
                <input name="emergency_contact" value={form.emergency_contact}
                  onChange={handleChange} style={styles.input}
                  placeholder="Phone number" />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Address</label>
              <textarea name="address" value={form.address}
                onChange={handleChange}
                style={{ ...styles.input, height: "70px", resize: "vertical" }}
                placeholder="Student address..." />
            </div>

            <div style={styles.formActions}>
              <button type="button"
                onClick={() => { setShowForm(false); resetForm(); }}
                style={styles.cancelBtn}>
                Cancel
              </button>
              <button type="submit" disabled={saving} style={styles.submitBtn}>
                {saving ? "Saving..." : editId ? "Update Student" : "Add Student"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search & Filter */}
      <div style={styles.toolbar}>
        <input
          placeholder="🔍 Search by name or admission no..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchInput}
        />
        <select value={filter} onChange={(e) => setFilter(e.target.value)}
          style={styles.filterSelect}>
          <option value="">All Classes</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{c.name} - {c.section}</option>
          ))}
        </select>
        <span style={styles.resultCount}>
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div style={styles.tableCard}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              <th style={styles.th}>Student</th>
              <th style={styles.th}>Admission No</th>
              <th style={styles.th}>Class</th>
              <th style={styles.th}>Roll</th>
              <th style={styles.th}>Gender</th>
              <th style={styles.th}>DOB</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={styles.empty}>Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} style={styles.empty}>
                {search || filter
                  ? "No students match your search."
                  : "No students enrolled yet. Click + Add Student to begin."}
              </td></tr>
            ) : (
              filtered.map((s) => (
                <tr key={s.id} style={styles.tr}>
                  <td style={styles.td}>
                    <div style={styles.studentCell}>
                      <div style={styles.avatar}>
                        {(s.first_name || "?")[0]}{(s.last_name || "")[0]}
                      </div>
                      <div>
                        <div style={styles.studentName}>{s.full_name}</div>
                        <div style={styles.studentSub}>
                          Admitted: {s.admission_date}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={styles.td}>{s.admission_no}</td>
                  <td style={styles.td}>
                    <span style={styles.classBadge}>
                      {s.classroom_name
                        ? s.classroom_name.split(" (")[0]
                        : "—"}
                    </span>
                  </td>
                  <td style={styles.td}>{s.roll_number || "—"}</td>
                  <td style={styles.td}>
                    {s.gender === "M" ? "👦 Male"
                   : s.gender === "F" ? "👧 Female"
                   : "Other"}
                  </td>
                  <td style={styles.td}>{s.date_of_birth}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.statusBadge,
                      background: s.is_active ? "#dcfce7" : "#fee2e2",
                      color:      s.is_active ? "#16a34a" : "#dc2626",
                    }}>
                      {s.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actions}>
                      <button onClick={() => handleEdit(s)} style={styles.editBtn}>
                        ✏️ Edit
                      </button>
                      <button onClick={() => handleDelete(s.id)}
                        style={styles.deleteBtn}>
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
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
    padding: "10px 20px", background: "#2563eb",
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
  formTitle: {
    fontSize: "16px", fontWeight: "700",
    color: "#0f172a", marginBottom: "20px",
  },
  formRow: { display: "flex", gap: "14px", flexWrap: "wrap" },
  formGroup: {
    display: "flex", flexDirection: "column",
    gap: "6px", flex: 1, minWidth: "180px", marginBottom: "14px",
  },
  label: { fontSize: "13px", fontWeight: "600", color: "#374151" },
  input: {
    padding: "9px 12px", border: "1px solid #d1d5db",
    borderRadius: "8px", fontSize: "14px",
    width: "100%", fontFamily: "inherit",
  },
  formActions: {
    display: "flex", justifyContent: "flex-end",
    gap: "10px", marginTop: "8px",
  },
  cancelBtn: {
    padding: "9px 20px", background: "white",
    border: "1px solid #d1d5db", borderRadius: "8px",
    fontSize: "14px", cursor: "pointer", color: "#374151",
  },
  submitBtn: {
    padding: "9px 24px", background: "#2563eb",
    color: "white", border: "none", borderRadius: "8px",
    fontSize: "14px", fontWeight: "600", cursor: "pointer",
  },
  toolbar: {
    display: "flex", gap: "12px", marginBottom: "16px",
    alignItems: "center", flexWrap: "wrap",
  },
  searchInput: {
    flex: 1, minWidth: "220px", padding: "9px 14px",
    border: "1px solid #d1d5db", borderRadius: "8px",
    fontSize: "14px", background: "white",
  },
  filterSelect: {
    padding: "9px 12px", border: "1px solid #d1d5db",
    borderRadius: "8px", fontSize: "14px", background: "white",
  },
  resultCount: { fontSize: "13px", color: "#64748b", whiteSpace: "nowrap" },
  tableCard: {
    background: "white", borderRadius: "12px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden",
  },
  table:  { width: "100%", borderCollapse: "collapse" },
  thead:  { background: "#f8fafc" },
  th: {
    padding: "11px 14px", textAlign: "left",
    fontSize: "11px", fontWeight: "700", color: "#64748b",
    textTransform: "uppercase", letterSpacing: "0.5px",
  },
  tr: { borderBottom: "1px solid #f1f5f9" },
  td: { padding: "12px 14px", fontSize: "14px", color: "#374151" },
  studentCell: { display: "flex", alignItems: "center", gap: "10px" },
  avatar: {
    width: "34px", height: "34px", borderRadius: "50%",
    background: "#3b82f6", color: "white",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "12px", fontWeight: "700", flexShrink: 0,
  },
  studentName: { fontSize: "14px", fontWeight: "600", color: "#0f172a" },
  studentSub:  { fontSize: "11px", color: "#94a3b8", marginTop: "2px" },
  classBadge: {
    background: "#dbeafe", color: "#1d4ed8",
    padding: "3px 8px", borderRadius: "6px",
    fontSize: "12px", fontWeight: "600",
  },
  statusBadge: {
    padding: "3px 10px", borderRadius: "20px",
    fontSize: "12px", fontWeight: "600",
  },
  actions: { display: "flex", gap: "6px" },
  editBtn: {
    padding: "5px 10px", background: "#f1f5f9",
    border: "none", borderRadius: "6px",
    fontSize: "12px", cursor: "pointer", color: "#374151",
  },
  deleteBtn: {
    padding: "5px 10px", background: "#fee2e2",
    border: "none", borderRadius: "6px",
    fontSize: "12px", cursor: "pointer", color: "#dc2626",
  },
  empty: { textAlign: "center", padding: "40px", color: "#94a3b8" },
};


// import { useEffect, useState } from "react";
// import DashboardLayout from "../../components/layout/DashboardLayout";
// import { studentApi, classApi } from "../../api/authApi";
// import { useAuth } from "../../context/AuthContext";

// export default function StudentsPage() {
//   const { user } = useAuth(); 
//   const [students, setStudents] = useState([]);
//   const [classes,  setClasses]  = useState([]);
//   const [loading,  setLoading]  = useState(true);
//   const [showForm, setShowForm] = useState(false);
//   const [search,   setSearch]   = useState("");
//   const [filter,   setFilter]   = useState("");
//   const [message,  setMessage]  = useState("");
//   const [saving,   setSaving]   = useState(false);
//   const [editId,   setEditId]   = useState(null);

//   const [form, setForm] = useState({
//     first_name: "", last_name: "", admission_no: "",
//     date_of_birth: "", gender: "M", classroom: "",
//     roll_number: "", emergency_contact: "",
//     address: "", admission_date: "",
//   });

//   useEffect(() => {
//     Promise.all([studentApi.list(), classApi.list()])
//       .then(([s, c]) => {
//         setStudents(s.data.results || []);
//         const classList = c.data.results || [];
//         setClasses(classList);
//         if (classList.length > 0)
//           setForm((f) => ({ ...f, classroom: classList[0].id }));
//       })
//       .finally(() => setLoading(false));
//   }, []);

//   const handleChange = (e) => {
//     setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
//   };

//   const resetForm = () => {
//     setForm({
//       first_name: "", last_name: "", admission_no: "",
//       date_of_birth: "", gender: "M",
//       classroom: classes[0]?.id || "",
//       roll_number: "", emergency_contact: "",
//       address: "", admission_date: "",
//     });
//     setEditId(null);
//   };

//   const handleEdit = (student) => {
//     setForm({
//       first_name:        student.first_name,
//       last_name:         student.last_name,
//       admission_no:      student.admission_no,
//       date_of_birth:     student.date_of_birth,
//       gender:            student.gender,
//       classroom:         student.classroom,
//       roll_number:       student.roll_number || "",
//       emergency_contact: student.emergency_contact || "",
//       address:           student.address || "",
//       admission_date:    student.admission_date,
//     });
//     setEditId(student.id);
//     setShowForm(true);
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm("Delete this student?")) return;
//     try {
//       await studentApi.delete(id);
//       setStudents((prev) => prev.filter((s) => s.id !== id));
//       setMessage("✅ Student deleted.");
//     } catch {
//       setMessage("❌ Failed to delete student.");
//     }
//   };

//   // const handleSubmit = async (e) => {
//   //   e.preventDefault();
//   //   setSaving(true);
//   //   setMessage("");
//   //   try {
//   //     if (editId) {
//   //       const res = await studentApi.update(editId, form);
//   //       setStudents((prev) =>
//   //         prev.map((s) => (s.id === editId ? res.data : s))
//   //       );
//   //       setMessage("✅ Student updated successfully!");
//   //     } else {
//   //       const res = await studentApi.create(form);
//   //       setStudents((prev) => [res.data, ...prev]);
//   //       setMessage("✅ Student added successfully!");
//   //     }
//   //     setShowForm(false);
//   //     resetForm();
//   //   } catch (err) {
//   //     const errors = err.response?.data;
//   //     const msg = errors
//   //       ? Object.values(errors).flat().join(" ")
//   //       : "Failed to save student.";
//   //     setMessage(`❌ ${msg}`);
//   //   } finally {
//   //     setSaving(false);
//   //   }
//   // };

//   // const handleSubmit = async (e) => {
//   //   e.preventDefault();
//   //   setSaving(true);
//   //   setMessage("");
//   //   try {
//   //     // Build payload — school comes from logged-in user
//   //     const payload = {
//   //       ...form,
//   //       school: user?.school,   // ← ADD THIS LINE
//   //     };

//   //     if (editId) {
//   //       const res = await studentApi.update(editId, payload);
//   //       setStudents((prev) =>
//   //         prev.map((s) => (s.id === editId ? res.data : s))
//   //       );
//   //       setMessage("✅ Student updated successfully!");
//   //     } else {
//   //       const res = await studentApi.create(payload);
//   //       setStudents((prev) => [res.data, ...prev]);
//   //       setMessage("✅ Student added successfully!");
//   //     }
//   //     setShowForm(false);
//   //     resetForm();
//   //   } catch (err) {
//   //     const errors = err.response?.data;
//   //     if (errors) {
//   //       // Show exact field errors from Django
//   //       const msgs = Object.entries(errors)
//   //         .map(([field, errs]) => `${field}: ${errs.join(", ")}`)
//   //         .join(" | ");
//   //       setMessage(`❌ ${msgs}`);
//   //     } else {
//   //       setMessage("❌ Failed to save student.");
//   //     }
//   //   } finally {
//   //     setSaving(false);
//   //   }
//   // };

//   // Filter + Search
//   const filtered = students.filter((s) => {
//     const matchSearch =
//       s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
//       s.admission_no?.toLowerCase().includes(search.toLowerCase());
//     const matchFilter = filter ? s.classroom === filter : true;
//     return matchSearch && matchFilter;
//   });

//   return (
//     <DashboardLayout>
//       {/* Header */}
//       <div style={styles.header}>
//         <div>
//           <h1 style={styles.title}>Students</h1>
//           <p style={styles.subtitle}>
//             {students.length} total students enrolled
//           </p>
//         </div>
//         <button
//           onClick={() => { resetForm(); setShowForm(!showForm); }}
//           style={styles.addBtn}
//         >
//           {showForm ? "✕ Cancel" : "+ Add Student"}
//         </button>
//       </div>

//       {/* Message */}
//       {message && (
//         <div style={{
//           ...styles.message,
//           background: message.startsWith("✅") ? "#dcfce7" : "#fee2e2",
//           color:      message.startsWith("✅") ? "#16a34a" : "#dc2626",
//         }}>
//           {message}
//         </div>
//       )}

//       {/* Add / Edit Form */}
//       {showForm && (
//         <div style={styles.formCard}>
//           <h3 style={styles.formTitle}>
//             {editId ? "✏️ Edit Student" : "➕ Add New Student"}
//           </h3>
//           <form onSubmit={handleSubmit}>
//             <div style={styles.formRow}>
//               <Field label="First Name" name="first_name"
//                 value={form.first_name} onChange={handleChange} required />
//               <Field label="Last Name" name="last_name"
//                 value={form.last_name} onChange={handleChange} required />
//               <Field label="Admission No" name="admission_no"
//                 value={form.admission_no} onChange={handleChange} required />
//             </div>
//             <div style={styles.formRow}>
//               <Field label="Date of Birth" name="date_of_birth"
//                 type="date" value={form.date_of_birth}
//                 onChange={handleChange} required />
//               <div style={styles.formGroup}>
//                 <label style={styles.label}>Gender</label>
//                 <select name="gender" value={form.gender}
//                   onChange={handleChange} style={styles.input}>
//                   <option value="M">Male</option>
//                   <option value="F">Female</option>
//                   <option value="O">Other</option>
//                 </select>
//               </div>
//               <div style={styles.formGroup}>
//                 <label style={styles.label}>Class</label>
//                 <select name="classroom" value={form.classroom}
//                   onChange={handleChange} style={styles.input} required>
//                   {classes.map((c) => (
//                     <option key={c.id} value={c.id}>
//                       {c.name} - {c.section}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//             <div style={styles.formRow}>
//               <Field label="Roll Number" name="roll_number" type="number"
//                 value={form.roll_number} onChange={handleChange} />
//               <Field label="Admission Date" name="admission_date" type="date"
//                 value={form.admission_date} onChange={handleChange} required />
//               <Field label="Emergency Contact" name="emergency_contact"
//                 value={form.emergency_contact} onChange={handleChange} />
//             </div>
//             <div style={styles.formGroup}>
//               <label style={styles.label}>Address</label>
//               <textarea name="address" value={form.address}
//                 onChange={handleChange} style={{ ...styles.input, height: "70px" }}
//                 placeholder="Student address..." />
//             </div>
//             <div style={styles.formActions}>
//               <button type="button" onClick={() => { setShowForm(false); resetForm(); }}
//                 style={styles.cancelBtn}>
//                 Cancel
//               </button>
//               <button type="submit" disabled={saving} style={styles.submitBtn}>
//                 {saving ? "Saving..." : editId ? "Update Student" : "Add Student"}
//               </button>
//             </div>
//           </form>
//         </div>
//       )}

//       {/* Search & Filter */}
//       <div style={styles.toolbar}>
//         <input
//           placeholder="🔍 Search by name or admission no..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           style={styles.searchInput}
//         />
//         <select
//           value={filter}
//           onChange={(e) => setFilter(e.target.value)}
//           style={styles.filterSelect}
//         >
//           <option value="">All Classes</option>
//           {classes.map((c) => (
//             <option key={c.id} value={c.id}>{c.name} - {c.section}</option>
//           ))}
//         </select>
//         <span style={styles.resultCount}>
//           {filtered.length} result{filtered.length !== 1 ? "s" : ""}
//         </span>
//       </div>

//       {/* Students Table */}
//       <div style={styles.tableCard}>
//         <table style={styles.table}>
//           <thead>
//             <tr style={styles.thead}>
//               <th style={styles.th}>Student</th>
//               <th style={styles.th}>Admission No</th>
//               <th style={styles.th}>Class</th>
//               <th style={styles.th}>Roll</th>
//               <th style={styles.th}>Gender</th>
//               <th style={styles.th}>DOB</th>
//               <th style={styles.th}>Status</th>
//               <th style={styles.th}>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {loading ? (
//               <tr><td colSpan={8} style={styles.empty}>Loading...</td></tr>
//             ) : filtered.length === 0 ? (
//               <tr><td colSpan={8} style={styles.empty}>
//                 {search || filter ? "No students match your search." : "No students enrolled yet."}
//               </td></tr>
//             ) : (
//               filtered.map((s) => (
//                 <tr key={s.id} style={styles.tr}>
//                   <td style={styles.td}>
//                     <div style={styles.studentCell}>
//                       <div style={styles.avatar}>
//                         {s.first_name?.[0]}{s.last_name?.[0]}
//                       </div>
//                       <div>
//                         <div style={styles.studentName}>{s.full_name}</div>
//                         <div style={styles.studentSub}>
//                           Admitted: {s.admission_date}
//                         </div>
//                       </div>
//                     </div>
//                   </td>
//                   <td style={styles.td}>{s.admission_no}</td>
//                   <td style={styles.td}>
//                     <span style={styles.classBadge}>
//                       {s.classroom_name?.split(" (")[0] || "—"}
//                     </span>
//                   </td>
//                   <td style={styles.td}>{s.roll_number || "—"}</td>
//                   <td style={styles.td}>
//                     {s.gender === "M" ? "👦 Male"
//                    : s.gender === "F" ? "👧 Female"
//                    : "Other"}
//                   </td>
//                   <td style={styles.td}>{s.date_of_birth}</td>
//                   <td style={styles.td}>
//                     <span style={{
//                       ...styles.statusBadge,
//                       background: s.is_active ? "#dcfce7" : "#fee2e2",
//                       color:      s.is_active ? "#16a34a" : "#dc2626",
//                     }}>
//                       {s.is_active ? "Active" : "Inactive"}
//                     </span>
//                   </td>
//                   <td style={styles.td}>
//                     <div style={styles.actions}>
//                       <button onClick={() => handleEdit(s)} style={styles.editBtn}>
//                         ✏️ Edit
//                       </button>
//                       <button onClick={() => handleDelete(s.id)} style={styles.deleteBtn}>
//                         🗑️ Delete
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>
//     </DashboardLayout>
//   );
// }

// // Reusable field component
// function Field({ label, name, value, onChange, type = "text", required }) {
//   return (
//     <div style={styles.formGroup}>
//       <label style={styles.label}>{label}</label>
//       <input
//         type={type} name={name} value={value}
//         onChange={onChange} required={required}
//         style={styles.input}
//         placeholder={label}
//       />
//     </div>
//   );
// }

// const styles = {
//   header: {
//     display: "flex", justifyContent: "space-between",
//     alignItems: "flex-start", marginBottom: "20px",
//   },
//   title:    { fontSize: "26px", fontWeight: "700", color: "#0f172a", margin: 0 },
//   subtitle: { color: "#64748b", marginTop: "4px" },
//   addBtn: {
//     padding: "10px 20px", background: "#2563eb",
//     color: "white", border: "none", borderRadius: "8px",
//     fontSize: "14px", fontWeight: "600", cursor: "pointer",
//   },
//   message: {
//     padding: "12px 16px", borderRadius: "8px",
//     marginBottom: "16px", fontSize: "14px",
//   },
//   formCard: {
//     background: "white", borderRadius: "12px",
//     padding: "24px", marginBottom: "20px",
//     boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
//   },
//   formTitle: {
//     fontSize: "16px", fontWeight: "700",
//     color: "#0f172a", marginBottom: "20px",
//   },
//   formRow: { display: "flex", gap: "14px", flexWrap: "wrap" },
//   formGroup: {
//     display: "flex", flexDirection: "column",
//     gap: "6px", flex: 1, minWidth: "180px", marginBottom: "14px",
//   },
//   label: { fontSize: "13px", fontWeight: "600", color: "#374151" },
//   input: {
//     padding: "9px 12px", border: "1px solid #d1d5db",
//     borderRadius: "8px", fontSize: "14px",
//     width: "100%", fontFamily: "inherit", resize: "vertical",
//   },
//   formActions: {
//     display: "flex", justifyContent: "flex-end",
//     gap: "10px", marginTop: "8px",
//   },
//   cancelBtn: {
//     padding: "9px 20px", background: "white",
//     border: "1px solid #d1d5db", borderRadius: "8px",
//     fontSize: "14px", cursor: "pointer", color: "#374151",
//   },
//   submitBtn: {
//     padding: "9px 24px", background: "#2563eb",
//     color: "white", border: "none", borderRadius: "8px",
//     fontSize: "14px", fontWeight: "600", cursor: "pointer",
//   },
//   toolbar: {
//     display: "flex", gap: "12px", marginBottom: "16px",
//     alignItems: "center", flexWrap: "wrap",
//   },
//   searchInput: {
//     flex: 1, minWidth: "220px", padding: "9px 14px",
//     border: "1px solid #d1d5db", borderRadius: "8px",
//     fontSize: "14px", background: "white",
//   },
//   filterSelect: {
//     padding: "9px 12px", border: "1px solid #d1d5db",
//     borderRadius: "8px", fontSize: "14px", background: "white",
//   },
//   resultCount: { fontSize: "13px", color: "#64748b", whiteSpace: "nowrap" },
//   tableCard: {
//     background: "white", borderRadius: "12px",
//     boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden",
//   },
//   table: { width: "100%", borderCollapse: "collapse" },
//   thead: { background: "#f8fafc" },
//   th: {
//     padding: "11px 14px", textAlign: "left",
//     fontSize: "11px", fontWeight: "700", color: "#64748b",
//     textTransform: "uppercase", letterSpacing: "0.5px",
//   },
//   tr: { borderBottom: "1px solid #f1f5f9" },
//   td: { padding: "12px 14px", fontSize: "14px", color: "#374151" },
//   studentCell: { display: "flex", alignItems: "center", gap: "10px" },
//   avatar: {
//     width: "34px", height: "34px", borderRadius: "50%",
//     background: "#3b82f6", color: "white",
//     display: "flex", alignItems: "center", justifyContent: "center",
//     fontSize: "12px", fontWeight: "700", flexShrink: 0,
//   },
//   studentName: { fontSize: "14px", fontWeight: "600", color: "#0f172a" },
//   studentSub:  { fontSize: "11px", color: "#94a3b8", marginTop: "2px" },
//   classBadge: {
//     background: "#dbeafe", color: "#1d4ed8",
//     padding: "3px 8px", borderRadius: "6px",
//     fontSize: "12px", fontWeight: "600",
//   },
//   statusBadge: {
//     padding: "3px 10px", borderRadius: "20px",
//     fontSize: "12px", fontWeight: "600",
//   },
//   actions: { display: "flex", gap: "6px" },
//   editBtn: {
//     padding: "5px 10px", background: "#f1f5f9",
//     border: "none", borderRadius: "6px",
//     fontSize: "12px", cursor: "pointer", color: "#374151",
//   },
//   deleteBtn: {
//     padding: "5px 10px", background: "#fee2e2",
//     border: "none", borderRadius: "6px",
//     fontSize: "12px", cursor: "pointer", color: "#dc2626",
//   },
//   empty: { textAlign: "center", padding: "40px", color: "#94a3b8" },
// };