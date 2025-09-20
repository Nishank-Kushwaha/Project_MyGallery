const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");
const { sendOTPEmail } = require("../services/emailService");
const mongoose = require("mongoose");
const fs = require("fs").promises;
const path = require("path");
const cloudinary = require("cloudinary").v2;
const crypto = require("crypto");

const Photo = require("../models/Photo");

const fs_ = require("fs");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL, // must be full URL
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists with this Google ID
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          // Check if user exists with this email (for account linking)
          const existingUser = await User.findOne({
            email: profile.emails?.[0]?.value,
          });

          if (existingUser) {
            // Link Google account to existing user
            existingUser.googleId = profile.id;
            user = await existingUser.save();
          } else {
            // Create new user
            user = new User({
              googleId: profile.id,
              name: profile.displayName,
              email: profile.emails?.[0]?.value || "",
            });
            await user.save();
          }
        }

        return done(null, user);
      } catch (error) {
        console.error("Google OAuth error:", error);
        return done(error, null);
      }
    }
  )
);

// Passport session handling
passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google callback controller
exports.googleCallback = (req, res) => {
  const user = req.user;
  const baseUrl = process.env.CLIENT_URL || "http://localhost:5173";

  if (user) {
    const result = {
      status: true,
      message: "Google login successful",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        googleId: user.googleId,
      },
    };
    res.redirect(
      `${baseUrl}/google/callback?result=${encodeURIComponent(
        JSON.stringify(result)
      )}`
    );
  } else {
    res.redirect(
      `${baseUrl}/google/callback?result=${encodeURIComponent(
        JSON.stringify({
          status: false,
          message: "Google login failed",
        })
      )}`
    );
  }
};

// Email/Password Signup
exports.postSignUp = async (req, res) => {
  try {
    console.log("Post for sign up:", req.body);

    const { name, email, password, confirmPassword } = req.body;

    // Basic validation
    if (password !== confirmPassword) {
      return res.status(400).json({
        status: false,
        message: "Passwords do not match",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: false,
        message: "Email already registered",
      });
    }

    // Create new user
    const user = new User({ name, email, password });
    const savedUser = await user.save();

    // Remove password from response
    const userResponse = {
      _id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
      createdAt: savedUser.createdAt,
    };

    res.status(201).json({
      status: true,
      message: "Signup successful",
      data: userResponse,
    });
  } catch (error) {
    console.error("Signup error:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        status: false,
        message: messages.join(", "),
      });
    }

    res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

// Email/Password Signin
exports.postSignIn = async (req, res) => {
  try {
    console.log("Post for sign in:", req.body);

    const { email, password, rememberMe } = req.body;

    // Find user and validate password
    const user = await User.findByEmailAndPassword(email, password);

    if (user) {
      // Remove password from response
      const userResponse = {
        _id: user._id,
        name: user.name,
        email: user.email,
        googleId: user.googleId,
      };

      res.json({
        status: true,
        message: "Login successful",
        data: userResponse,
        rememberMe,
      });
    } else {
      res.status(401).json({
        status: false,
        message: "Invalid email or password",
      });
    }
  } catch (error) {
    console.error("Signin error:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

// Forgot Password - Send OTP
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: false,
        message: "Email is required",
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "No account found with this email address",
      });
    }

    // Generate OTP
    const otp = user.generateResetOTP();
    await user.save();

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp, user.name);

    if (emailSent) {
      res.json({
        status: true,
        message: "OTP sent to your email address",
        email: email,
      });
    } else {
      res.status(500).json({
        status: false,
        message: "Failed to send OTP email. Please try again.",
      });
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        status: false,
        message: "Email and OTP are required",
      });
    }

    // Find user and verify OTP
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    if (!user.verifyResetOTP(otp)) {
      return res.status(400).json({
        status: false,
        message: "Invalid or expired OTP",
      });
    }

    res.json({
      status: true,
      message: "OTP verified successfully",
      email: email,
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword, confirmNewPassword } = req.body;

    if (!email || !otp || !newPassword || !confirmNewPassword) {
      return res.status(400).json({
        status: false,
        message: "All fields are required",
      });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        status: false,
        message: "Passwords do not match",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        status: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Find user and verify OTP
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    if (!user.verifyResetOTP(otp)) {
      return res.status(400).json({
        status: false,
        message: "Invalid or expired OTP",
      });
    }

    // Update password and clear OTP fields
    user.password = newPassword;
    user.resetPasswordOTP = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({
      status: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

exports.uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ status: false, message: "No file uploaded" });
    }

    // ✅ Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        status: false,
        message: "Only JPEG, JPG, PNG, and GIF files are allowed",
      });
    }

    // ✅ Parse user data
    const parsedUserData = JSON.parse(req.body.userData);
    const userObjectId = parsedUserData.data._id;

    // ✅ Compute hash from uploaded file
    const filePath = req.file.path;
    const fileBuffer = fs_.readFileSync(filePath);
    const fileHash = crypto
      .createHash("sha256")
      .update(fileBuffer)
      .digest("hex");

    // ✅ Check for duplicates first
    const existingPhoto = await Photo.findOne({ hash: fileHash });

    if (existingPhoto) {
      // Add uploader to existing photo and delete local file
      const updated = await Photo.findByIdAndUpdate(
        existingPhoto._id,
        { $addToSet: { uploadedBy: userObjectId } },
        { new: true }
      ).populate("uploadedBy");

      // Delete the uploaded file since we're using existing Cloudinary image
      fs_.unlinkSync(filePath);

      return res.json({
        status: true,
        message: "Uploader added to existing photo",
        data: updated,
      });
    }

    // ✅ Upload to Cloudinary
    const cloudinaryResult = await cloudinary.uploader.upload(filePath, {
      folder: "gallery-app", // Optional: organize uploads in a folder
      resource_type: "auto", // Automatically detect file type
      public_id: `${Date.now()}-${req.file.originalname.split(".")[0]}`, // Custom public_id
    });

    // ✅ Delete local file after successful Cloudinary upload
    fs_.unlinkSync(filePath);

    // ✅ Save new photo with Cloudinary data
    const photo = new Photo({
      filename: req.file.filename, // Keep original filename for reference
      originalName: req.file.originalname,
      description: req.body.description || "",
      fileUrl: cloudinaryResult.secure_url, // Use Cloudinary URL
      cloudinaryPublicId: cloudinaryResult.public_id, // Store for deletion
      size: req.file.size,
      mimetype: req.file.mimetype,
      hash: fileHash,
      uploadedBy: [userObjectId],
    });

    const savedPhoto = await photo.save();

    res.json({
      status: true,
      message: "Photo uploaded successfully to Cloudinary",
      data: savedPhoto,
    });
  } catch (error) {
    console.error("Upload error:", error);

    // Clean up local file if it exists and upload failed
    if (req.file && req.file.path) {
      try {
        fs_.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error("Error cleaning up file:", cleanupError);
      }
    }

    res.status(500).json({
      status: false,
      message: "Internal server error: " + error.message,
    });
  }
};

