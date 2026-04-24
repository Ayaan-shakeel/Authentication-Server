const express=require("express");
const mongoose=require("mongoose");
const cors=require("cors");
const { router } = require("./app/routes/authRoutes");

require("dotenv").config()

const app=express()
app.use(express.json())
app.use(cors(
    {
  origin:[
      "http://localhost:5173",   
      "https://authentication-client-zeta.vercel.app/",
] ,
  credentials: true
}
))
app.use("/api",router)

mongoose.connect(process.env.MongoURI).then(()=>{
    console.log("Mongo DB is Connected")
    app.listen(process.env.PORT || 7000, (PORT=process.env.PORT)=>{
        console.log("Server is running on PORT no",PORT)
    })
})