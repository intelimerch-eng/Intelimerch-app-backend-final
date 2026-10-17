const express = require("express")
const router = express.Router()
const { getTags, getCampaignTags, getArtistTags } = require("./tags.controller")
const auth = require("../../middleware/auth.middleware.js")


/**
 * @swagger
 * /tags:
 *   get:
 *     summary: Get all tags
 *     tags:
 *       - Tags
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of tags per page
 *     responses:
 *       200:
 *         description: Tags retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error occurred retrieving tags
 */
router.get("/", auth, getTags)

/**
 * @swagger
 * /tags/artist-all-tags:
 *   get:
 *     summary: Get all tags belonging to the authenticated artist
 *     tags:
 *       - Tags
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of tags per page
 *     responses:
 *       200:
 *         description: Tags retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error occurred retrieving artist tags
 */
router.get("/artist-all-tags", auth, getArtistTags)

/**
 * @swagger
 * /tags/{campaignId}:
 *   get:
 *     summary: Get all tags for a campaign
 *     tags:
 *       - Tags
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: campaignId
 *         required: true
 *         schema:
 *           type: string
 *         description: Campaign ObjectId
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of tags per page
 *     responses:
 *       200:
 *         description: Campaign tags retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Campaign not found
 *       500:
 *         description: Internal server error occurred retrieving campaign tags
 */
router.get("/:campaignId", auth, getCampaignTags)



module.exports = router
