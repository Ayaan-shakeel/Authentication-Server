const nodemailer = require("nodemailer");
require("dotenv").config();

const sendEmail = async (to, subject, message) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    await transporter.verify();
    console.log("SMTP connected successfully");

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