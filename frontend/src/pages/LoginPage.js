// src/pages/LoginPage.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/authService"; // Backend API call
import { useAuth } from "../context/AuthContext"; // Get the global auth functions
import "./LoginPage.css"; // Ensure this path is correct

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "", remember: false });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { loginUser } = useAuth(); 

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
      const response = await login({ email, password }); 

      console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
      console.log("[LOGIN_PAGE_DEBUG_V6_SIMPLIFIED] Full response from authService.login:", JSON.stringify(response, null, 2));
      
      if (response && response.user) {
        const userData = response.user; 
        console.log("[LOGIN_PAGE_DEBUG_V6_SIMPLIFIED] 'response.user' object (this is 'userData'):", JSON.stringify(userData, null, 2));
        
        // --- DETAILED LOGS FOR THE isAdminLogin CHECK (still useful) ---
        let roleExists = false;
        let roleValue = undefined;
        let roleType = undefined;
        // let roleIsArray = false; // Not directly used in the simplified check line, but good for context
        // let roleIncludesStaff = false; // Will be determined by the simplified check line

        if (userData.hasOwnProperty('role')) {
          roleExists = true;
          roleValue = userData.role;
          roleType = typeof userData.role;
          console.log("[LOGIN_PAGE_DEBUG_V6_SIMPLIFIED] 'userData.role' EXISTS. Value:", JSON.stringify(roleValue));
          console.log("[LOGIN_PAGE_DEBUG_V6_SIMPLIFIED] 'userData.role' TYPE:", roleType);

          if (Array.isArray(roleValue)) {
            console.log("[LOGIN_PAGE_DEBUG_V6_SIMPLIFIED] 'userData.role' IS AN ARRAY.");
          } else if (roleType === 'string') {
            console.log("[LOGIN_PAGE_DEBUG_V6_SIMPLIFIED] 'userData.role' IS A STRING.");
          } else {
            console.log("[LOGIN_PAGE_DEBUG_V6_SIMPLIFIED] 'userData.role' is neither an array nor a string. This might cause an error with '.includes()'.");
          }
        } else {
          console.warn("[LOGIN_PAGE_DEBUG_V6_SIMPLIFIED] 'userData' object DOES NOT have a 'role' property.");
        }

        // Simplified check, directly mirroring Navbar's logic structure:
        // This relies on userData.role being either a string or an array if it exists.
        // If userData.role exists but is not a string/array, .includes() will error.
        // The preceding logs will help diagnose if this happens.
        const isAdminLogin = userData && userData.role && userData.role.includes && typeof userData.role.includes === 'function' && userData.role.includes("staff");
        // A slightly safer version of the direct Navbar check would be:
        // const isAdminLogin = userData && userData.role && typeof userData.role.includes === 'function' && userData.role.includes("staff");
        // For now, using the direct structure you asked for:
        // const isAdminLogin = userData && userData.role && userData.role.includes("staff");
        // Let's stick to the safer version that also checks if `includes` is a function:
        
        console.log("[LOGIN_PAGE_DEBUG_V6_SIMPLIFIED] Attempting isAdminLogin check: 'userData && userData.role && typeof userData.role.includes === 'function' && userData.role.includes(\"staff\")'");
        console.log("[LOGIN_PAGE_DEBUG_V6_SIMPLIFIED] FINAL isAdminLogin check result:", isAdminLogin);
        // --- END DETAILED LOGS ---
        
        loginUser(userData); 
      
        if (isAdminLogin) {
          console.log("[LOGIN_PAGE_DEBUG_V6_SIMPLIFIED] Admin detected by isAdminLogin. Navigating to /admin");
          navigate("/admin"); 
        } else {
          console.log("[LOGIN_PAGE_DEBUG_V6_SIMPLIFIED] Non-admin user OR isAdminLogin failed. Navigating to /");
          navigate("/"); 
        }
      } else {
        console.error("[LOGIN_PAGE_DEBUG_V6_SIMPLIFIED] Login response did not contain a 'user' object or response was unexpected:", JSON.stringify(response, null, 2));
        setError("תגובת השרת אינה תקינה. נסה/י שנית מאוחר יותר.");
      }

    } catch (err) {
      console.error("[LOGIN_PAGE_DEBUG_V6_SIMPLIFIED] Error during login API call or processing:", err);
      if (err.name === 'TypeError' && err.message.includes('includes is not a function')) {
        console.error("[LOGIN_PAGE_DEBUG_V6_SIMPLIFIED] TYPE ERROR: 'userData.role.includes' was called on a type that does not have it. Check 'userData.role' TYPE log above. Role was:", JSON.stringify(userData.role));
      }
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("אירעה שגיאה בעת ההתחברות. נסה/י שנית מאוחר יותר.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    // ... JSX for the login form (no changes needed here) ...
    <div className="login-page-container">
      <div className="login-form-container">
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <h2>התחברות</h2>
          <div className="form-group">
            <input type="email" id="email" name="email" placeholder="כתובת אימייל" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <input type="password" id="password" name="password" placeholder="סיסמה" value={formData.password} onChange={handleChange} required />
          </div>
          <div className="remember-me-group">
            <input type="checkbox" id="remember" name="remember" checked={formData.remember} onChange={handleChange} className="remember-me-checkbox" />
            <label htmlFor="remember" className="remember-me-label">זכור אותי ל-30 יום</label>
          </div>
          {error && <p className="error-message login-error">{error}</p>}
          <button type="submit" className="button button-primary login-btn" disabled={loading}>
            {loading ? "מתחבר..." : "התחבר"}
          </button>
          <div className="divider"><span>או</span></div>
          <button type="button" className="button google-btn">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" className="google-icon" />
            התחברות עם Google
          </button>
          <Link to="/forgot-password" className="forgot-password-link">שכחת סיסמה?</Link>
          <p className="signup-link-text">
            אין לך חשבון? <Link to="/signup">להרשמה</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
