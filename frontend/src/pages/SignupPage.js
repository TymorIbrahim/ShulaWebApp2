import React, { useState } from "react";
import "./SignupPage.css";

const SignIn = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });

  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // בדיקה בסיסית שכל השדות מלאים
    const isEmpty = Object.values(formData).some((val) => val.trim() === "");
    if (isEmpty) {
      alert("אנא מלא.י את כל השדות");
      return;
    }

    console.log("🆕 משתמש נרשם:", formData);
    setSuccess(true);
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
