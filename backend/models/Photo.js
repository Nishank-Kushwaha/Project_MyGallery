// models/Photo.js - Updated model for Cloudinary storage

const mongoose = require("mongoose");

const photoSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    fileUrl: {
      type: String,
      required: true, // This will now store Cloudinary URL
    },
    // ✅ New field for Cloudinary
    cloudinaryPublicId: {
      type: String,
      required: true, // Required for Cloudinary deletion
    },
    size: {
      type: Number,
      required: true,
    },
    mimetype: {
      type: String,
      required: true,
    },
    // 🔒 Hash field for duplicate detection
    hash: {
      type: String,
      required: true,
      unique: true,
    },
    uploadedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false, // Make this optional
        default: null,
      },
    ],
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

module.exports = mongoose.model("Photo", photoSchema);
