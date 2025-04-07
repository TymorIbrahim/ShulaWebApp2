import React, { useState } from "react";
import "./LoginPage.css";
import { Link } from "react-router-dom"; // make sure this is imported


const LoginPage = ({ onLogin }) => {
  const [formData, setFormData] = useState({ email: "", password: "", remember: false });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { email, password } = formData;

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setError("");
    onLogin?.("user");
  };

  return (
    <div className="login-wrapper">
      <div className="loginpage">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>התחברות</h2>
  
          <input
            type="email"
            name="email"
            placeholder="כתובת אימייל"
            value={formData.email}
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder="סיסמה"
            value={formData.password}
            onChange={handleChange}
          />
  
          <label className="remember-me">
            <input
              type="checkbox"
              name="remember"
              checked={formData.remember}
              onChange={handleChange}
            />
            זכור אותי ל-30 יום
          </label>
  
          {error && <p className="error">{error}</p>}
  
          <button type="submit" className="login-btn">התחבר</button>
  
          <div className="divider">או</div>
  
          <button type="button" className="google-btn">
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
            />
            התחברות עם Google
          </button>
  
          <a href="#" className="forgot-password">שכחת סיסמה?</a>
  
          <p style={{ marginTop: "20px", fontSize: "14px" }}>
            אין לך חשבון?{" "}
            <Link to="/signup" style={{ color: "#2962ff", textDecoration: "none" }}>
              להרשמה
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
