import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./SignupPage.css";
import { signUp, login } from "../services/authService";
import { useAuth } from "../context/AuthContext";

const SignupPage = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Basic validation: check if any field is empty
    const isEmpty = Object.values(formData).some((val) => val.trim() === "");
    if (isEmpty) {
      setError("אנא מלא/י את כל השדות");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("אנא הכנס/י כתובת אימייל תקינה");
      return;
    }

    // Password validation
    if (formData.password.length < 6) {
      setError("הסיסמה חייבת להכיל לפחות 6 תווים");
      return;
    }

    setLoading(true);
    try {
      // Register user
      await signUp(formData);
      
      // Automatically log the user in using their credentials
      const loginResponse = await login({ 
        email: formData.email, 
        password: formData.password 
      });

      // Update the global authentication context
      if (loginResponse.user) {
        let userDataForContext = { ...loginResponse.user };
        if (loginResponse.token) {
          userDataForContext.token = loginResponse.token;
        }
        
        loginUser(userDataForContext);
        navigate("/");
      }
      
    } catch (err) {
      console.error("Signup error:", err.message);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("אירעה שגיאה בעת ההרשמה. נסה/י שנית.");
      }
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError("");
    setSuccess(false);
    setLoading(true);
    // TODO: Implement the actual Google Sign-Up flow.
    alert("Google Sign-Up not implemented yet.");
    setLoading(false);
  };

  return (
    <div className="signup-page-container" dir="rtl">
      <div className="signup-form-container">
        <form className="signup-form" onSubmit={handleSubmit} noValidate>
          <h2>הרשמה</h2>
          
          <div className="name-fields">
            <div className="form-group">
              <input
                type="text"
                id="firstName"
                name="firstName"
                placeholder="שם פרטי *"
                value={formData.firstName}
                onChange={handleChange}
                required
                aria-invalid={error ? "true" : "false"}
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                id="lastName"
                name="lastName"
                placeholder="שם משפחה *"
                value={formData.lastName}
                onChange={handleChange}
                required
                aria-invalid={error ? "true" : "false"}
              />
            </div>
          </div>

          <div className="form-group">
            <input
              type="email"
              id="email"
              name="email"
              placeholder="דוא״ל *"
              value={formData.email}
              onChange={handleChange}
              required
              aria-invalid={error ? "true" : "false"}
            />
          </div>

          <div className="form-group">
            <input
              type="tel"
              id="phone"
              name="phone"
              placeholder="מספר טלפון *"
              value={formData.phone}
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
              placeholder="סיסמה *"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
              aria-invalid={error ? "true" : "false"}
            />
          </div>

          {error && <p className="error-message signup-error">{error}</p>}
          {success && <p className="success-message">נרשמת בהצלחה! 🎉</p>}

          <button
            type="submit"
            className="button button-primary signup-btn"
            disabled={loading}
          >
            {loading ? "מרשם..." : "הרשמה"}
          </button>

          <div className="divider">
            <span>או</span>
          </div>

          <button
            type="button"
            className="button google-btn"
            onClick={handleGoogleSignup}
            disabled={loading}
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt=""
              className="google-icon"
            />
            הרשמה עם Google
          </button>

          <p className="login-link-text">
            יש לך כבר חשבון?{" "}
            <Link to="/login">
              להתחברות
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
