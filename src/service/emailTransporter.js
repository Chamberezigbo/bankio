const nodemailer = require("nodemailer");
require("dotenv").config();

// 📩 Setup email transporter//

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,  // your provider's SMTP server
  port: 465,                    // usually 465 (SSL) or 587 (TLS)
  secure: true,                 // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,  // your actual email password (not an app password)
  },
});

/**
 * Send an email
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - HTML email content
 */

// 🛠 Configure Handlebars for dynamic templates//
const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `'America First Credit' <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`✅ Email sent to ${to}`);
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
};

module.exports = { sendEmail };
