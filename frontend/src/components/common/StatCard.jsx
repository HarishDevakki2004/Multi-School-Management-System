// src/components/common/StatCard.jsx

export default function StatCard({ icon, label, value, color = "#3b82f6", sub }) {
  return (
    <div style={{ ...styles.card, borderTop: `4px solid ${color}` }}>
      <div style={styles.top}>
        <div style={{ ...styles.iconBox, background: color + "20", color }}>
          {icon}
        </div>
        <div style={styles.valueBox}>
          <div style={styles.value}>{value ?? "—"}</div>
          <div style={styles.label}>{label}</div>
        </div>
      </div>
      {sub && <div style={styles.sub}>{sub}</div>}
    </div>
  );
}

const styles = {
  card: {
    background:   "white",
    borderRadius: "12px",
    padding:      "20px",
    boxShadow:    "0 1px 4px rgba(0,0,0,0.07)",
    flex:         1,
    minWidth:     "180px",
  },
  top: {
    display:    "flex",
    alignItems: "center",
    gap:        "14px",
  },
  iconBox: {
    width:          "44px",
    height:         "44px",
    borderRadius:   "10px",
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    fontSize:       "20px",
    flexShrink:     0,
  },
  valueBox: { flex: 1 },
  value: { fontSize: "26px", fontWeight: "700", color: "#0f172a" },
  label: { fontSize: "13px", color: "#64748b", marginTop: "2px" },
  sub:   { fontSize: "12px", color: "#94a3b8", marginTop: "12px" },
};