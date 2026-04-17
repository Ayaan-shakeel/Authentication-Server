const express=require("express")
const { authInsert } = require("../controller/AuthController")

const router=express.Router()

router.post("/login",authInsert)


module.exports={router}