const express = require("express");
const session = require("express-session");
const passport = require("passport");
const authRouter = require("./routes/authRouter");
const cors = require("cors");
require("dotenv").config(); // Load environment variables

const app = express();

// Session middleware (required for passport)
app.use(
  session({
    secret: "super-secret", // change in prod
    resave: false,
    saveUninitialized: true,
  })
);

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Middleware
app.use(express.json());

// ✅ Allow frontend requests with credentials
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// ✅ All auth APIs under /auth
app.use("/auth", authRouter);

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
