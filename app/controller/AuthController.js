const bcrypt=require ("bcryptjs");
const { generateOTP } = require("../utils/otpGenerator.js");
const { sendEmail }=require("../utils/sendEmail.js");
const { authModel } = require("../models/AuthModel.js");
const jwt=require("jsonwebtoken");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");



const authInsert = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existingUser = await authModel.findOne({ email });
if (existingUser) {

  if (!existingUser.isVerified) {
    
    const otp = generateOTP();

    existingUser.otp = otp;
    existingUser.otpExpiry = Date.now() + 5 * 60 * 1000;

    await existingUser.save();

    await sendEmail(
      email,
      "OTP Verification",
      `Your OTP is ${otp}`
    );

    return res.status(200).json({
      message: "User exists but not verified. OTP resent.",
    });
  }

  return res.status(400).json({ message: "User already exists" });
}

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = generateOTP();

    const user = await authModel.create({
      name,
      email,
      password: hashedPassword,
      otp,
      otpExpiry: Date.now() + 5 * 60 * 1000,
    });

    await sendEmail(
  email,
  "OTP Verification",
  `Your OTP is ${otp}`
);

    res.json({ message: "OTP sent to email" });

  } catch (err) {
    console.log("REGISTER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
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
  try {
    const { email, password } = req.body;

    const user = await authModel.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.isVerified) {
      return res.status(400).json({ message: "Please verify your email first" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(400).json({ message: "Wrong password" });

    const useragent = require("useragent");
    const agent = useragent.parse(req.headers["user-agent"]);
    const device = agent.toString();
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    await sendEmail(
      email,
      "New Login Alert - Auth App",
      `New Login Detected:

Device: ${device}
IP: ${ip}
Time: ${new Date().toLocaleString()}`
    );

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, user });

  } catch (err) {
    console.log("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
const resendOTP = async (req, res) => {
  const { email } = req.body;

  const user = await authModel.findOne({ email });

  const otp = generateOTP();

  user.otp = otp;
  user.otpExpiry = Date.now() + 5 * 60 * 1000;

  await user.save();
  await sendEmail(
  email,
  "OTP Verification",
  `Your OTP is ${otp}`
);

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

 await sendEmail(
  email,
  "Reset Password Link",
  `Click here to reset your password:\n\n${resetLink}`
);
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

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
if (!credential) {
      return res.status(400).json({ message: "No credential received" });
    }
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
const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const user = await authModel.findByIdAndUpdate(
      req.user.id,
      { name },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Profile updated successfully",
      user,
    });

  } catch (error) {
    console.log("Update Profile Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const changePassword = async (req, res) => {
  try {
    const userId = req.user.id; 
    const { password } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    await authModel.findByIdAndUpdate(userId, {
      password: hashed,
    });

    res.json({ message: "Password updated successfully" });

  } catch (err) {
    res.status(500).json({ message: "Error updating password" });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { password } = req.body;

    const user = await authModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.password === "google-auth") {
      return res.status(400).json({
        message: "Google account cannot use password. Use Google confirmation."
      });
    }
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    await authModel.findByIdAndDelete(userId);

    res.json({ message: "Account deleted successfully" });

  } catch (err) {
    console.log("DELETE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
const uploadProfilePic = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await authModel.findByIdAndUpdate(
      userId,
      { profilePic: req.file.path },
      { new: true }
    );

    res.json({
      message: "Profile picture updated",
      user,
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Upload failed" });
  }
};
const deleteProfilePic = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await authModel.findByIdAndUpdate(
      userId,
      { profilePic: "" },
      { new: true }
    );

    res.json({
      message: "Profile picture removed",
      user,
    });

  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
};
module.exports={authInsert,verifyOTP,login,resendOTP,forgotPassword,resetPassword,googleLogin,updateProfile,changePassword,deleteAccount,uploadProfilePic,deleteProfilePic}