const express = require("express");
const cors = require("cors");
const path = require("path");
const rootDir = require("./utils/pathUtil");
require("dotenv").config();
const cookieParser = require("cookie-parser");

const connectDB = require("./config/database");
const authRouter = require("./routes/authRouter");
const photoRouter = require("./routes/photoRouter");

const app = express();

// Connect DB
connectDB();

// 🔧 Enhanced CORS configuration
app.use(
  cors({
    origin: [process.env.CLIENT_URL],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    optionsSuccessStatus: 200, // For legacy browser support
  })
);

app.use(cookieParser());

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (for any remaining local files)
app.use(express.static(path.join(rootDir, "public")));

// Routes
app.use("/auth", authRouter);
app.use("/photo", photoRouter);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", database: "Connected" });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
