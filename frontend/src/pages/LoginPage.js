import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import { useAuth } from "../context/AuthContext"; // Import useAuth
import "./LoginPage.css"; // Import CSS

// Assuming you have a Google icon SVG or component
// import GoogleIcon from '../assets/google-icon.svg';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "", remember: false });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Loading state for login attempt
  const { login } = useAuth(); // Get login function from context
  const navigate = useNavigate(); // Hook for navigation

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => { // Make async
    e.preventDefault();
    setError(""); // Clear previous errors
    setLoading(true); // Set loading

    const { email, password } = formData;

    if (!email || !password) {
      setError("אנא מלא/י את כתובת האימייל והסיסמה");
      setLoading(false);
      return;
    }

    try {
      // Use the login function from AuthContext
      const loginSuccess = await login(email, password);

      if (loginSuccess) {
        console.log("Login successful, navigating...");
        // Navigate to admin dashboard or intended page upon successful login
        // You might want to redirect based on location state if coming from ProtectedRoute
        // const location = useLocation(); // Get location at the top of the component
        // const from = location.state?.from?.pathname || "/admin"; // Or a default page
        navigate('/admin'); // Redirect to admin dashboard for now
      } else {
        // login function in context returns false on failure
        setError("שם משתמש או סיסמה שגויים.");
      }
    } catch (err) {
      // Catch any unexpected errors during login
      console.error("Login API error:", err);
      setError("אירעה שגיאה בעת ההתחברות. נסה/י שנית מאוחר יותר.");
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    // Use the container class from the CSS
    <div className="login-page-container">
      {/* Use the form container class from the CSS */}
      <div className="login-form-container">
        <form className="login-form" onSubmit={handleSubmit} noValidate> {/* Add noValidate to disable browser validation if using custom */}
          <h2>התחברות</h2>

          {/* Wrap inputs in form-group for consistent styling */}
          <div className="form-group">
            {/* <label htmlFor="email">כתובת אימייל:</label> */}
            <input
              type="email"
              id="email" // Add id for label association if using label
              name="email"
              placeholder="כתובת אימייל"
              value={formData.email}
              onChange={handleChange}
              required // Add basic HTML5 validation
              aria-invalid={error ? "true" : "false"} // Accessibility hint
            />
          </div>

          <div className="form-group">
            {/* <label htmlFor="password">סיסמה:</label> */}
            <input
              type="password"
              id="password" // Add id for label association if using label
              name="password"
              placeholder="סיסמה"
              value={formData.password}
              onChange={handleChange}
              required // Add basic HTML5 validation
              aria-invalid={error ? "true" : "false"} // Accessibility hint
            />
          </div>

          {/* Group checkbox and label */}
          <div className="remember-me-group">
            <input
              type="checkbox"
              id="remember" // Add id for label
              name="remember"
              checked={formData.remember}
              onChange={handleChange}
              className="remember-me-checkbox"
            />
            <label htmlFor="remember" className="remember-me-label">
              זכור אותי ל-30 יום
            </label>
          </div>

          {/* Display error message */}
          {error && <p className="error-message login-error">{error}</p>}

          {/* Apply standard button classes */}
          <button
            type="submit"
            className="button button-primary login-btn" // Use theme classes
            disabled={loading} // Disable button while loading
          >
            {loading ? "מתחבר..." : "התחבר"}
          </button>

          <div className="divider"><span>או</span></div>

          {/* Style Google button consistently */}
          <button type="button" className="button google-btn">
            {/* Use an inline SVG or img tag for the icon */}
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="" // Decorative icon
              className="google-icon"
            />
            התחברות עם Google
          </button>

          <Link to="/forgot-password" className="forgot-password-link"> {/* Change href="#" to Link */}
            שכחת סיסמה?
          </Link>

          <p className="signup-link-text">
            אין לך חשבון?{" "}
            <Link to="/signup">
              להרשמה
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;