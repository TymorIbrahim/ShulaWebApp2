import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SignIn.css";

const SignIn = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Basic check: all fields must be filled.
    const isEmpty = Object.values(formData).some((val) => val.trim() === "");
    if (isEmpty) {
      alert("אנא מלא.י את כל השדות");
      return;
    }

    // Simulate a sign-up API call here.
    console.log("🆕 משתמש נרשם:", formData);
    setSuccess(true);
    // Simulate receiving a user object from your backend.
    const newUser = {
      firstName: formData.firstName,
      role: "customer",
      // You might include other fields returned from your API.
    };

    // Call the onLogin handler to set the user and navigate to home.
    onLogin(newUser);
    navigate("/");

    // Reset the form (optional, as you're navigating away)
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
    });
  };

  return (
    <div className="loginpage" dir="rtl">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>הרשמה</h2>
        <div className="name-fields">
          <input
            type="text"
            name="firstName"
            placeholder="שם פרטי"
            value={formData.firstName}
            onChange={handleChange}
          />
          <input
            type="text"
            name="lastName"
            placeholder="שם משפחה"
            value={formData.lastName}
            onChange={handleChange}
          />
        </div>
        <input
          type="email"
          name="email"
          placeholder="דוא״ל"
          value={formData.email}
          onChange={handleChange}
        />
        <input
          type="tel"
          name="phone"
          placeholder="מספר טלפון"
          value={formData.phone}
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="סיסמה"
          value={formData.password}
          onChange={handleChange}
        />
        <button type="submit" className="login-btn">הרשמה</button>
        {success && <p style={{ color: "green", marginTop: "10px" }}>נרשמת בהצלחה 🎉</p>}
      </form>
    </div>
  );
};

export default SignIn;