// Delete photo for a specific user
exports.deletePhoto = async (req, res) => {
  try {
    const { imgId, loginStatus, loginData } = req.body;

    // Check if user is logged in
    if (!loginStatus || !loginData) {
      return res.status(401).json({
        status: false,
        message: "User not authenticated",
      });
    }

    const userId = loginData.data._id;

    // Find the photo by ID
    const photo = await Photo.findById(imgId);
    if (!photo) {
      return res.status(404).json({
        status: false,
        message: "Photo not found",
      });
    }

    // Check if this user actually uploaded it
    if (!photo.uploadedBy.includes(userId)) {
      return res.status(403).json({
        status: false,
        message: "User not authorized to delete this photo",
      });
    }

    // Remove user from uploadedBy array
    photo.uploadedBy = photo.uploadedBy.filter(
      (id) => id.toString() !== userId.toString()
    );

    if (photo.uploadedBy.length === 0) {
      // If no users left, delete from Cloudinary and database
      if (photo.cloudinaryPublicId) {
        try {
          await cloudinary.uploader.destroy(photo.cloudinaryPublicId);
          console.log(`Deleted from Cloudinary: ${photo.cloudinaryPublicId}`);
        } catch (cloudinaryError) {
          console.error("Cloudinary deletion error:", cloudinaryError);
          // Continue with database deletion even if Cloudinary fails
        }
      }

      await Photo.findByIdAndDelete(imgId);
      return res.json({
        status: true,
        message: "Photo deleted completely (no users left)",
      });
    } else {
      // Otherwise, just save updated photo
      await photo.save();
      return res.json({
        status: true,
        message: "User removed from photo uploads",
        data: photo,
      });
    }
  } catch (error) {
    console.error("Delete photo error:", error);
    res.status(500).json({
      status: false,
      message: "Failed to delete photo",
    });
  }
};

// Get photos uploaded by the logged-in user
exports.getPhotos = async (req, res) => {
  try {
    const { userStatus, userData } = req.body;

    console.log("UserStatus in getPhotos:", userStatus);
    console.log("UserData in getPhotos:", userData);

    // Parse user data safely
    let parsedUserData = userData;
    if (typeof userData === "string") {
      parsedUserData = JSON.parse(userData);
    }

    // Extract the userId from login data
    const userId = parsedUserData?.data?._id;
    if (!userId) {
      return res.status(400).json({
        status: false,
        message: "User ID not provided",
      });
    }

    // ✅ Find photos where uploadedBy contains this userId
    const photos = await Photo.find({ uploadedBy: userId })
      .populate("uploadedBy", "name email")
      .sort({ createdAt: -1 });

    res.json({
      status: true,
      message: `Found ${photos.length} photo${photos.length !== 1 ? "s" : ""}`,
      data: photos,
    });
  } catch (error) {
    console.error("Get photos error:", error);
    res.status(500).json({
      status: false,
      message: "Failed to retrieve photos: " + error.message,
    });
  }
};

// Helper function to get mime type from extension
function getMimeType(extension) {
  const mimeTypes = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
  };
  return mimeTypes[extension] || "image/jpeg";
}
