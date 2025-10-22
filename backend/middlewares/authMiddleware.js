const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

exports.authMiddleware = (req, res, next) => {
  // Get token from cookies
  let token = req.cookies?.token;

  console.log("token in auth middleware", token);

  if (token) {
    token = decodeURIComponent(token);
  }

  console.log("🔑 Auth token:", token ? "Present" : "Missing");

  if (!token) {
    console.log("🚫 No valid auth token");
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    console.log("auth middleware : JWT_SECRET : ", JWT_SECRET);
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("✅ Token verified for:", decoded.email);

    // Attach user info to request (normalize fields from different token shapes)
    req.user = {
      _id: decoded._id,
      email: decoded.email,
      name: decoded.name || decoded.username,
      username: decoded.username || decoded.name,
      googleId: decoded.googleId,
    };

    next();
  } catch (err) {
    console.log("🚫 Token verification failed:", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};
