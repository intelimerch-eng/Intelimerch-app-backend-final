
const express = require("express");
const router = express.Router();
const { createCategory, getPerkCategories } = require("../controller/admin.controllers");
const auth = require("../../../middleware/auth.middleware")


// dashboard

// add creator

// get creators

// create session -> admin/artist/

// delete session -> admin/artist/

// delete creator

router.post("/perks/categories", auth, createCategory);


router.get("/perks/categories", auth, getPerkCategories)




module.exports = router;

