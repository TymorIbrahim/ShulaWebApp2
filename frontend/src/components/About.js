import React from "react";
import firstPic from "../assets/first.png";  // Make sure these paths are correct
import secondPic from "../assets/second.png"; // Use appropriate SDG image/grid
import thirdPic from "../assets/third.png";  // Make sure these paths are correct
import './About.css'; // Import the CSS file for styling

const About = () => {
  return (
    // Container for the whole page content
    <div className="about-page-container" dir="rtl">

      {/* Section 1: Intro */}
      <section className="about-section intro-section">
        <div className="section-content-wrapper"> {/* Flex wrapper */}
          <div className="image-column">
            <img src={firstPic} alt="אלו לא כלים, זאת שולה" className="about-image" />
          </div>
          <div className="text-column">
            <h2 className="about-title">מה זו שולה?</h2>
            <p>
              שולה היא מיזם קהילתי הפועל בבית הקהילתי טבריה 15, תחת קהילת הדר, והיא ספרייה להשכרת ציוד לשימוש אישי וקהילתי
              (אירוח, תחזוקת הבית והגינה, יציאה לקמפינג, מסיבות, ארגון אירועים וכיו"ב).
            </p>
            <p>
              שולה נולדה מתוך כוונה להיטיב עם הקהילה והסביבה באופן משותף. באמצעות שולה אנחנו מקווים לבסס מוסד קהילתי שמשרת את
              הציבור המגוון של שכונת הדר והסביבה. דרך שולה, אנחנו מקווים.ות ליצור מרחב שמאפשר נתינה שאינה מבוססת על רווח, אלא על
              רווחה.
            </p>
            <p>
              שולה פועלת ללא מטרות רווח כחלק מפעילותה של קהילת הדר, וכלל הכנסותיה מוקדשות להעצמת רווחת הקהילה דרך שירות השאלת
              החפצים.
            </p>
            <p>
              מבחינתנו שולה זו דרך חיים - זו האפשרות לשנות את מערכת היחסים שיש לנו עם החפצים בחיינו: מבעלות על חפצים, לשימוש
              מבוסס צורך. שולה מבקשת לשים סוף לבוידעם והאחסון הביתי, ומצטרפת לתנועה עולמית של ספריות ציוד ומחסנים שיתופיים.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: Global Impact */}
      <section className="about-section global-section">
         {/* Add reverse-wrap to swap order: Text | Image */}
         <div className="section-content-wrapper reverse-wrap">
           <div className="image-column sdg-column">
             {/* Placeholder/Example for SDG Grid Image */}
             <img src={secondPic} alt="Sustainable Development Goals" className="about-image sdg-image"/>
              {/* OR Add the actual grid component here */}
              {/* <div className="sdg-grid"> ... icons ... </div> */}
           </div>
           <div className="text-column">
             <h3 className="about-title">שולה כחלק מתנועה עולמית</h3>
             <p>
               שולה הוקמה בפברואר 2022 כחלק מתנועה עולמית של מאות ספריות ציוד קהילתיות שהוקמו בעשור האחרון בארץ ובעולם. הרעיון של
               ספריות הציוד נולד מתוך כלכלת השיתוף החדשה (The New Collaborative Economy) והוא מקדם בתוכו מטרות פיתוח ברות-קיימא
               (Sustainable Development Goals), כפי שנוסחו ע״י האו"ם במסמך אג'נדה 2030.
             </p>
             <p>
               ספריות הציוד עוסקות בקידום תפיסת ערים וקהילות מקיימות וכן בקידום צריכה וצרכנות אחראית (מטרות 11 ו-12 בהתאמה על-פי
               אג'נדה 2030).
             </p>
             <h4 className="about-subtitle">
               תרצו להעמיק בעולם ספריות הציוד? בקרו אצל האחים והאחיות של שולה (ואלה רק כמה דוגמאות) —&gt;&gt;&gt;
             </h4>
             <ul className="about-link-list">
               <li><a href="#" target="_blank" rel="noopener noreferrer">המחסן של אליהו - יד אליהו, תל אביב</a></li>
               <li><a href="#" target="_blank" rel="noopener noreferrer">הכלבויניק - שכונת ב׳, באר שבע</a></li>
               <li><a href="#" target="_blank" rel="noopener noreferrer">ספריית ציוד בשיקאגו, ארה״ב</a></li>
             </ul>
           </div>
         </div>
      </section>

      {/* Section 3: Location */}
      <section className="about-section location-section">
        <div className="section-content-wrapper"> {/* Image | Text */}
          <div className="image-column">
              <img src={thirdPic} alt="תמונה של שולה" className="about-image" />
          </div>
          <div className="text-column">
            <h3 className="about-title">מתי ואיפה?</h3>
            <p>
              המיקום של שולה בבית הקהילתי טבריה 15 של קהילת הדר מאפשר לקהל מגוון מתוך הקהילה להכיר ולפגוש את הספרייה ואת הציוד
              שיש לה להציע להשאלה.
            </p>
            <p>
              אתם.ן מוזמנות ומוזמנים להגיע לפגוש אותנו בשולה - נחכה שם בימי ושעות הפעילות הקבועים שלנו:
              <br />
              <strong>ראשון, שלישי וחמישי</strong>
              <br />
              17:00 - 19:00
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default About;