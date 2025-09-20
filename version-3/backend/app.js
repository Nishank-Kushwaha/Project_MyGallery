const express = require("express");
const session = require("express-session");
const passport = require("passport");
const cors = require("cors");
require("dotenv").config(); // Load environment variables

// Import database connection
const connectDB = require("./config/database");
const authRouter = require("./routes/authRouter");

const app = express();

// Connect to database
connectDB();

// Session middleware (required for passport)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "super-secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false, // set to true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Middleware
app.use(express.json());

// CORS configuration
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Routes
app.use("/auth", authRouter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", database: "Connected" });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
