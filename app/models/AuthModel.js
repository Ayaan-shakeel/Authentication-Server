const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      default: undefined,
    },

    password: {
  type: String,
  required: function () {
    return !this.isGoogleUser;
  },
},

    isGoogleUser: {
      type: Boolean,
      default: false,
    },

    googleId: {
      type: String,
      default: null,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    otp: {
      type: String,
      default: null,
    },

    otpExpiry: {
      type: Date,
      default: null,
    },

    resetToken: {
      type: String,
      default: null,
    },

    resetTokenExpiry: {
      type: Date,
      default: null,
    },

    profilePic: {
      type: String,
      default: "",
    },

    // LOGIN HISTORY REFERENCES
    loginHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LoginHistory",
      },
    ],
  },

  {
    timestamps: true,
  }
);

const authModel = mongoose.model("authModel", userSchema);
module.exports = { authModel };