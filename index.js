const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { router } = require("./app/routes/authRoutes");

require("dotenv").config();

const app = express(); // ✅ FIRST create app

// ✅ CORS FIX
const allowedOrigins = [
  "http://localhost:5173",
  "https://authentication-client-zeta.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed"));
      }
    },
    credentials: true,
  })
);

// ✅ VERY IMPORTANT (preflight fix)
app.options("*", cors());

app.use(express.json());

// ✅ ROUTES
app.use("/api", router);

// ✅ DB CONNECT
mongoose.connect(process.env.MongoURI).then(() => {
  console.log("Mongo DB is Connected");

  app.listen(process.env.PORT || 7000, () => {
    console.log("Server is running");
  });
});