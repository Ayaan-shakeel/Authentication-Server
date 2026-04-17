const express=require("express")
const { authInsert, verifyOTP, login } = require("../controller/AuthController")

const router=express.Router()

router.post("/register",authInsert)
router.post("/verify",verifyOTP)
router.post("/login",login)


module.exports={router}