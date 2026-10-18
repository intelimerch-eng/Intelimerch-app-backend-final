const yauzl = require("yauzl");

const SIZE_LIMITS = {
  image: 10 * 1024 * 1024,       // 10 MB
  video: 100 * 1024 * 1024,      // 100 MB
  pdf: 10 * 1024 * 1024,         // 10 MB
  document: 10 * 1024 * 1024,    // 10 MB
  spreadsheet: 10 * 1024 * 1024,// 10 MB
  text: 2 * 1024 * 1024,         // 2 MB
};

const detectType = async (buffer) => {
  const { fileTypeFromBuffer } = await import("file-type");
  return fileTypeFromBuffer(buffer);
};

const hasZipSignature = (buffer) =>
  buffer.length >= 4 &&
  buffer[0] === 0x50 &&
  buffer[1] === 0x4b &&
  [0x03, 0x05, 0x07].includes(buffer[2]) &&
  [0x04, 0x06, 0x08].includes(buffer[3]);

const validateOfficePackage = (buffer, expectedEntry) =>
  new Promise((resolve, reject) => {
    yauzl.fromBuffer(
      buffer,
      { lazyEntries: true },
      (error, zipFile) => {
        if (error) return resolve(false);

        let found = false;

        zipFile.readEntry = zipFile.readEntry.bind(zipFile);

        zipFile.on("entry", (entry) => {
          if (entry.fileName === expectedEntry) found = true;
          zipFile.readEntry();
        });

        zipFile.on("end", () => resolve(found));
        zipFile.on("error", () => resolve(false));

        zipFile.readEntry();
      }
    );
  });

const validateUploadedFile = async (req, res, next) => {
  try {
    if (!req.file) return next();

    const { buffer, mimetype, size } = req.file;

    let category;
    let valid = false;

    if (mimetype.startsWith("image/")) {
      const detected = await detectType(buffer);

      const allowedImages = {
        "image/jpeg": "image/jpeg",
        "image/png": "image/png",
        "image/webp": "image/webp",
        "image/gif": "image/gif",
      };

      valid = detected?.mime === allowedImages[mimetype];
      category = "image";
    } else if (mimetype.startsWith("video/")) {
      const detected = await detectType(buffer);

      const allowedVideos = {
        "video/mp4": "video/mp4",
        "video/webm": "video/webm",
        "video/quicktime": "video/quicktime",
      };

      valid = detected?.mime === allowedVideos[mimetype];
      category = "video";
    } else if (mimetype === "application/pdf") {
      valid = buffer.subarray(0, 5).toString() === "%PDF-";
      category = "pdf";
    } else if (
      mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      valid =
        hasZipSignature(buffer) &&
        await validateOfficePackage(buffer, "word/document.xml");
      category = "document";
    } else if (
      mimetype ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      valid =
        hasZipSignature(buffer) &&
        await validateOfficePackage(buffer, "xl/workbook.xml");
      category = "spreadsheet";
    } else if (
      mimetype === "application/msword" ||
      mimetype === "application/vnd.ms-excel"
    ) {
      // Legacy .doc/.xls formats use OLE Compound File Binary.
      valid =
        buffer.length >= 8 &&
        buffer.subarray(0, 8).equals(
          Buffer.from("D0CF11E0A1B11AE1", "hex")
        );
      category = "document";
    } else if (
      mimetype === "text/plain" ||
      mimetype === "text/csv"
    ) {
      // Text files don't have a reliable magic signature.
      // Reject binary data containing null bytes.
      valid = !buffer.includes(0);
      category = "text";
    }

    if (!valid) {
      return res.status(400).json({
        success: false,
        message: "The file content does not match its declared file type.",
      });
    }

    if (size > SIZE_LIMITS[category]) {
      return res.status(413).json({
        success: false,
        message: `File exceeds the ${SIZE_LIMITS[category] / (1024 * 1024)} MB limit for this file type.`,
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = validateUploadedFile;