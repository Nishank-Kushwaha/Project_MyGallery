// models/Photo.js - Create this new model for better photo management

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
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    mimetype: {
      type: String,
      required: true,
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
