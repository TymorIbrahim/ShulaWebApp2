import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          שולה - השכרת ציוד קהילתי
        </Link>

        {/* Desktop Navigation */}
        <ul className="navbar-links">
          <li><Link to="/">דף הבית</Link></li>
          <li><Link to="/categories">קטגוריות</Link></li>
          <li><Link to="/about">אודות</Link></li>
          <li><Link to="/contact">צור קשר</Link></li>
        </ul>

        {/* Mobile Menu Button */}
        <button className={`menu-button ${menuOpen ? "active" : ""}`} onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        <Link to="/" onClick={() => setMenuOpen(false)}>דף הבית</Link>
        <Link to="/categories" onClick={() => setMenuOpen(false)}>קטגוריות</Link>
        <Link to="/about" onClick={() => setMenuOpen(false)}>אודות</Link>
        <Link to="/contact" onClick={() => setMenuOpen(false)}>צור קשר</Link>
      </div>
    </nav>
  );
};

export default Navbar;
