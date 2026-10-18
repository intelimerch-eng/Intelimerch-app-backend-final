const express = require("express");
const auth = require("../middleware/auth.middleware.js");
const upload = require("../middleware/upload.middleware.js");
const { uploadFile } = require("../controllers/uploadController");

const router = express.Router();

router.post("/upload", auth, upload.single("file"), uploadFile);

module.exports = router;