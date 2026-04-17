const mongoose=require("mongoose");
const SChema=mongoose.Schema;
const userSchema=new SChema({
    name:{
      type:String,
      require:true,
    },
    email:{
type:String,
require:true,
unique:true

    },
    phone:{
        type:String,
        require:true,
        unique:true
    },
    password:{
        type:String,
        require:true
    },
    isVerified:{
        type:Boolean,
        require:true
    },
    otpString:{
        type:String,
        require:true
    },
    otpExpiryDate:{
        type:Date
        
    }

})
const authModel=mongoose.model("authModels",userSchema)
module.exports={authModel}