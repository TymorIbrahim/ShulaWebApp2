import React from "react";
import firstPic from "../assets/first.png";
import secondPic from "../assets/second.png";
import thirdPic from "../assets/third.png";

const About = () => {
  return (
    <div
      className="about-page"
      dir="rtl"
      style={{
        padding: "2rem",
        backgroundColor: "#f4f0e1",
        color: "#3e2d1d",
        fontFamily: "Heebo, sans-serif",
        lineHeight: "1.8",
        maxWidth: "900px",
        margin: "0 auto",
      }}
    >
      {/* 🟫 Section 1: Intro */}
      <section style={sectionStyle}>
        <img src={firstPic} alt="אלו לא כלים, זאת שולה" style={imageStyle} />
        <h2 style={titleStyle}>מה זו שולה?</h2>
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
      </section>

      {/* 🌍 Section 2: Global Impact */}
      <section style={{ ...sectionStyle, backgroundColor: "#e7dec4" }}>
        <img src={secondPic} alt="איור SDG" style={imageStyle} />
        <h2 style={titleStyle}>שולה כחלק מתנועה עולמית</h2>
        <p>
          שולה הוקמה בפברואר 2022 כחלק מתנועה עולמית של מאות ספריות ציוד קהילתיות שהוקמו בעשור האחרון בארץ ובעולם. הרעיון של
          ספריות הציוד נולד מתוך כלכלת השיתוף החדשה (The New Collaborative Economy) והוא מקדם בתוכו מטרות פיתוח ברות-קיימא
          (Sustainable Development Goals), כפי שנוסחו ע״י האו"ם במסמך אג'נדה 2030.
        </p>
        <p>
          ספריות הציוד עוסקות בקידום תפיסת ערים וקהילות מקיימות וכן בקידום צריכה וצרכנות אחראית (מטרות 11 ו-12 בהתאמה על-פי
          אג'נדה 2030).
        </p>
        <h3 style={subtitleStyle}>
          תרצו להעמיק בעולם ספריות הציוד? בקרו אצל האחים והאחיות של שולה (ואלה רק כמה דוגמאות) —&gt;&gt;&gt;
        </h3>
        <ul style={listStyle}>
          <li>המחסן של אליהו - יד אליהו, תל אביב</li>
          <li>הכלבויניק - שכונת ב׳, באר שבע</li>
          <li>ספריית ציוד בשיקאגו, ארה״ב</li>
        </ul>
      </section>

      {/* 📍 Section 3: Location */}
      <section style={sectionStyle}>
        <img src={thirdPic} alt="תמונה של שולה" style={imageStyle} />
        <h2 style={titleStyle}>מתי ואיפה?</h2>
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
      </section>
    </div>
  );
};

// ✅ Shared Styles
const sectionStyle = {
  backgroundColor: "#fffdf7",
  padding: "2rem",
  borderRadius: "16px",
  marginBottom: "2.5rem",
  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.08)",
};

const titleStyle = {
  fontSize: "1.8rem",
  marginBottom: "1rem",
  color: "#6b4e2f",
};

const subtitleStyle = {
  marginTop: "2rem",
  marginBottom: "0.5rem",
  fontWeight: "bold",
  fontSize: "1.1rem",
};

const imageStyle = {
  display: "block",
  maxWidth: "100%",
  height: "auto",
  margin: "0 auto 1.5rem auto", // Centered image!
  borderRadius: "12px",
};

const listStyle = {
  paddingRight: "1.5rem",
  listStyleType: "disc",
  marginTop: "0.5rem",
};

export default About;
