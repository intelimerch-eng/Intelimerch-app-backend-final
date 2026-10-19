const express = require("express");
const router = express.Router();
const {
    createPerk,
    getPerks,
    assignPerkToCampaign,
    updatePerk,
    deletePerk,
} = require("../controller/perk.controllers");
const auth = require("../../../middleware/auth.middleware");
const upload = require("../../../middleware/upload.middleware")



router.use(auth); // Apply authentication middleware to all routes in this router

/**
 * @swagger
 * /perks:
 *   post:
 *     summary: Create a new perk
 *     tags:
 *       - Perks
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - perkName
 *               - perkCategoryId
 *               - contentType
 *               - file
 *             properties:
 *               perkName:
 *                 type: string
 *                 example: Exclusive Behind-the-Scenes Video
 *               perkCategoryId:
 *                 type: string
 *                 description: Perk Category MongoDB ObjectId
 *                 example: 671a12345678901234567890
 *               contentType:
 *                 type: string
 *                 enum:
 *                   - audio
 *                   - video
 *                   - image
 *                   - link
 *                   - document
 *                 example: video
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File to upload for the perk
 *               description:
 *                 type: string
 *                 description: Optional description of the perk
 *     responses:
 *       201:
 *         description: Perk created successfully
 *       400:
 *         description: |
 *           Possible errors:
 *           - Required fields missing
 *           - Perk category does not exist
 *           - No file attached
 *           - Uploaded file type does not match contentType
 *           - Unsupported file type
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error occurred creating perk
 */
router.post("/", upload.single("file"), createPerk);

/**
 * @swagger
 * /perks:
 *   get:
 *     summary: Get all perks
 *     tags:
 *       - Perks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of records per page
 *     responses:
 *       200:
 *         description: Perks retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error occurred retrieving perks
 */
router.get("/", getPerks);

router.post("/:perkId/assign-to-camapign", assignPerkToCampaign)

/**
 * @swagger
 * /perks/{perkId}:
 *   patch:
 *     summary: Update a perk
 *     tags:
 *       - Perks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: perkId
 *         required: true
 *         schema:
 *           type: string
 *         description: Perk ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               perkName:
 *                 type: string
 *               perkCategoryId:
 *                 type: string
 *                 description: Perk Category ObjectId
 *               contentType:
 *                 type: string
 *                 enum:
 *                   - image
 *                   - video
 *                   - document
 *                   - link
 *               description:
 *                 type: string
 *               campaignId:
 *                 type: string
 *                 description: Campaign ObjectId
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Upload a new file to replace the existing one
 *     responses:
 *       200:
 *         description: Perk updated successfully
 *       400:
 *         description: |
 *           Possible errors:
 *           - Invalid request data
 *           - Invalid perk category
 *           - Invalid campaign
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Perk not found
 *       500:
 *         description: Internal server error occurred updating perk
 */
router.patch("/:perkId", updatePerk);

/**
 * @swagger
 * /perks/{perkId}:
 *   delete:
 *     summary: Delete a perk
 *     tags:
 *       - Perks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: perkId
 *         required: true
 *         schema:
 *           type: string
 *         description: Perk ID
 *     responses:
 *       200:
 *         description: Perk deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Perk not found
 *       500:
 *         description: Internal server error occurred deleting perk
 */
router.delete("/:perkId", deletePerk);


module.exports = router;