import React from "react";
import { Link } from "react-router-dom";
import "./HeroSection.css";

const HeroSection = () => {
    return (
        <div className="hero-container">
            <div className="hero-content">
                <h1>השכרת ציוד קהילתי בקלות</h1>
                <p>מגוון רחב של ציוד במחירים נוחים לכל אירוע</p>
                <Link to="/categories" className="hero-button">
                    חיפוש ציוד להשכרה
                </Link>
            </div>
        </div>
    );
};

export default HeroSection;
