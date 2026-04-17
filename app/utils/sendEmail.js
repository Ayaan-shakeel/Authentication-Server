const nodemailer=require ("nodemailer");
require('dotenv').config()
const sendEmail = async (email, otp) => {
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
      to: email,
      subject: "OTP Verification",
      text: `Your OTP is ${otp}`,
    });

    console.log("Email sent successfully");
  } catch (error) {
    console.log("Email error:", error);
  }
};
module.exports={sendEmail}