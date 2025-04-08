import React from 'react';
import './Footer.css'; // Import the CSS for styling
// Optional: Import icons if you use them (e.g., react-icons)
// import { FaWhatsapp, FaFacebook } from 'react-icons/fa';

const Footer = () => {
  // Get current year dynamically
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-content main-content-container"> {/* Optional: Use main-content-container to align content */}

        <div className="footer-section contact-info">
          <h4>פרטי התקשרות</h4>
          <p>
            {/* Replace with actual address */}
            טבריה 15, חיפה
          </p>
          <p>
            {/* Replace with actual phone/WhatsApp */}
            <a href="tel:+972532483676">053-2483676</a> (WhatsApp)
          </p>
          <p>
             {/* Replace with actual email */}
            <a href="mailto:shula.hadar@example.com">shula.hadar@example.com</a>
          </p>
        </div>

        <div className="footer-section hours">
          <h4>שעות פעילות</h4>
          <p>ראשון, שלישי, חמישי</p>
          <p>17:00 - 19:00</p>
        </div>

        <div className="footer-section social-links">
          <h4>עקבו אחרינו</h4>
          {/* Replace # with actual links */}
          <a href="#" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
             {/* <FaWhatsapp /> Using react-icons example */}
             WhatsApp {/* Placeholder text */}
          </a>
          <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
             {/* <FaFacebook /> Using react-icons example */}
             Facebook {/* Placeholder text */}
          </a>
          {/* Add other social links as needed */}
        </div>

      </div>
      <div className="footer-bottom">
        <p>&copy; {currentYear} שולה - ספריית ציוד קהילתית. כל הזכויות שמורות.</p>
        {/* Optional: Add credits or other links here */}
      </div>
    </footer>
  );
};

export default Footer;