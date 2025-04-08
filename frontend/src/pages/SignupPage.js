import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import Link and useNavigate
import "./SignupPage.css"; // Import CSS

// --- TODO: Add actual signup API call ---
// import { signupUser, signupWithGoogle } from '../services/authService'; // Example service

const SignupPage = () => { // Renamed component from SignIn to SignupPage
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false); // Keep success message state
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => { // Make async
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Basic validation
    const isEmpty = Object.values(formData).some((val) => val.trim() === "");
    if (isEmpty) {
      setError("אנא מלא/י את כל השדות");
      return;
    }
    // --- TODO: Add more validation (email format, password strength, phone format) ---

    setLoading(true);
    try {
      // --- TODO: Replace with actual API call ---
      console.log("🆕 משתמש נרשם (סימולציה):", formData);
      // Example: const result = await signupUser(formData);
      // if (result.success) { ... } else { throw new Error(result.message); }

      // Simulate success
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      setSuccess(true);
      setFormData({ // Clear form on success
        firstName: "", lastName: "", email: "", phone: "", password: "",
      });
      // Optional: Redirect after a delay or show message longer
      // setTimeout(() => navigate('/login'), 2000);

    } catch (err) {
      console.error("Signup Error:", err);
      setError(err.message || "אירעה שגיאה בעת ההרשמה. נסה/י שנית.");
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
      setError("");
      setSuccess(false);
      setLoading(true); // Or a specific Google loading state
      console.log("Initiating Google Sign-Up (Placeholder)...");
      // --- TODO: Implement Google Sign-Up flow ---
      // This usually involves:
      // 1. Calling a library function (e.g., from Firebase Auth, Google Identity Services)
      // 2. Handling the popup/redirect
      // 3. Sending the received token/user info to your backend for verification/user creation
      // Example using a hypothetical service:
      // try {
      //   const result = await signupWithGoogle();
      //   if (result.success) {
      //     // Handle successful Google signup (e.g., navigate)
      //     navigate('/profile'); // Or wherever appropriate
      //   } else {
      //     setError(result.message || "Google signup failed.");
      //   }
      // } catch (err) {
      //   setError("An error occurred during Google Sign-Up.");
      // } finally {
      //   setLoading(false);
      // }
      alert("Google Sign-Up not implemented yet."); // Placeholder feedback
      setLoading(false);
  };


  return (
    // Use container classes similar to LoginPage
    <div className="signup-page-container" dir="rtl">
      <div className="signup-form-container">
        <form className="signup-form" onSubmit={handleSubmit} noValidate>
          <h2>הרשמה</h2>

          {/* Container for name fields */}
          <div className="name-fields">
            <div className="form-group">
              {/* <label htmlFor="firstName">שם פרטי:</label> */}
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
              {/* <label htmlFor="lastName">שם משפחה:</label> */}
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
            {/* <label htmlFor="email">דוא״ל:</label> */}
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
            {/* <label htmlFor="phone">מספר טלפון:</label> */}
            <input
              type="tel" // Use type 'tel' for phone numbers
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
            {/* <label htmlFor="password">סיסמה:</label> */}
            <input
              type="password"
              id="password"
              name="password"
              placeholder="סיסמה *"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6" // Example: enforce minimum length
              aria-invalid={error ? "true" : "false"}
            />
            {/* Consider adding password strength indicator */}
          </div>

          {error && <p className="error-message signup-error">{error}</p>}
          {success && <p className="success-message">נרשמת בהצלחה! 🎉</p>}

          {/* Apply standard button classes */}
          <button
            type="submit"
            className="button button-primary signup-btn" // Use theme classes
            disabled={loading}
          >
            {loading ? "מרשם..." : "הרשמה"}
          </button>

          <div className="divider"><span>או</span></div>

          {/* Google Signup Button */}
          <button
            type="button"
            className="button google-btn"
            onClick={handleGoogleSignup}
            disabled={loading}
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="" // Decorative icon
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

export default SignupPage; // Ensure export name matches component name