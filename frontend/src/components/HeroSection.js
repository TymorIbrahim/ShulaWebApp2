import React from "react";
import { Link } from "react-router-dom"; // Need Link for the CTA button
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
          <h1>השכרת ציוד קהילתי בקלות</h1>

          {/* Brief Description */}
          <p>
            מצאו והשאילו ציוד לאירועים, לבית ולגינה - קרוב לבית ובמחיר נוח.
          </p>

          {/* Button Container */}
          <div className="hero-buttons">
            {/* Call to Action Button - Primary */}
            <Link to="/products" className="button button-primary hero-cta-button">
              לחיפוש ציוד להשכרה
            </Link>
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