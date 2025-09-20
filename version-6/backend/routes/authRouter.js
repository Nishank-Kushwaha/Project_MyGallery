const express = require("express");
const multer = require("multer");
const passport = require("passport");
const path = require("path"); // ✅ Missing import added
const authController = require("../controllers/authController");

const authRouter = express.Router();

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../public/uploads")); // ✅ Fixed path reference
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

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

// Email/Password auth
authRouter.post("/signup", authController.postSignUp);
authRouter.post("/signin", authController.postSignIn);

// Upload Photo - ✅ Moved before general middleware to avoid conflicts
authRouter.post(
  "/uploadphoto",
  upload.single("photo"),
  authController.uploadPhoto
);

// Get Photos - retrieve all uploaded photos
authRouter.post("/get-photos", authController.getPhotos);

// Delete Photo
authRouter.post("/delete-photo", authController.deletePhoto);

// General middleware for debugging (moved after upload route)
authRouter.use((req, res, next) => {
  console.log("Incoming headers:", req.headers["content-type"]);
  next();
});

// Forgot Password routes
authRouter.post("/forgot-password", authController.forgotPassword);
authRouter.post("/verify-otp", authController.verifyOTP);
authRouter.post("/reset-password", authController.resetPassword);

// Google login trigger
authRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google callback
authRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:5173/signin",
  }),
  authController.googleCallback
);

module.exports = authRouter;
