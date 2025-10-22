const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");
const { sendOTPEmail } = require("../services/emailService");
const jwt = require("jsonwebtoken");

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
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

// Google callback controller
exports.googleCallback = (req, res) => {
  const user = req.user;
  const baseUrl = process.env.CLIENT_URL;

  if (user) {
    // Create JWT
    const token = jwt.sign(
      {
        _id: user._id,
        name: user.name,
        email: user.email,
        googleId: user.googleId,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("token in google auth", token);

    // Set as httpOnly cookie
    const isProd = process.env.NODE_ENV === "production";
    const cookieOptions = {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };
    res.cookie("token", token, cookieOptions);

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

      // Create JWT
      const token = jwt.sign(userResponse, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      console.log("token in sign in", token);

      // Set as httpOnly cookie
      const isProd = process.env.NODE_ENV === "production";
      const cookieOptions = {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      };
      res.cookie("token", token, cookieOptions);

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

// Verify OTP - verify OTP
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

// Reset Password - change password
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

// Update Password - change password (for authenticated users)
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;
    const { email } = req.user;

    // Validate all fields are present
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({
        status: false,
        message:
          "Current password, new password, and confirmation are required",
      });
    }

    // Validate new passwords match
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        status: false,
        message: "New passwords do not match",
      });
    }

    // Validate new password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        status: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Prevent same password
    if (currentPassword === newPassword) {
      return res.status(400).json({
        status: false,
        message: "New password must be different from current password",
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    // Check if user has a password (might be Google OAuth only)
    if (!user.password && user.googleId) {
      return res.status(400).json({
        status: false,
        message:
          "Cannot update password for Google OAuth accounts. Please use Google to manage your account.",
      });
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: false,
        message: "Current password is incorrect",
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Optional: Clear any existing reset tokens
    user.resetPasswordOTP = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({
      status: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Update password error:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

exports.getLogout = async (req, res) => {
  try {
    // ✅ Clear the httpOnly cookie
    const isProd = process.env.NODE_ENV === "production";
    res.clearCookie("token", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
    });

    return res.status(200).json({ message: "Logout successful", status: true });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getMe = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "User data retrieved",
      data: {
        _id: user._id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
      status: true,
    });
  } catch (error) {
    console.error("❌ Error fetching user:", error);
    return res.status(500).json({ message: "Error fetching user data" });
  }
};
