import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";
import logoImage from '../assets/logo.avif';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img src={logoImage} alt="שולה לוגו" /> {/* <-- Use imported logo */}
        </Link>

        {/* Desktop Navigation */}
        <ul className="navbar-links">
          <li><Link to="/">דף הבית</Link></li>
          <li><Link to="/products">מוצרים</Link></li>
          <li><Link to="/about">אודות</Link></li>
          <li><Link to="/faqs">שאלות ותשובות</Link></li>
          <li><Link to="/cart-page">העגלה שלי</Link></li>
          <li><Link to="/login">Log In</Link></li>

        </ul>

        {/* Mobile Menu Button */}
        <button className={`menu-button ${menuOpen ? "active" : ""}`} onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        <Link to="/" onClick={() => setMenuOpen(false)}>דף הבית</Link>
        <Link to="/categories" onClick={() => setMenuOpen(false)}>מוצרים</Link>
        <Link to="/about" onClick={() => setMenuOpen(false)}>אודות</Link>
        <Link to="/contact" onClick={() => setMenuOpen(false)}>צור קשר</Link>
        <Link to="/faqs" onClick={() => setMenuOpen(false)}>שאלות ותשובות</Link>
        <Link to="/login" onClick={() => setMenuOpen(false)}>Log In </Link>
      </div>
    </nav>
  );
};

export default Navbar;
