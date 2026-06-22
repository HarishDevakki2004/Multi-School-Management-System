// src/pages/auth/LoginPage.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ROLE_HOME = {
  super_admin:  "/super-admin/dashboard",
  school_admin: "/school-admin/dashboard",
  teacher:      "/teacher/dashboard",
  parent:       "/parent/dashboard",
};

export default function LoginPage() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(ROLE_HOME[user.role] || "/login");
    } catch (err) {
      setError(
        err.response?.data?.non_field_errors?.[0] ||
        err.response?.data?.detail ||
        "Login failed. Check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🏫 School System</h1>
        <p style={styles.subtitle}>Sign in to your account</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@system.com"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={styles.input}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight:       "100vh",
    display:         "flex",
    alignItems:      "center",
    justifyContent:  "center",
    background:      "#f0f4f8",
    fontFamily:      "sans-serif",
  },
  card: {
    background:    "white",
    padding:       "40px",
    borderRadius:  "12px",
    boxShadow:     "0 4px 20px rgba(0,0,0,0.1)",
    width:         "100%",
    maxWidth:      "400px",
  },
  title: {
    textAlign:    "center",
    fontSize:     "26px",
    margin:       "0 0 8px",
    color:        "#1e293b",
  },
  subtitle: {
    textAlign:    "center",
    color:        "#64748b",
    marginBottom: "28px",
    fontSize:     "15px",
  },
  error: {
    background:   "#fee2e2",
    color:        "#dc2626",
    padding:      "10px 14px",
    borderRadius: "8px",
    marginBottom: "16px",
    fontSize:     "14px",
  },
  field: {
    marginBottom: "18px",
  },
  label: {
    display:      "block",
    marginBottom: "6px",
    fontWeight:   "600",
    fontSize:     "14px",
    color:        "#374151",
  },
  input: {
    width:        "100%",
    padding:      "10px 14px",
    border:       "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize:     "15px",
    boxSizing:    "border-box",
    outline:      "none",
  },
  button: {
    width:        "100%",
    padding:      "12px",
    background:   "#2563eb",
    color:        "white",
    border:       "none",
    borderRadius: "8px",
    fontSize:     "16px",
    fontWeight:   "600",
    cursor:       "pointer",
    marginTop:    "8px",
  },
};