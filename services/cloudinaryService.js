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
  const startedAt = Date.now();

  console.log(
    `[cloudinary] upload start folder=${folder} type=${resourceType} mimetype=${file.mimetype} bytes=${file.buffer.length} name=${file.originalname}`
  );

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
        const elapsedMs = Date.now() - startedAt;

        if (error) {
          console.error(
            `[cloudinary] upload FAILED after ${elapsedMs}ms: ${error.message || error}`
          );
          return reject(error);
        }

        console.log(
          `[cloudinary] upload ok in ${elapsedMs}ms -> ${result.secure_url}`
        );

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

    uploadStream.on("error", (streamError) => {
      console.error(
        `[cloudinary] upload stream error after ${Date.now() - startedAt}ms: ${streamError.message || streamError}`
      );
    });

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