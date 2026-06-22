// src/pages/teacher/MarksPage.jsx

import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { examApi, classApi } from "../../api/authApi";
import api from "../../api/axiosInstance";

export default function MarksPage() {
  const [exams,     setExams]     = useState([]);
  const [classes,   setClasses]   = useState([]);
  const [students,  setStudents]  = useState([]);
  const [marks,     setMarks]     = useState({});
  const [absent,    setAbsent]    = useState({});
  const [showForm,  setShowForm]  = useState(false);
  const [selectedExam, setSelectedExam] = useState("");
  const [saving,    setSaving]    = useState(false);
  const [message,   setMessage]   = useState("");
  const [loading,   setLoading]   = useState(true);

  // New exam form state
  const [examForm, setExamForm] = useState({
    classroom: "", name: "", exam_type: "unit_test",
    subject: "", date: "", total_marks: 100,
    passing_marks: 35, academic_year: "2024-25",
  });

  useEffect(() => {
    Promise.all([examApi.list(), classApi.list()])
      .then(([e, c]) => {
        setExams(e.data.results || []);
        const classList = c.data.results || [];
        setClasses(classList);
        if (classList.length > 0)
          setExamForm((f) => ({ ...f, classroom: classList[0].id }));
      })
      .finally(() => setLoading(false));
  }, []);

  // Load students when exam selected
  useEffect(() => {
    if (!selectedExam) return;
    const exam = exams.find((e) => e.id === selectedExam);
    if (!exam) return;
    api.get("/students/", { params: { classroom: exam.classroom } })
      .then((r) => {
        const list = r.data.results || [];
        setStudents(list);
        const m = {}, a = {};
        list.forEach((s) => { m[s.id] = ""; a[s.id] = false; });
        setMarks(m);
        setAbsent(a);
      });
  }, [selectedExam]);

  const handleCreateExam = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const school = classes.find((c) => c.id === examForm.classroom)?.school;
      const res = await examApi.create({ ...examForm, school });
      setExams((prev) => [res.data, ...prev]);
      setShowForm(false);
      setMessage("✅ Exam created! Now select it below to enter marks.");
    } catch {
      setMessage("❌ Failed to create exam.");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitMarks = async () => {
    if (!selectedExam || students.length === 0) return;
    setSaving(true);
    setMessage("");
    try {
      const results = students.map((s) => ({
        student:        s.id,
        marks_obtained: absent[s.id] ? 0 : parseFloat(marks[s.id] || 0),
        is_absent:      absent[s.id],
      }));
      await examApi.bulkUpload({ exam: selectedExam, results });
      setMessage(`✅ Marks saved for ${students.length} students!`);
    } catch {
      setMessage("❌ Failed to save marks. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const selectedExamData = exams.find((e) => e.id === selectedExam);

  return (
    <DashboardLayout>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Upload Marks</h1>
          <p style={styles.subtitle}>Create exams and enter student results</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>
          {showForm ? "✕ Cancel" : "+ Create Exam"}
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

      {/* Create Exam Form */}
      {showForm && (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Create New Exam</h3>
          <form onSubmit={handleCreateExam}>
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Class</label>
                <select
                  value={examForm.classroom}
                  onChange={(e) => setExamForm((f) => ({ ...f, classroom: e.target.value }))}
                  style={styles.input} required
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} - {c.section}</option>
                  ))}
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Exam Type</label>
                <select
                  value={examForm.exam_type}
                  onChange={(e) => setExamForm((f) => ({ ...f, exam_type: e.target.value }))}
                  style={styles.input}
                >
                  <option value="unit_test">Unit Test</option>
                  <option value="mid_term">Mid Term</option>
                  <option value="final">Final Exam</option>
                  <option value="practical">Practical</option>
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Subject</label>
                <input
                  value={examForm.subject}
                  onChange={(e) => setExamForm((f) => ({ ...f, subject: e.target.value }))}
                  style={styles.input} placeholder="e.g. Mathematics" required
                />
              </div>
            </div>
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Exam Name</label>
                <input
                  value={examForm.name}
                  onChange={(e) => setExamForm((f) => ({ ...f, name: e.target.value }))}
                  style={styles.input} placeholder="e.g. Unit Test 1" required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Date</label>
                <input type="date" value={examForm.date}
                  onChange={(e) => setExamForm((f) => ({ ...f, date: e.target.value }))}
                  style={styles.input} required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Total Marks</label>
                <input type="number" value={examForm.total_marks}
                  onChange={(e) => setExamForm((f) => ({ ...f, total_marks: e.target.value }))}
                  style={styles.input} required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Passing Marks</label>
                <input type="number" value={examForm.passing_marks}
                  onChange={(e) => setExamForm((f) => ({ ...f, passing_marks: e.target.value }))}
                  style={styles.input} required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Academic Year</label>
                <input value={examForm.academic_year}
                  onChange={(e) => setExamForm((f) => ({ ...f, academic_year: e.target.value }))}
                  style={styles.input} placeholder="2024-25" required
                />
              </div>
            </div>
            <button type="submit" disabled={saving} style={styles.submitBtn}>
              {saving ? "Creating..." : "Create Exam"}
            </button>
          </form>
        </div>
      )}

      {/* Select Exam to Enter Marks */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Enter Marks</h3>
        <div style={styles.formGroup}>
          <label style={styles.label}>Select Exam</label>
          <select
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            style={{ ...styles.input, maxWidth: "400px" }}
          >
            <option value="">-- Select an exam --</option>
            {exams.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name} | {e.subject} | {e.date}
              </option>
            ))}
          </select>
        </div>

        {selectedExamData && (
          <div style={styles.examInfo}>
            <span style={styles.infoBadge}>📝 {selectedExamData.exam_type.replace("_", " ")}</span>
            <span style={styles.infoBadge}>📚 {selectedExamData.subject}</span>
            <span style={styles.infoBadge}>🎯 Total: {selectedExamData.total_marks}</span>
            <span style={styles.infoBadge}>✅ Pass: {selectedExamData.passing_marks}</span>
          </div>
        )}
      </div>

      {/* Marks Entry Table */}
      {students.length > 0 && (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>
            Student Marks — {students.length} students
          </h3>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>#</th>
                <th style={styles.th}>Student Name</th>
                <th style={styles.th}>
                  Marks (out of {selectedExamData?.total_marks})
                </th>
                <th style={styles.th}>Absent</th>
                <th style={styles.th}>Grade (Auto)</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => {
                const pct = selectedExamData?.total_marks
                  ? (parseFloat(marks[s.id] || 0) / selectedExamData.total_marks) * 100
                  : 0;
                const grade = absent[s.id] ? "AB" : getGrade(pct);
                return (
                  <tr key={s.id} style={styles.tr}>
                    <td style={styles.td}>{i + 1}</td>
                    <td style={{ ...styles.td, fontWeight: "600" }}>
                      {s.full_name}
                    </td>
                    <td style={styles.td}>
                      <input
                        type="number"
                        value={marks[s.id]}
                        disabled={absent[s.id]}
                        min={0}
                        max={selectedExamData?.total_marks}
                        onChange={(e) =>
                          setMarks((m) => ({ ...m, [s.id]: e.target.value }))
                        }
                        style={{
                          ...styles.marksInput,
                          opacity: absent[s.id] ? 0.4 : 1,
                        }}
                        placeholder="0"
                      />
                    </td>
                    <td style={styles.td}>
                      <input
                        type="checkbox"
                        checked={absent[s.id]}
                        onChange={(e) =>
                          setAbsent((a) => ({ ...a, [s.id]: e.target.checked }))
                        }
                        style={{ width: "18px", height: "18px", cursor: "pointer" }}
                      />
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.gradeBadge,
                        background: GRADE_COLORS[grade]?.bg || "#f1f5f9",
                        color:      GRADE_COLORS[grade]?.text || "#64748b",
                      }}>
                        {grade}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div style={styles.footer}>
            <button
              onClick={handleSubmitMarks}
              disabled={saving}
              style={{ ...styles.submitBtn, opacity: saving ? 0.7 : 1 }}
            >
              {saving ? "Saving..." : `💾 Save Marks (${students.length} students)`}
            </button>
          </div>
        </div>
      )}

      {/* Existing Exams List */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>All Exams ({exams.length})</h3>
        {loading ? (
          <p style={styles.empty}>Loading...</p>
        ) : exams.length === 0 ? (
          <p style={styles.empty}>No exams created yet.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>Exam Name</th>
                <th style={styles.th}>Subject</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Total Marks</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((e) => (
                <tr key={e.id} style={styles.tr}>
                  <td style={{ ...styles.td, fontWeight: "600" }}>{e.name}</td>
                  <td style={styles.td}>{e.subject}</td>
                  <td style={styles.td}>
                    <span style={styles.typeBadge}>
                      {e.exam_type.replace("_", " ")}
                    </span>
                  </td>
                  <td style={styles.td}>{e.date}</td>
                  <td style={styles.td}>{e.total_marks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
}

function getGrade(pct) {
  if (pct >= 90) return "A+";
  if (pct >= 80) return "A";
  if (pct >= 70) return "B+";
  if (pct >= 60) return "B";
  if (pct >= 50) return "C";
  if (pct >= 40) return "D";
  return "F";
}

const GRADE_COLORS = {
  "A+": { bg: "#dcfce7", text: "#16a34a" },
  "A":  { bg: "#dcfce7", text: "#16a34a" },
  "B+": { bg: "#dbeafe", text: "#1d4ed8" },
  "B":  { bg: "#dbeafe", text: "#1d4ed8" },
  "C":  { bg: "#fef9c3", text: "#ca8a04" },
  "D":  { bg: "#fed7aa", text: "#c2410c" },
  "F":  { bg: "#fee2e2", text: "#dc2626" },
  "AB": { bg: "#f1f5f9", text: "#94a3b8" },
};

const styles = {
  header: {
    display: "flex", justifyContent: "space-between",
    alignItems: "flex-start", marginBottom: "24px",
  },
  title:    { fontSize: "26px", fontWeight: "700", color: "#0f172a", margin: 0 },
  subtitle: { color: "#64748b", marginTop: "4px" },
  addBtn: {
    padding: "10px 20px", background: "#f59e0b",
    color: "white", border: "none", borderRadius: "8px",
    fontSize: "14px", fontWeight: "600", cursor: "pointer",
  },
  message: {
    padding: "12px 16px", borderRadius: "8px",
    marginBottom: "16px", fontSize: "14px",
  },
  card: {
    background: "white", borderRadius: "12px",
    padding: "24px", marginBottom: "20px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
  },
  cardTitle: {
    fontSize: "16px", fontWeight: "700",
    color: "#0f172a", marginBottom: "16px",
  },
  formRow:   { display: "flex", gap: "16px", flexWrap: "wrap" },
  formGroup: {
    display: "flex", flexDirection: "column",
    gap: "6px", marginBottom: "14px", flex: 1, minWidth: "160px",
  },
  label: { fontSize: "13px", fontWeight: "600", color: "#374151" },
  input: {
    padding: "9px 12px", border: "1px solid #d1d5db",
    borderRadius: "8px", fontSize: "14px", width: "100%",
    fontFamily: "inherit",
  },
  submitBtn: {
    padding: "10px 24px", background: "#f59e0b",
    color: "white", border: "none", borderRadius: "8px",
    fontSize: "14px", fontWeight: "600", cursor: "pointer",
  },
  examInfo: { display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "12px" },
  infoBadge: {
    background: "#f1f5f9", color: "#374151",
    padding: "4px 12px", borderRadius: "20px", fontSize: "13px",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  thead: { background: "#f8fafc" },
  th: {
    padding: "10px 14px", textAlign: "left",
    fontSize: "12px", fontWeight: "600",
    color: "#64748b", textTransform: "uppercase",
  },
  tr: { borderBottom: "1px solid #f1f5f9" },
  td: { padding: "12px 14px", fontSize: "14px", color: "#374151" },
  marksInput: {
    width: "80px", padding: "6px 10px",
    border: "1px solid #d1d5db", borderRadius: "6px",
    fontSize: "14px", textAlign: "center",
  },
  gradeBadge: {
    padding: "3px 10px", borderRadius: "20px",
    fontSize: "12px", fontWeight: "700",
  },
  typeBadge: {
    background: "#fef9c3", color: "#ca8a04",
    padding: "3px 10px", borderRadius: "20px",
    fontSize: "12px", fontWeight: "600",
    textTransform: "capitalize",
  },
  footer: { marginTop: "20px", display: "flex", justifyContent: "flex-end" },
  empty: { textAlign: "center", padding: "30px", color: "#94a3b8" },
};