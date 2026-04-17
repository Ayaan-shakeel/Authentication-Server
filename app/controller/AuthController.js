const bcrypt=require ("bcryptjs");
const { generateOTP } = require("../utils/otpGenerator.js");
const { sendEmail }=require("../utils/sendEmail.js");
const { authModel } = require("../models/AuthModel.js");

const authInsert = async (req, res) => {
  const { name, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const otp = generateOTP();

  const user = await authModel.create({
    name,
    email,
    password: hashedPassword,
    otp,
    otpExpiry: Date.now() + 5 * 60 * 1000,
  });

  await sendEmail(email, otp);

  res.json({ message: "OTP sent to email" });
};
module.exports={authInsert}