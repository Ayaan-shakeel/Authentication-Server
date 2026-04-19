const express=require("express")
const { authInsert, verifyOTP, login, resendOTP } = require("../controller/AuthController")

const router=express.Router()

router.post("/register",authInsert)
router.post("/verify-otp",verifyOTP)
router.post("/login",login)
router.post("/resend-otp",resendOTP)


module.exports={router}