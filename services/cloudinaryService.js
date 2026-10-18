// services/cloudinaryService.js

const { Readable } = require("stream");
const cloudinary = require("../config/cloudinary");

const getResourceType = (mimetype) => {
  if (mimetype.startsWith("image/")) return "image";

  // Cloudinary handles audio through its video resource type.
  if (
    mimetype.startsWith("video/") ||
    mimetype.startsWith("audio/")
  ) {
    return "video";
  }

  // PDFs and Office documents are stored as raw files.
  return "raw";
};

const uploadToCloudinary = (file, folder = "intelimerch") => {
  if (!file?.buffer) {
    throw new Error("A valid file is required.");
  }

  const resourceType = getResourceType(file.mimetype);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        filename_override: file.originalname,
        use_filename: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error) return reject(error);

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          resourceType: result.resource_type,
          format: result.format,
          bytes: result.bytes,
          originalName: file.originalname,
        });
      }
    );

    Readable.from(file.buffer).pipe(uploadStream);
  });
};

const deleteFromCloudinary = async (publicId, resourceType) => {
  if (!publicId || !["image", "video", "raw"].includes(resourceType)) {
    throw new Error(
      "A valid Cloudinary public ID and resource type are required."
    );
  }

  return cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
    invalidate: true,
  });
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
};