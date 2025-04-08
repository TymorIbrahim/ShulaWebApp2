import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/authService"; // Backend API call
import { useAuth } from "../context/AuthContext"; // Get the global auth functions
import "./LoginPage.css";

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "", remember: false });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { loginUser } = useAuth(); // Access the function to update AuthContext

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { email, password } = formData;
    if (!email || !password) {
      setError("אנא מלא/י את כתובת האימייל והסיסמה");
      setLoading(false);
      return;
    }

    try {
      // Call your backend login API.
      const response = await login({ email, password });
      console.log("Login successful:", response);
      
      // Update the global auth state with the logged in user.
      loginUser(response.user);
      
      // Navigate to the home page for logged in users.
      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("אירעה שגיאה בעת ההתחברות. נסה/י שנית מאוחר יותר.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-form-container">
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <h2>התחברות</h2>

          <div className="form-group">
            <input
              type="email"
              id="email"
              name="email"
              placeholder="כתובת אימייל"
              value={formData.email}
              onChange={handleChange}
              required
              aria-invalid={error ? "true" : "false"}
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              id="password"
              name="password"
              placeholder="סיסמה"
              value={formData.password}
              onChange={handleChange}
              required
              aria-invalid={error ? "true" : "false"}
            />
          </div>

          <div className="remember-me-group">
            <input
              type="checkbox"
              id="remember"
              name="remember"
              checked={formData.remember}
              onChange={handleChange}
              className="remember-me-checkbox"
            />
            <label htmlFor="remember" className="remember-me-label">
              זכור אותי ל-30 יום
            </label>
          </div>

          {error && <p className="error-message login-error">{error}</p>}

          <button type="submit" className="button button-primary login-btn" disabled={loading}>
            {loading ? "מתחבר..." : "התחבר"}
          </button>

          <div className="divider">
            <span>או</span>
          </div>

          <button type="button" className="button google-btn">
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt=""
              className="google-icon"
            />
            התחברות עם Google
          </button>

          <Link to="/forgot-password" className="forgot-password-link">
            שכחת סיסמה?
          </Link>

          <p className="signup-link-text">
            אין לך חשבון? <Link to="/signup">להרשמה</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
