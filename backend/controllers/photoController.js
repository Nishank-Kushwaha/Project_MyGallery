const Photo = require("../models/Photo");
const crypto = require("crypto");

const cloudinary = require("cloudinary").v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Log Cloudinary configuration (without secrets)
console.log("Cloudinary configured:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? "✅ Set" : "❌ Missing",
  api_secret: process.env.CLOUDINARY_API_SECRET ? "✅ Set" : "❌ Missing",
});

exports.uploadPhoto = async (req, res) => {
  console.log("\n=== UPLOAD PHOTO REQUEST START ===");

  try {
    // Step 1: Basic request validation
    console.log("Step 1 - Request validation:");
    console.log("- Has file:", !!req.file);
    console.log("- Has body:", !!req.body);
    console.log("- Body keys:", Object.keys(req.body || {}));

    if (!req.file) {
      console.log("❌ No file uploaded");
      return res
        .status(400)
        .json({ status: false, message: "No file uploaded" });
    }

    console.log("✅ File received:", {
      size: req.file.size,
      type: req.file.mimetype,
      name: req.file.originalname,
      hasBuffer: !!req.file.buffer,
      bufferLength: req.file.buffer?.length,
    });

    // Step 2: File type validation
    console.log("\nStep 2 - File type validation:");
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (!allowedTypes.includes(req.file.mimetype)) {
      console.log("❌ Invalid file type:", req.file.mimetype);
      return res.status(400).json({
        status: false,
        message: "Only JPEG, JPG, PNG, and GIF files are allowed",
      });
    }
    console.log("✅ File type valid:", req.file.mimetype);

    // Step 3: Parse user data
    console.log("\nStep 3 - User data parsing:");
    let parsedUserData, userObjectId;
    try {
      console.log("- Raw userData:", req.body.userData);
      parsedUserData = JSON.parse(req.body.userData);
      userObjectId = parsedUserData.data._id;
      console.log("✅ User data parsed, ID:", userObjectId);
    } catch (parseError) {
      console.log("❌ User data parse error:", parseError.message);
      return res.status(400).json({
        status: false,
        message: "Invalid user data format",
      });
    }

    // Step 4: File hash computation
    console.log("\nStep 4 - Computing file hash:");
    const fileBuffer = req.file.buffer;
    const fileHash = crypto
      .createHash("sha256")
      .update(fileBuffer)
      .digest("hex");
    console.log("✅ File hash computed:", fileHash.substring(0, 16) + "...");

    // Step 5: Check for duplicates
    console.log("\nStep 5 - Duplicate check:");
    const existingPhoto = await Photo.findOne({ hash: fileHash });
    if (existingPhoto) {
      console.log("🔄 Duplicate found, adding uploader to existing photo");
      const updated = await Photo.findByIdAndUpdate(
        existingPhoto._id,
        { $addToSet: { uploadedBy: userObjectId } },
        { new: true }
      );
      return res.json({
        status: true,
        message: "Uploader added to existing photo",
        data: updated,
      });
    }
    console.log("✅ No duplicate found, proceeding with upload");

    // Step 6: Cloudinary upload
    console.log("\nStep 6 - Cloudinary upload:");
    console.log("- Cloudinary config check:", {
      cloud_name: !!process.env.CLOUDINARY_CLOUD_NAME,
      api_key: !!process.env.CLOUDINARY_API_KEY,
      api_secret: !!process.env.CLOUDINARY_API_SECRET,
    });

    const cloudinaryResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "gallery-app",
          resource_type: "auto",
          public_id: `${Date.now()}-${req.file.originalname.split(".")[0]}`,
        },
        (error, result) => {
          if (error) {
            console.log("❌ Cloudinary error:", error);
            reject(error);
          } else {
            console.log("✅ Cloudinary upload successful:", result.secure_url);
            resolve(result);
          }
        }
      );
      uploadStream.end(fileBuffer);
    });

    // Step 7: Save to database
    console.log("\nStep 7 - Database save:");
    const photo = new Photo({
      filename: `${Date.now()}-${req.file.originalname}`,
      originalName: req.file.originalname,
      description: req.body.description || "",
      fileUrl: cloudinaryResult.secure_url,
      cloudinaryPublicId: cloudinaryResult.public_id,
      size: req.file.size,
      mimetype: req.file.mimetype,
      hash: fileHash,
      uploadedBy: [userObjectId],
    });

    const savedPhoto = await photo.save();
    console.log("✅ Photo saved to database:", savedPhoto._id);

    console.log("\n=== UPLOAD SUCCESSFUL ===");
    res.json({
      status: true,
      message: "Photo uploaded successfully to Cloudinary",
      data: savedPhoto,
    });
  } catch (error) {
    console.log("\n❌ === UPLOAD ERROR ===");
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

    res.status(500).json({
      status: false,
      message: `Upload failed: ${error.message}`,
    });
  }
};

// Delete photo for a specific user
exports.deletePhoto = async (req, res) => {
  try {
    const { imgId } = req.body;
    const { _id, name, email } = req.user;

    // Check if user is logged in
    if (!_id) {
      return res.status(401).json({
        status: false,
        message: "User not authenticated",
      });
    }

    const userId = _id;

    // Find the photo by ID
    const photo = await Photo.findById(imgId);
    if (!photo) {
      return res.status(404).json({
        status: false,
        message: "Photo not found",
      });
    }

    // Check if this user actually uploaded it
    if (!photo.uploadedBy.includes(userId)) {
      return res.status(403).json({
        status: false,
        message: "User not authorized to delete this photo",
      });
    }

    // Remove user from uploadedBy array
    photo.uploadedBy = photo.uploadedBy.filter(
      (id) => id.toString() !== userId.toString()
    );

    if (photo.uploadedBy.length === 0) {
      // If no users left, delete from Cloudinary and database
      if (photo.cloudinaryPublicId) {
        try {
          await cloudinary.uploader.destroy(photo.cloudinaryPublicId);
          console.log(`Deleted from Cloudinary: ${photo.cloudinaryPublicId}`);
        } catch (cloudinaryError) {
          console.error("Cloudinary deletion error:", cloudinaryError);
          // Continue with database deletion even if Cloudinary fails
        }
      }

      await Photo.findByIdAndDelete(imgId);
      return res.json({
        status: true,
        message: "Photo deleted completely (no users left)",
      });
    } else {
      // Otherwise, just save updated photo
      await photo.save();
      return res.json({
        status: true,
        message: "User removed from photo uploads",
        data: photo,
      });
    }
  } catch (error) {
    console.error("Delete photo error:", error);
    res.status(500).json({
      status: false,
      message: "Failed to delete photo",
    });
  }
};

// Get photos uploaded by the logged-in user
exports.getPhotos = async (req, res) => {
  try {
    const { _id } = req.user;

    // Extract the userId from login data
    const userId = _id;
    if (!userId) {
      return res.status(400).json({
        status: false,
        message: "User not authenticated",
      });
    }

    // ✅ Find photos where uploadedBy contains this userId
    const photos = await Photo.find({ uploadedBy: userId })
      .populate("uploadedBy", "name email")
      .sort({ createdAt: -1 });

    res.json({
      status: true,
      message: `Found ${photos.length} photo${photos.length !== 1 ? "s" : ""}`,
      data: photos,
    });
  } catch (error) {
    console.error("Get photos error:", error);
    res.status(500).json({
      status: false,
      message: "Failed to retrieve photos: " + error.message,
    });
  }
};
