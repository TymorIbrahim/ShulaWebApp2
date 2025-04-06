import React from "react";
import { Link } from "react-router-dom"; // Need Link for the CTA button
import "./HeroSection.css";

// Import the background image
import shelvesImage from '../assets/tools-background.jpg'; 

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

          {/* Call to Action Button */}
          <Link to="/products" className="hero-cta-button"> 
            לחיפוש ציוד להשכרה
          </Link>
        {/*  Add the 'secondary' class here */}
        <Link to="/join" className="hero-cta-button secondary"> {/* Adjust '/join' path */}
            להצטרף למשפחת שולה
        </Link>
        </div>
      </div>
    );
  };

export default HeroSection;