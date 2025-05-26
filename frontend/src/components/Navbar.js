// src/components/Navbar.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Assuming this is your v5 or v4 context
import "./Navbar.css"; // Ensure this path is correct
import logoImage from "../assets/new-logo.png"; // Ensure this path is correct

const Navbar = () => {
  // Use the isAdmin flag from your centralized useAuth hook
  // This assumes your AuthContext.js (v5 or v4) correctly provides isAdmin
  const { user, logoutUser } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const navigate = useNavigate();

 // Function to determine if the user has admin-level access
  const isAdmin = user && user.role && user.role.includes('staff');

  const toggleMobileMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const toggleProfileMenu = () => {
    setProfileMenuOpen(!profileMenuOpen);
  };

  const handleLogoutClick = () => {
    logoutUser();
    setProfileMenuOpen(false);
    navigate("/"); // After logout, always go to the public homepage
  };

  // Determine the correct "home" path based on admin status
  const homePath = isAdmin ? "/admin" : "/";

  // --- DEBUGGING LOG for Navbar ---
  // console.log("[NAVBAR_DEBUG] Rendering Navbar. User:", JSON.stringify(user, null, 2) , "isAdmin:", isAdmin, "Calculated homePath:", homePath);
  // --- END DEBUGGING LOG ---

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo link now conditional */}
        <Link to={homePath} className="navbar-logo" onClick={() => setMenuOpen(false)}>
          <img src={logoImage} alt="שולה לוגו" />
        </Link>

        <ul className="navbar-links">
          {/* Home link now conditional */}
          <li>
            <Link to={homePath} onClick={() => setMenuOpen(false)}>דף הבית</Link>
          </li>

          {/* --- Customer-specific links (shown if NOT admin) --- */}
          {!isAdmin && (
            <>
              <li>
                <Link to="/products" onClick={() => setMenuOpen(false)}>מוצרים</Link>
              </li>
              <li>
                <Link to="/about" onClick={() => setMenuOpen(false)}>אודות</Link>
              </li>
              <li>
                <Link to="/faqs" onClick={() => setMenuOpen(false)}>שאלות ותשובות</Link>
              </li>
            </>
          )}

          {/* --- Admin-specific links (shown IF admin) --- */}
          {isAdmin && (
            <>
              <li>
                <Link to="/admin/products" onClick={() => setMenuOpen(false)}>ניהול מוצרים</Link>
              </li>
              <li>
                <Link to="/admin/rentals" onClick={() => setMenuOpen(false)}>ניהול השכרות</Link> 
              </li>
              <li>
                <Link to="/admin/users" onClick={() => setMenuOpen(false)}>ניהול משתמשים</Link>
              </li>
              <li>
                <Link to="/admin/analytics" onClick={() => setMenuOpen(false)}>נתונים</Link>
              </li>
              <li>
                <Link to="/admin/settings" onClick={() => setMenuOpen(false)}>הגדרות</Link>
              </li>
            </>
          )}

          {/* --- Conditional Cart Link (Customer, logged in) --- */}
          {!isAdmin && user && (
            <li>
              <Link to="/cart-page" onClick={() => setMenuOpen(false)}>העגלה שלי</Link>
            </li>
          )}

          {/* --- Profile/Login Section --- */}
          {user ? (
            <li className="navbar-profile">
              <button className="profile-btn" onClick={toggleProfileMenu}>
                <span className="avatar">
                  {user.firstName ? user.firstName.charAt(0).toUpperCase() : "U"}
                </span>
                <span className="user-name">{user.firstName}</span>
              </button>
              {profileMenuOpen && (
                <div className="profile-dropdown">
                  {/* Profile link could also be conditional if admins have a different profile page */}
                  <Link to="/profile" onClick={() => { setProfileMenuOpen(false); setMenuOpen(false); }}>
                    פרופיל
                  </Link>
                  <button onClick={() => { handleLogoutClick(); setMenuOpen(false); }}>התנתק</button>
                </div>
              )}
            </li>
          ) : (
            <li>
              <Link to="/login" onClick={() => setMenuOpen(false)}>התחבר</Link>
            </li>
          )}
        </ul>
        <button
          className={`menu-button ${menuOpen ? "active" : ""}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          ☰
        </button>
      </div>

      {/* --- Mobile Menu --- */}
      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        <Link to={homePath} onClick={() => setMenuOpen(false)}>
          דף הבית
        </Link>

        {!isAdmin && (
          <>
            <Link to="/products" onClick={() => setMenuOpen(false)}>מוצרים</Link>
            <Link to="/about" onClick={() => setMenuOpen(false)}>אודות</Link>
            <Link to="/faqs" onClick={() => setMenuOpen(false)}>שאלות ותשובות</Link>
          </>
        )}

        {isAdmin && (
          <>
            <Link to="/admin/products" onClick={() => setMenuOpen(false)}>ניהול מוצרים</Link>
            <Link to="/admin/rentals" onClick={() => setMenuOpen(false)}>ניהול השכרות</Link>
            <Link to="/admin/users" onClick={() => setMenuOpen(false)}>ניהול משתמשים</Link>
            <Link to="/admin/analytics" onClick={() => setMenuOpen(false)}>נתונים</Link>
            <Link to="/admin/settings" onClick={() => setMenuOpen(false)}>הגדרות</Link>
          </>
        )}

        {!isAdmin && user && (
          <Link to="/cart-page" onClick={() => setMenuOpen(false)}>העגלה שלי</Link>
        )}

        {user ? (
          <>
            <Link to="/profile" onClick={() => setMenuOpen(false)}>פרופיל</Link>
            <button
              className="mobile-logout-btn"
              onClick={() => { handleLogoutClick(); setMenuOpen(false); }}
            >
              התנתק
            </button>
          </>
        ) : (
          <Link to="/login" onClick={() => setMenuOpen(false)}>התחבר</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;



