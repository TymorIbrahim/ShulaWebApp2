import React, { useState } from "react";
 import { Link, useNavigate } from "react-router-dom";
 import { useAuth } from "../context/AuthContext";
 import "./Navbar.css";
 import logoImage from "../assets/new-logo.png";
 

 const Navbar = () => {
  const { user, logoutUser } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const navigate = useNavigate();
 

  const toggleMobileMenu = () => {
  setMenuOpen(!menuOpen);
  };
 

  const toggleProfileMenu = () => {
  setProfileMenuOpen(!profileMenuOpen);
  };
 

  const handleLogoutClick = () => {
  logoutUser();
  setProfileMenuOpen(false);
  navigate("/");
  };
 

  // Function to determine if the user has admin-level access
  const isAdmin = user && user.role && user.role.includes('staff');
 

  return (
  <nav className="navbar">
  <div className="navbar-container">
  <Link to="/" className="navbar-logo">
  <img src={logoImage} alt="שולה לוגו" />
  </Link>
  <ul className="navbar-links">
  {/* --- Public links (always visible) --- */}
  <li>
  <Link to="/">דף הבית</Link>
  </li>

  {!isAdmin && (
  <>
  <li>
  <Link to="/products">מוצרים</Link>
  </li>
  <li>
  <Link to="/about">אודות</Link>
  </li>
  <li>
  <Link to="/faqs">שאלות ותשובות</Link>
  </li>
  </>
  )}
 

  {/* --- Conditional Admin Links --- */}
  {isAdmin && (
  <>
  <li>
  <Link to="/admin/products">ניהול מוצרים</Link>
  </li>
  <li>
  <Link to="/admin/users">ניהול משתמשים</Link>
  </li>
  <li>
  <Link to="/admin/analytics">נתונים</Link>
  </li>
  <li>
  <Link to="/admin/settings">הגדרות</Link>
  </li>
  </>
  )}
 

  {/* --- Conditional Cart Link (Customer) --- */}
  {!isAdmin && user && (
  <li>
  <Link to="/cart-page">העגלה שלי</Link>
  </li>
  )}
  {/* --- End Conditional Cart Link --- */}
 

  {/* --- Profile/Login Section --- */}
  {user ? (
  <li className="navbar-profile">
  <button className="profile-btn" onClick={toggleProfileMenu}>
  <span className="avatar">
  {user.firstName
  ? user.firstName.charAt(0).toUpperCase()
  : "U"}
  </span>
  <span className="user-name">{user.firstName}</span>
  </button>
  {profileMenuOpen && (
  <div className="profile-dropdown">
  <Link to="/profile" onClick={() => setProfileMenuOpen(false)}>
  פרופיל
  </Link>
  <Link to="/orders" onClick={() => setProfileMenuOpen(false)}>
  הזמנות קודמות
  </Link>
  <button onClick={handleLogoutClick}>התנתק</button>
  </div>
  )}
  </li>
  ) : (
  <li>
  <Link to="/login">התחבר</Link>
  </li>
  )}
  </ul>
  <button
  className={`menu-button ${menuOpen ? "active" : ""}`}
  onClick={toggleMobileMenu}
  >
  ☰
  </button>
  </div>
 

  {/* --- Mobile Menu --- */}
  <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
  {/* Public links */}
  <Link to="/" onClick={() => setMenuOpen(false)}>
  דף הבית
  </Link>
  <Link to="/products" onClick={() => setMenuOpen(false)}>
  מוצרים
  </Link>
  <Link to="/about" onClick={() => setMenuOpen(false)}>
  אודות
  </Link>
  <Link to="/faqs" onClick={() => setMenuOpen(false)}>
  שאלות ותשובות
  </Link>
 

  {/* --- Conditional Admin Links (Mobile) --- */}
  {isAdmin && (
  <>
  <Link to="/admin/products" onClick={() => setMenuOpen(false)}>
  ניהול מוצרים
  </Link>
  <Link to="/admin/users" onClick={() => setMenuOpen(false)}>
  ניהול משתמשים
  </Link>
  <Link to="/admin/analytics" onClick={() => setMenuOpen(false)}>
  נתונים
  </Link>
  <Link to="/admin/settings" onClick={() => setMenuOpen(false)}>
  הגדרות
  </Link>
  </>
  )}
 

  {/* --- Conditional Cart Link (Mobile) --- */}
  {!isAdmin && user && (
  <Link to="/cart-page" onClick={() => setMenuOpen(false)}>
  העגלה שלי
  </Link>
  )}
  {/* --- End Conditional Cart Link --- */}
 

  {/* --- Conditional Profile/Login/Logout (Mobile) --- */}
  {user ? (
  <>
  <Link to="/profile" onClick={() => setMenuOpen(false)}>
  פרופיל
  </Link>
  <Link to="/orders" onClick={() => setMenuOpen(false)}>
  הזמנות קודמות
  </Link>
  <button
  className="mobile-logout-btn"
  onClick={() => {
  handleLogoutClick();
  setMenuOpen(false);
  }}
  >
  התנתק
  </button>
  </>
  ) : (
  <Link to="/login" onClick={() => setMenuOpen(false)}>
  התחבר
  </Link>
  )}
  </div>
  </nav>
  );
 };
 

 export default Navbar;