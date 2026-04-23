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
        unique:true,
        sparse:true
    },
    password:{
        type:String,
        require:true
    },
    isVerified:{
        type:Boolean,
        default:false,
        require:true
    },
    otp:{
        type:String,
        require:true
    },
    otpExpiry:{
        type:Date
        
    },
    resetToken:{
        type:String
    },
    resetTokenExpiry:{
        type:Date
    }

})
const authModel=mongoose.model("authModels",userSchema)
module.exports={authModel}