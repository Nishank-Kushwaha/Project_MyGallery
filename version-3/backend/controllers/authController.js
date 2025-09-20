const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");
const { sendOTPEmail } = require("../services/emailService");

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
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
      `http://localhost:5173/google/callback?result=${encodeURIComponent(
        JSON.stringify(result)
      )}`
    );
  } else {
    res.redirect(
      `http://localhost:5173/google/callback?result=${encodeURIComponent(
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
