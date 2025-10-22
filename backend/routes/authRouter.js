const express = require("express");
const passport = require("passport");
const authController = require("../controllers/authController");
const { authMiddleware } = require("../middlewares/authMiddleware");

const authRouter = express.Router();

// Debug middleware
authRouter.use((req, res, next) => {
  console.log("Auth route accessed:", req.method, req.path);
  next();
});

// Email/Password auth routes
authRouter.post("/signup", authController.postSignUp);
authRouter.post("/signin", authController.postSignIn);

// Forgot Password routes
authRouter.post("/forgot-password", authController.forgotPassword);
authRouter.post("/verify-otp", authController.verifyOTP);
authRouter.post("/reset-password", authController.resetPassword);

// Update Password
authRouter.post(
  "/update-password",
  authMiddleware,
  authController.updatePassword
);

// User details and logout
authRouter.post("/logout", authMiddleware, authController.getLogout);
authRouter.get("/me", authMiddleware, authController.getMe);

// Google OAuth routes - Fixed route patterns
authRouter.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);
const clientUrl = (process.env.CLIENT_URL || "").trim();
const failureRedirect = `${clientUrl}/signin`;

authRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect,
    session: false,
  }),
  authController.googleCallback
);

module.exports = authRouter;
