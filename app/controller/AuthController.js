const bcrypt=require ("bcryptjs");
const { generateOTP } = require("../utils/otpGenerator.js");
const { sendEmail }=require("../utils/sendEmail.js");
const { authModel } = require("../models/AuthModel.js");
const jwt=require("jsonwebtoken");
const crypto = require("crypto");


const authInsert = async (req, res) => {
  const { name, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const otp = generateOTP();
  const existingUser = await authModel.findOne({ email });


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


  console.log("Entered OTP:", otp);
  console.log("Stored OTP:", user?.otp);
  console.log("Expiry:", user?.otpExpiry);
  console.log("Now:", Date.now());

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
 
  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({ message: "Email verified successfully",
    token,
   });
};



const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await authModel.findOne({ email });

  if (!user) return res.status(404).json({ message: "User not found" });
  if (!user.isVerified) {
  return res.status(400).json({ message: "Please verify your email first" });
}

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) return res.status(400).json({ message: "Wrong password" });

 const token = jwt.sign(
  { id: user._id },
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);

  res.json({ token, user });
};

const resendOTP = async (req, res) => {
  const { email } = req.body;

  const user = await authModel.findOne({ email });

  const otp = generateOTP();

  user.otp = otp;
  user.otpExpiry = Date.now() + 5 * 60 * 1000;

  await user.save();
  await sendEmail(email, otp);

  res.json({ message: "OTP resent" });
};


const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await authModel.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const token = crypto.randomBytes(32).toString("hex");

  user.resetToken = token;
  user.resetTokenExpiry = Date.now() + 10 * 60 * 1000;

  await user.save();

 const resetLink = `https://authentication-client-zeta.vercel.app/reset-password/${token}`;

  await sendEmail(email, `Reset your password: ${resetLink}`);

  res.json({ message: "Reset link sent to email" });
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const user = await authModel.findOne({
    resetToken: token,
    resetTokenExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  user.password = await bcrypt.hash(password, 10);
  user.resetToken = null;
  user.resetTokenExpiry = null;

  await user.save();

  res.json({ message: "Password reset successful" });
};
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const { email, name } = payload;

    let user = await authModel.findOne({ email });

    if (!user) {
      user = await authModel.create({
        name,
        email,
        password: "google-auth",
        isVerified: true,
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, user });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Google login failed" });
  }
};

module.exports={authInsert,verifyOTP,login,resendOTP,forgotPassword,resetPassword,googleLogin}