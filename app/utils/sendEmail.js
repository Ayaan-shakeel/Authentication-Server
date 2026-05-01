const nodemailer=require ("nodemailer");
require('dotenv').config()
const sendEmail = async (to, subject, message) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
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