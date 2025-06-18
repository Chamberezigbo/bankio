const nodemailer = require("nodemailer");
require("dotenv").config();

// 📩 Setup email transporter//

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
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
      from: `'Bankio' <${process.env.EMAIL_USER}>`,
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
