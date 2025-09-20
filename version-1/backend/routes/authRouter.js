const express = require("express");
const passport = require("passport");
const authController = require("../controllers/authController");

const authRouter = express.Router();

// Email/Password auth
authRouter.post("/signup", authController.postSignUp);
authRouter.post("/signin", authController.postSignIn);

// Google login trigger
authRouter.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Google callback
authRouter.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "http://localhost:5173/signin" }),
  authController.googleCallback
);

module.exports = authRouter;
