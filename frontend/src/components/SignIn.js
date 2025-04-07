import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signUp } from "../services/authService";
import "./SignIn.css";

const SignIn = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check that all fields are filled
    const isEmpty = Object.values(formData).some((val) => val.trim() === "");
    if (isEmpty) {
      setError("אנא מלא.י את כל השדות");
      return;
    }

    try {
      const data = await signUp(formData);
      // data.user should contain the created user if sign-up is successful
      onLogin(data.user);
      navigate("/");
    } catch (err) {
      // If an error occurs, display the error message
      setError(err.message || "Signup failed");
    }
  };

  return (
    <div className="loginpage" dir="rtl">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>הרשמה</h2>
        {error && <p style={{ color: "red", marginBottom: "10px" }}>{error}</p>}
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
      </form>
    </div>
  );
};

export default SignIn;
