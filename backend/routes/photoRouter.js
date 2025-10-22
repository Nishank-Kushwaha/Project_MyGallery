const express = require("express");
const multer = require("multer");
const photoController = require("../controllers/photoController");
const { authMiddleware } = require("../middlewares/authMiddleware");

const photoRouter = express.Router();

// Debug middleware
photoRouter.use((req, res, next) => {
  console.log("Photo route accessed:", req.method, req.path);
  next();
});

// Multer storage config - use memory storage for better cloud deployment
const storage = multer.memoryStorage();

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

// Photo management routes
photoRouter.post(
  "/uploadphoto",
  upload.single("photo"),
  authMiddleware,
  photoController.uploadPhoto
);
photoRouter.post("/get-photos", authMiddleware, photoController.getPhotos);
photoRouter.post("/delete-photo", authMiddleware, photoController.deletePhoto);

module.exports = photoRouter;
