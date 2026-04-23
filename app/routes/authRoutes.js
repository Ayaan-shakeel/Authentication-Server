const express=require("express")
const { authInsert, verifyOTP, login, resendOTP, forgotPassword, resetPassword } = require("../controller/AuthController")
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


module.exports={router}