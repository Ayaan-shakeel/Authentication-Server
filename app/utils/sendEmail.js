const axios = require("axios");

const sendEmail = async (to, subject, message) => {
  try {
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "Auth App",
          email: process.env.EMAIL,
        },
        to: [{ email: to }],
        subject: subject,
        htmlContent: `<p>${message}</p>`,
      },
      {
        headers: {
          "api-key": process.env.API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Email sent via API successfully");
  } catch (error) {
    console.log(
      "Email API error:",
      error.response?.data || error.message
    );
  }
};

module.exports = { sendEmail };