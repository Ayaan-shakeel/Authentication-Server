const bcrypt=require ("bcryptjs");
const { generateOTP } = require("../utils/otpGenerator.js");
const { sendEmail }=require("../utils/sendEmail.js");
const { authModel } = require("../models/AuthModel.js");
const jwt=require("jsonwebtoken");

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

const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  const user = await authModel.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user.otp !== otp || user.otpExpiry < Date.now()) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  user.isVerified = true;
  user.otp = null;
  user.otpExpiry = null;

  await user.save();

  res.json({ message: "Email verified successfully" });
};



const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await authModel.findOne({ email });

  if (!user) return res.status(404).json({ message: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) return res.status(400).json({ message: "Wrong password" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.json({ token, user });
};
module.exports={authInsert,verifyOTP,login}