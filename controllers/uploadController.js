const asyncHandler = require("express-async-handler");
const { uploadToCloudinary } = require("../services/cloudinaryService");

const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Please select a file to upload.",
    });
  }

  const folder = req.body.folder || "intelimerch/general";

  // Do not allow arbitrary folder paths from clients.
  const allowedFolders = new Set([
    "intelimerch/general",
    "intelimerch/campaigns",
    "intelimerch/products",
    "intelimerch/artists",
  ]);

  if (!allowedFolders.has(folder)) {
    return res.status(400).json({
      success: false,
      message: "Invalid upload folder.",
    });
  }

  const uploadedFile = await uploadToCloudinary(req.file, folder);

  return res.status(201).json({
    success: true,
    message: "File uploaded successfully.",
    data: uploadedFile,
  });
});

module.exports = {
  uploadFile,
};