const express=require("express");
const mongoose=require("mongoose");
const cors=require("cors")
require("dotenv").config()

const app=express()
app.use(express.json())
app.use(cors())

mongoose.connect(process.env.MongoURI).then(()=>{
    console.log("Mongo DB is Connected")
    app.listen(process.env.PORT || 7000, (PORT=process.env.PORT)=>{
        console.log("Server is running on PORT no",PORT)
    })
})