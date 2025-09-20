const fs = require("fs");
const path = require("path");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const Users = require("../models/users");

const filePath = path.join(__dirname, "../data/users.json");

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "http://localhost:8080/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      fs.readFile(filePath, (err, data) => {
        let users = [];
        if (!err && data.length > 0) {
          users = JSON.parse(data);
        }

        let user = users.find((u) => u.googleId === profile.id);
        if (!user) {
          user = {
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails?.[0]?.value || "",
          };
          users.push(user);
          fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
        }
        return done(null, user);
      });
    }
  )
);

// Passport session handling
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// ✅ Google callback controller
exports.googleCallback = (req, res) => {
  const user = req.user;
  if (user) {
    const result = {
      status: true,
      message: "Google login successful",
      data: user,
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

// ✅ Email/Password Signup
exports.postSignUp = (req, res) => {
  console.log("Post for sign up:", req.body);

  const user = new Users(req.body);
  user.save((success) => {
    if (success) {
      res.json({
        status: true,
        message: "Signup successful",
        data: req.body,
      });
    } else {
      res.status(500).json({ status: false, message: "Failed to save user" });
    }
  });
};

// ✅ Email/Password Signin
exports.postSignIn = (req, res) => {
  console.log("Post for sign in:", req.body);

  const { email, password, rememberMe } = req.body;

  Users.fetchByEmailandPassword(email, password, (user) => {
    if (user) {
      res.json({
        status: true,
        message: "Login successful",
        data: user,
        rememberMe,
      });
    } else {
      res.json({
        status: false,
        message: "Invalid email or password",
      });
    }
  });
};
