// src/pages/schooladmin/FeesPage.jsx

import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { feeApi, studentApi, classApi } from "../../api/authApi";
import { useAuth } from "../../context/AuthContext";


export default function FeesPage() {
  const { user }                   = useAuth();
  const [payments,  setPayments]  = useState([]);
  const [categories, setCategories] = useState([]);
  const [structures, setStructures] = useState([]);
  const [students,  setStudents]  = useState([]);
  const [classes,   setClasses]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [tab,       setTab]       = useState("payments");
  const [showForm,  setShowForm]  = useState(false);
  const [message,   setMessage]   = useState("");
  const [saving,    setSaving]    = useState(false);
  const [search,    setSearch]    = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [payForm, setPayForm] = useState({
    student: "", fee_structure: "", due_date: "",
    amount_due: "", amount_paid: "", payment_method: "cash",
  });

  const [catForm, setCatForm] = useState({ name: "", description: "" });
  const [strForm, setStrForm] = useState({
    category: "", classroom: "", amount: "",
    frequency: "monthly", academic_year: "2024-25", due_day: 10,
  });

  useEffect(() => {
    Promise.all([
      feeApi.payments(),
      feeApi.categories(),
      feeApi.structures(),
      studentApi.list(),
      classApi.list(),
    ])
      .then(([p, c, s, st, cl]) => {
        setPayments(p.data.results   || []);
        setCategories(c.data.results || []);
        setStructures(s.data.results || []);
        setStudents(st.data.results  || []);
        setClasses(cl.data.results   || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const handlePaySubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const res = await feeApi.createPayment(payForm);
      setPayments((prev) => [res.data, ...prev]);
      setMessage("✅ Fee payment recorded!");
      setShowForm(false);
      setPayForm({
        student: "", fee_structure: "", due_date: "",
        amount_due: "", amount_paid: "", payment_method: "cash",
      });
    } catch (err) {
      const errors = err.response?.data;
      const msg = errors ? Object.values(errors).flat().join(" ") : "Failed to save.";
      setMessage(`❌ ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCatSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const res = await feeApi.createCategory({
        name:        catForm.name,
        description: catForm.description,
        // ✅ No school here — backend sets it automatically
      });
      setCategories((prev) => [res.data, ...prev]);
      setMessage("✅ Category created!");
      setCatForm({ name: "", description: "" });
    } catch (err) {
      const errors = err.response?.data;
      if (errors) {
        const msgs = Object.entries(errors)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
          .join(" | ");
        setMessage(`❌ ${msgs}`);
      } else {
        setMessage("❌ Failed to create category.");
      }
    } finally {
      setSaving(false);
    }
  };

  // Summary stats
  const totalDue   = payments.reduce((s, p) => s + parseFloat(p.amount_due  || 0), 0);
  const totalPaid  = payments.reduce((s, p) => s + parseFloat(p.amount_paid || 0), 0);
  const totalPending = payments.filter((p) => p.status === "pending").length;
  const totalOverdue = payments.filter((p) => p.status === "overdue").length;

  // Filter payments
  const filtered = payments.filter((p) => {
    const matchSearch = p.student_name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter ? p.status === statusFilter : true;
    return matchSearch && matchStatus;
  });

  return (
    <DashboardLayout>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Fee Management</h1>
          <p style={styles.subtitle}>Track payments, categories and structures</p>
        </div>
        {tab === "payments" && (
          <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>
            {showForm ? "✕ Cancel" : "+ Record Payment"}
          </button>
        )}
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

      {/* Summary Cards */}
      <div style={styles.summaryRow}>
        <SummaryCard label="Total Due"     value={`₹${totalDue.toLocaleString()}`}  color="#3b82f6" />
        <SummaryCard label="Total Collected" value={`₹${totalPaid.toLocaleString()}`} color="#10b981" />
        <SummaryCard label="Balance"       value={`₹${(totalDue - totalPaid).toLocaleString()}`} color="#f59e0b" />
        <SummaryCard label="Pending"       value={totalPending} color="#ef4444" />
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {["payments", "categories", "structures"].map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            ...styles.tab,
            ...(tab === t ? styles.tabActive : {}),
          }}>
            {t === "payments"   ? "💳 Payments"
           : t === "categories" ? "📂 Categories"
           : "🏗️ Structures"}
          </button>
        ))}
      </div>

      {/* ── PAYMENTS TAB ── */}
      {tab === "payments" && (
        <>
          {/* Record Payment Form */}
          {showForm && (
            <div style={styles.formCard}>
              <h3 style={styles.formTitle}>💳 Record Fee Payment</h3>
              <form onSubmit={handlePaySubmit}>
                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Student</label>
                    <select value={payForm.student}
                      onChange={(e) => setPayForm((f) => ({ ...f, student: e.target.value }))}
                      style={styles.input} required>
                      <option value="">Select student...</option>
                      {students.map((s) => (
                        <option key={s.id} value={s.id}>{s.full_name} ({s.admission_no})</option>
                      ))}
                    </select>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Fee Structure</label>
                    <select value={payForm.fee_structure}
                      onChange={(e) => setPayForm((f) => ({ ...f, fee_structure: e.target.value }))}
                      style={styles.input} required>
                      <option value="">Select structure...</option>
                      {structures.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.category_name} — ₹{s.amount} ({s.frequency})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Due Date</label>
                    <input type="date" value={payForm.due_date}
                      onChange={(e) => setPayForm((f) => ({ ...f, due_date: e.target.value }))}
                      style={styles.input} required />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Amount Due (₹)</label>
                    <input type="number" value={payForm.amount_due}
                      onChange={(e) => setPayForm((f) => ({ ...f, amount_due: e.target.value }))}
                      style={styles.input} placeholder="0" required />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Amount Paid (₹)</label>
                    <input type="number" value={payForm.amount_paid}
                      onChange={(e) => setPayForm((f) => ({ ...f, amount_paid: e.target.value }))}
                      style={styles.input} placeholder="0" />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Payment Method</label>
                    <select value={payForm.payment_method}
                      onChange={(e) => setPayForm((f) => ({ ...f, payment_method: e.target.value }))}
                      style={styles.input}>
                      <option value="cash">Cash</option>
                      <option value="online">Online</option>
                      <option value="upi">UPI</option>
                      <option value="cheque">Cheque</option>
                    </select>
                  </div>
                </div>
                <div style={styles.formActions}>
                  <button type="button" onClick={() => setShowForm(false)} style={styles.cancelBtn}>
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} style={styles.submitBtn}>
                    {saving ? "Saving..." : "Record Payment"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Filters */}
          <div style={styles.toolbar}>
            <input
              placeholder="🔍 Search by student name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
            />
            <select value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={styles.filterSelect}>
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="partial">Partial</option>
              <option value="overdue">Overdue</option>
            </select>
            <span style={styles.resultCount}>{filtered.length} records</span>
          </div>

          {/* Payments Table */}
          <div style={styles.tableCard}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thead}>
                  <th style={styles.th}>Student</th>
                  <th style={styles.th}>Category</th>
                  <th style={styles.th}>Due Date</th>
                  <th style={styles.th}>Amount Due</th>
                  <th style={styles.th}>Amount Paid</th>
                  <th style={styles.th}>Balance</th>
                  <th style={styles.th}>Method</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} style={styles.empty}>Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={8} style={styles.empty}>No payment records found.</td></tr>
                ) : (
                  filtered.map((p) => (
                    <tr key={p.id} style={styles.tr}>
                      <td style={{ ...styles.td, fontWeight: "600" }}>{p.student_name}</td>
                      <td style={styles.td}>{p.category_name || "—"}</td>
                      <td style={styles.td}>{p.due_date}</td>
                      <td style={styles.td}>₹{parseFloat(p.amount_due).toLocaleString()}</td>
                      <td style={styles.td}>₹{parseFloat(p.amount_paid).toLocaleString()}</td>
                      <td style={{ ...styles.td, color: p.balance > 0 ? "#ef4444" : "#10b981", fontWeight: "600" }}>
                        ₹{parseFloat(p.balance).toLocaleString()}
                      </td>
                      <td style={styles.td}>
                        <span style={styles.methodBadge}>{p.payment_method || "—"}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.statusBadge,
                          background: STATUS_COLORS[p.status]?.bg || "#f1f5f9",
                          color:      STATUS_COLORS[p.status]?.text || "#64748b",
                        }}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── CATEGORIES TAB ── */}
      {tab === "categories" && (
        <>
          <div style={styles.formCard}>
            <h3 style={styles.formTitle}>➕ Add Fee Category</h3>
            <form onSubmit={handleCatSubmit}>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Category Name</label>
                  <input value={catForm.name}
                    onChange={(e) => setCatForm((f) => ({ ...f, name: e.target.value }))}
                    style={styles.input} placeholder="e.g. Tuition, Transport, Library"
                    required />
                </div>
                <div style={{ ...styles.formGroup, flex: 2 }}>
                  <label style={styles.label}>Description</label>
                  <input value={catForm.description}
                    onChange={(e) => setCatForm((f) => ({ ...f, description: e.target.value }))}
                    style={styles.input} placeholder="Optional description" />
                </div>
              </div>
              <button type="submit" disabled={saving} style={styles.submitBtn}>
                {saving ? "Creating..." : "Create Category"}
              </button>
            </form>
          </div>
          <div style={styles.grid}>
            {categories.length === 0 ? (
              <p style={styles.empty}>No fee categories yet.</p>
            ) : (
              categories.map((cat) => (
                <div key={cat.id} style={styles.catCard}>
                  <div style={styles.catIcon}>📂</div>
                  <div style={styles.catName}>{cat.name}</div>
                  <div style={styles.catDesc}>{cat.description || "No description"}</div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* ── STRUCTURES TAB ── */}
      {tab === "structures" && (
        <>
          <div style={styles.tableCard}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thead}>
                  <th style={styles.th}>Category</th>
                  <th style={styles.th}>Class</th>
                  <th style={styles.th}>Amount</th>
                  <th style={styles.th}>Frequency</th>
                  <th style={styles.th}>Academic Year</th>
                  <th style={styles.th}>Due Day</th>
                </tr>
              </thead>
              <tbody>
                {structures.length === 0 ? (
                  <tr><td colSpan={6} style={styles.empty}>
                    No fee structures yet. Create categories first, then add structures via API.
                  </td></tr>
                ) : (
                  structures.map((s) => (
                    <tr key={s.id} style={styles.tr}>
                      <td style={{ ...styles.td, fontWeight: "600" }}>{s.category_name}</td>
                      <td style={styles.td}>{s.classroom_name || "All Classes"}</td>
                      <td style={{ ...styles.td, fontWeight: "600", color: "#10b981" }}>
                        ₹{parseFloat(s.amount).toLocaleString()}
                      </td>
                      <td style={styles.td}>
                        <span style={styles.freqBadge}>{s.frequency}</span>
                      </td>
                      <td style={styles.td}>{s.academic_year}</td>
                      <td style={styles.td}>{s.due_day}th of month</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}

function SummaryCard({ label, value, color }) {
  return (
    <div style={{ ...styles.sumCard, borderTop: `4px solid ${color}` }}>
      <div style={{ ...styles.sumValue, color }}>{value}</div>
      <div style={styles.sumLabel}>{label}</div>
    </div>
  );
}

const STATUS_COLORS = {
  paid:    { bg: "#dcfce7", text: "#16a34a" },
  pending: { bg: "#fef9c3", text: "#ca8a04" },
  partial: { bg: "#dbeafe", text: "#1d4ed8" },
  overdue: { bg: "#fee2e2", text: "#dc2626" },
};

const styles = {
  header: {
    display: "flex", justifyContent: "space-between",
    alignItems: "flex-start", marginBottom: "20px",
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
  summaryRow: {
    display: "flex", gap: "14px",
    marginBottom: "20px", flexWrap: "wrap",
  },
  sumCard: {
    flex: 1, minWidth: "140px", background: "white",
    borderRadius: "12px", padding: "18px 20px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
  },
  sumValue: { fontSize: "24px", fontWeight: "700" },
  sumLabel: { fontSize: "13px", color: "#64748b", marginTop: "4px" },
  tabs: {
    display: "flex", gap: "8px",
    marginBottom: "20px", borderBottom: "2px solid #f1f5f9",
    paddingBottom: "0",
  },
  tab: {
    padding: "10px 18px", background: "transparent",
    border: "none", borderBottom: "2px solid transparent",
    fontSize: "14px", fontWeight: "600", cursor: "pointer",
    color: "#64748b", marginBottom: "-2px",
  },
  tabActive: { color: "#f59e0b", borderBottomColor: "#f59e0b" },
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
    padding: "9px 24px", background: "#f59e0b",
    color: "white", border: "none", borderRadius: "8px",
    fontSize: "14px", fontWeight: "600", cursor: "pointer",
  },
  toolbar: {
    display: "flex", gap: "12px",
    marginBottom: "16px", alignItems: "center", flexWrap: "wrap",
  },
  searchInput: {
    flex: 1, minWidth: "200px", padding: "9px 14px",
    border: "1px solid #d1d5db", borderRadius: "8px",
    fontSize: "14px", background: "white",
  },
  filterSelect: {
    padding: "9px 12px", border: "1px solid #d1d5db",
    borderRadius: "8px", fontSize: "14px", background: "white",
  },
  resultCount:  { fontSize: "13px", color: "#64748b", whiteSpace: "nowrap" },
  tableCard: {
    background: "white", borderRadius: "12px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  thead: { background: "#f8fafc" },
  th: {
    padding: "11px 14px", textAlign: "left",
    fontSize: "11px", fontWeight: "700", color: "#64748b",
    textTransform: "uppercase", letterSpacing: "0.5px",
  },
  tr:  { borderBottom: "1px solid #f1f5f9" },
  td:  { padding: "12px 14px", fontSize: "14px", color: "#374151" },
  statusBadge: {
    padding: "3px 10px", borderRadius: "20px",
    fontSize: "12px", fontWeight: "600",
  },
  methodBadge: {
    background: "#f1f5f9", color: "#374151",
    padding: "3px 8px", borderRadius: "6px", fontSize: "12px",
  },
  freqBadge: {
    background: "#fef9c3", color: "#ca8a04",
    padding: "3px 8px", borderRadius: "6px",
    fontSize: "12px", fontWeight: "600", textTransform: "capitalize",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "14px",
  },
  catCard: {
    background: "white", borderRadius: "12px",
    padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
    textAlign: "center",
  },
  catIcon: { fontSize: "32px", marginBottom: "10px" },
  catName: { fontSize: "15px", fontWeight: "700", color: "#0f172a" },
  catDesc: { fontSize: "13px", color: "#94a3b8", marginTop: "4px" },
  empty:   { textAlign: "center", padding: "40px", color: "#94a3b8" },
};