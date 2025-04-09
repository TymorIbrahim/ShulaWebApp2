import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Import the auth context hook
import "./Navbar.css";
import logoImage from "../assets/new-logo.png";

const Navbar = () => {
  // Get the current logged in user and logout function from AuthContext
  const { user, logoutUser } = useAuth(); // Use 'user' to check login status
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

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img src={logoImage} alt="שולה לוגו" />
        </Link>
        <ul className="navbar-links">
          {/* --- Public links --- */}
          <li>
            <Link to="/">דף הבית</Link>
          </li>
          <li>
            <Link to="/products">מוצרים</Link>
          </li>
          <li>
            <Link to="/about">אודות</Link>
          </li>
          <li>
            <Link to="/faqs">שאלות ותשובות</Link>
          </li>

          {/* --- Conditional Cart Link (Desktop) --- */}
          {user && ( // Only show if user is logged in
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
                  {/* Add Admin link conditionally if needed */}
                  {/* {user.isAdmin && <Link to="/admin">Admin</Link>} */}
                  <button onClick={handleLogoutClick}>התנתק</button>
                </div>
              )}
            </li>
          ) : (
            <li>
              <Link to="/login">Log In</Link>
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
        {/* <Link to="/contact" onClick={() => setMenuOpen(false)}>
          צור קשר
        </Link> */}
        <Link to="/faqs" onClick={() => setMenuOpen(false)}>
          שאלות ותשובות
        </Link>

        {/* --- Conditional Cart Link (Mobile) --- */}
        {user && ( // Only show if user is logged in
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
            {/* Add Admin link conditionally if needed */}
            {/* {user.isAdmin && <Link to="/admin" onClick={() => setMenuOpen(false)}>Admin</Link>} */}
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
            Log In
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;