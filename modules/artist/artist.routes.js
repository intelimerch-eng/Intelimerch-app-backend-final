const express = require("express")
const router = express.Router()
const { artistFanDashboard } = require("./artist.controller")
const auth = require("../../middleware/auth.middleware")

/**
 * @swagger
 * /artist/fan/dashboard:
 *   get:
 *     summary: Get artist fan dashboard
 *     description: Retrieves artist-specific fan statistics, including total fans, total merchandise sold, unique products, repeat buyers, and a paginated list of fans. Supports searching and filtering by merchandise type, campaign, and purchase date.
 *     tags:
 *       - Artist
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search fans by name or email.
 *       - in: query
 *         name: merchType
 *         schema:
 *           type: string
 *         description: Filter fans by merchandise product type ID.
 *       - in: query
 *         name: campaignId
 *         schema:
 *           type: string
 *         description: Filter fans by a campaign belonging to the authenticated artist.
 *       - in: query
 *         name: purchaseDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter fans by purchase or activation date.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Page number.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 100
 *         description: Number of fans per page.
 *     responses:
 *       200:
 *         description: Artist fan dashboard retrieved successfully.
 *       400:
 *         description: Invalid artist, campaign, merchandise type, or date parameter.
 *       401:
 *         description: Unauthorized. Authentication is required.
 *       500:
 *         description: Internal server error.
 */
router.get("/fan/dashboard", auth, artistFanDashboard);

module.exports = router