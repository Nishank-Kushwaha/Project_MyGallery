const express = require("express");
const multer = require("multer");
const passport = require("passport");
const path = require("path");
const fs = require("fs");
const authController = require("../controllers/authController");

const authRouter = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "../public/uploads");
if (!fs.existsSync(path.join(__dirname, "../public"))) {
  fs.mkdirSync(path.join(__dirname, "../public"), { recursive: true });
}
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage config - use memory storage for better cloud deployment
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

// Email/Password auth routes
authRouter.post("/signup", authController.postSignUp);
authRouter.post("/signin", authController.postSignIn);

// Forgot Password routes
authRouter.post("/forgot-password", authController.forgotPassword);
authRouter.post("/verify-otp", authController.verifyOTP);
authRouter.post("/reset-password", authController.resetPassword);

// Photo management routes
authRouter.post(
  "/uploadphoto",
  upload.single("photo"),
  authController.uploadPhoto
);
authRouter.post("/get-photos", authController.getPhotos);
authRouter.post("/delete-photo", authController.deletePhoto);

// Google OAuth routes - Fixed route patterns
authRouter.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

const clientUrl = (process.env.CLIENT_URL || "").trim();
const failureRedirect = clientUrl
  ? `${clientUrl}/signin`
  : "https://project-mygallery-frontend.onrender.com/signin";

authRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect,
    session: true,
  }),
  authController.googleCallback
);

// Debug middleware
authRouter.use((req, res, next) => {
  console.log("Auth route accessed:", req.method, req.path);
  next();
});

module.exports = authRouter;
