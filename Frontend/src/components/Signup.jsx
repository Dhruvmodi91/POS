import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    mobileNo: "",
    address: "",
    role: "customer"
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_URL =  "https://pos-co0q.onrender.com/api";

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Full name is required");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!formData.password.trim()) {
      setError("Password is required");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    if (!formData.mobileNo.trim()) {
      setError("Mobile number is required");
      return false;
    }
    if (!/^\d{10}$/.test(formData.mobileNo)) {
      setError("Please enter a valid 10-digit mobile number");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/auth/register`, formData);

      if (response.data.success) {
        // Store token and user data
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        // Set axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

        // Redirect based on role
        switch (response.data.user.role) {
          case "admin":
            navigate("/admin");
            break;
          case "waiter":
            navigate("/waiter");
            break;
          case "kitchen":
            navigate("/kitchen");
            break;
          case "counter":
            navigate("/counter");
            break;
          case "customer":
            navigate("/customer/dashboard");
            break;
          default:
            navigate("/dashboard");
        }
      } else {
        setError(response.data.error || "Signup failed");
      }
    } catch (err) {
      console.error(" Signup error:", err);
      if (err.code === "ERR_NETWORK") {
        setError("Backend server not running! Please start the server with: npm run server");
      } else if (err.response?.status === 400) {
        if (err.response.data.error.includes("already exists")) {
          setError("An account with this email already exists. Please login instead.");
        } else {
          setError(err.response.data.error);
        }
      } else {
        setError(err.response?.data?.error || "Signup failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account</h2>
        <p style={styles.subtitle}>Sign up to get started</p>

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              style={styles.input}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
              placeholder="you@example.com"
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={styles.input}
              placeholder="Minimum 6 characters"
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Mobile Number *</label>
            <input
              type="tel"
              name="mobileNo"
              value={formData.mobileNo}
              onChange={handleChange}
              style={styles.input}
              placeholder="9876543210"
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              style={styles.input}
              placeholder="Your address (optional)"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Register as</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="customer">Customer - Order food for delivery/takeaway</option>
              <option value="admin">Admin - Manage restaurant (Full access)</option>
              <option value="waiter">Waiter - Take orders and serve customers</option>
              <option value="kitchen">Kitchen Staff - View and prepare orders</option>
              <option value="counter">Counter Staff - Handle billing and payments</option>
            </select>
            <small style={styles.hint}>
              Note: Admin, Waiter, Kitchen, and Counter roles are for restaurant staff only
            </small>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              ...(loading ? styles.buttonDisabled : {})
            }}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{" "}
          <a href="/login" style={styles.link}>
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
};

// Styles
const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    padding: "20px"
  },
  card: {
    maxWidth: "500px",
    width: "100%",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    padding: "40px"
  },
  title: {
    fontSize: "28px",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: "8px",
    color: "#1f2937"
  },
  subtitle: {
    textAlign: "center",
    color: "#6b7280",
    marginBottom: "32px",
    fontSize: "14px"
  },
  error: {
    backgroundColor: "#fee2e2",
    border: "1px solid #ef4444",
    color: "#b91c1c",
    padding: "12px 16px",
    borderRadius: "8px",
    marginBottom: "24px",
    fontSize: "14px"
  },
  inputGroup: {
    marginBottom: "20px"
  },
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: "500",
    color: "#374151",
    marginBottom: "6px"
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s"
  },
  hint: {
    display: "block",
    fontSize: "12px",
    color: "#6b7280",
    marginTop: "4px"
  },
  button: {
    width: "100%",
    backgroundColor: "#2563eb",
    color: "white",
    padding: "12px 16px",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "500",
    cursor: "pointer",
    marginTop: "8px",
    transition: "background-color 0.2s"
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed"
  },
  footer: {
    textAlign: "center",
    fontSize: "14px",
    color: "#6b7280",
    marginTop: "24px"
  },
  link: {
    color: "#2563eb",
    textDecoration: "none",
    fontWeight: "500"
  }
};

export default Signup;