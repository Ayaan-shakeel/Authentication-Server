const mongoose = require("mongoose");

const loginHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "authModel",
      required: true,
    },

    device: String,

    ip: String,

    token: String,

    isActive: {
      type: Boolean,
      default: true,
    },

    time: {
      type: Date,
      default: Date.now,
    },
  },

  {
    timestamps: true,
  }
);
const LoginHistory = mongoose.model("LoginHistory", loginHistorySchema);
module.exports={LoginHistory}