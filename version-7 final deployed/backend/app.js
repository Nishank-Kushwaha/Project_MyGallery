const express = require("express");
const session = require("express-session");
const passport = require("passport");
const cors = require("cors");
const path = require("path");
const rootDir = require("./utils/pathUtil");
require("dotenv").config();

const connectDB = require("./config/database");
const authRouter = require("./routes/authRouter");

const app = express();

// Connect DB
connectDB();

// 🔧 Enhanced CORS configuration
app.use(
  cors({
    origin: [
      "https://project-mygallery-frontend.onrender.com",
      "http://localhost:5173" // For local development
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    optionsSuccessStatus: 200 // For legacy browser support
  })
);

// Handle preflight requests
app.options("*", cors());

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "super-secret",
    resave: false,
    saveUninitialized: true,
    cookie: { 
      secure: process.env.NODE_ENV === 'production', // true for HTTPS, false for HTTP
      httpOnly: true, // Prevent XSS attacks
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: 'none' // Required for cross-origin cookies in production
    },
  })
);

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (for any remaining local files)
app.use(express.static(path.join(rootDir, "public")));

// 🔧 Add headers for all responses
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});

// Routes
app.use("/auth", authRouter);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", database: "Connected" });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(
    `Server running at https://project-mygallery-backend.onrender.com`
  );
});
