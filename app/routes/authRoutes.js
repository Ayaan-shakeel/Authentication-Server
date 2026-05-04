const express=require("express")
const { authInsert, verifyOTP, login, resendOTP, forgotPassword, resetPassword, googleLogin, updateProfile, changePassword, deleteAccount, uploadProfilePic, deleteProfilePic } = require("../controller/AuthController")
const { authMiddleware } = require("../middleware/AuthMiddleware")
const { authModel } = require("../models/AuthModel")

const router=express.Router()

router.post("/register",authInsert)
router.post("/verify-otp",verifyOTP)
router.post("/login",login)
router.post("/resend-otp",resendOTP)


router.get("/dashboard", authMiddleware, (req, res) => {
  res.json({
    message: "Welcome to dashboard",
    user: req.user,
  });
});
router.get("/me", authMiddleware, async (req, res) => {
  const user = await authModel.findById(req.user.id).select("-password");

  res.json(user);
});
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/google-login", googleLogin);
router.put("/update-profile",authMiddleware, updateProfile);
router.post("/change-password",authMiddleware, changePassword);
router.delete("/delete-account",authMiddleware, deleteAccount);
router.post("/upload-profile", authMiddleware, upload.single("image"), uploadProfilePic);
router.delete("/delete-profile", authMiddleware, deleteProfilePic);

module.exports={router}