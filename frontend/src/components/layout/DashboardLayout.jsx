// src/components/layout/DashboardLayout.jsx

import Sidebar from "./Sidebar";

export default function DashboardLayout({ children }) {
  return (
    <div style={styles.wrapper}>
      <Sidebar />
      <main style={styles.main}>
        {children}
      </main>
    </div>
  );
}

const styles = {
  wrapper: {
    display:   "flex",
    minHeight: "100vh",
    background: "#f8fafc",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  main: {
    flex:     1,
    padding:  "32px",
    overflow: "auto",
  },
};