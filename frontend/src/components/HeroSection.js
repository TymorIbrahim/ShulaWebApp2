import React from "react";
 import { Link } from "react-router-dom";
 import "./HeroSection.css";
 

 // Import the background image
 import shelvesImage from '../assets/tools-background.jpg'; // Ensure this path is correct
 

 const HeroSection = () => {
  return (
  // Main container for the hero section
  <div
  className="hero-section-container"
  style={{ backgroundImage: `url(${shelvesImage})` }} // Apply background here
  >
  {/* Overlay for text readability */}
  <div className="hero-overlay"></div>
 

  {/* Content wrapper */}
  <div className="hero-content">
  {/* Main Headline */}
  <h1 className="hero-content h1">שולה</h1>
  <h2 className="hero-content h2">ספריית הציוד השכונתי</h2>
 

  {/* Brief Description */}
  <p>
  מצאו והשאילו ציוד לאירועים, לבית ולגינה - קרוב לבית ובמחיר נוח.
  </p>
 

  {/* Button Container */}
  <div className="hero-buttons">
  {/* Call to Action Button - Primary */}
  <Link to="/products" className="button button-primary hero-cta-button primary">
  לחיפוש ציוד להשכרה
  </Link>
  </div>
  <br></br>
  <div>
  {/* Call to Action Button - Secondary */}
  {/* Add the 'secondary' class and ensure path is correct */}
  <Link to="/signup" className="button button-secondary hero-cta-button secondary">
  להצטרף למשפחת שולה
  </Link>
  </div>
  </div>
  </div>
  );
 };
 

 export default HeroSection;