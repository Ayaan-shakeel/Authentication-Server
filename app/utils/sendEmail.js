const nodemailer=require ("nodemailer");
require('dotenv').config()
const sendEmail = async (to, subject, message) => {
  try {
    const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});
    await transporter.sendMail({
      from: `"Auth App" <${process.env.EMAIL}>`,
      to,
      subject,
      text: message,
    });

    console.log("Email sent:", subject);

  } catch (error) {
    console.log("Email error:", error.message);
  }
};
module.exports = { sendEmail };