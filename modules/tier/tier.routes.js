
const express = require("express")
const router = express.Router()
const { createTier, getTiers, updateTier } = require("./tier.controller")
const auth = require("../../middleware/auth.middleware")
const validate = require("../../middleware/validate")
const { createTierSchema, updateTierSchema } = require("../../validators/tier.validator")

/**
 * @swagger
 * /tiers:
 *   post:
 *     summary: Create a new tier
 *     tags:
 *       - Tiers
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               alias:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tier created successfully
 *       400:
 *         description: |
 *           Possible errors:
 *           - Required fields missing
 *           - Tier already exists
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error occurred creating tier
 */
router.post("/", auth, validate(createTierSchema), createTier)

/**
 * @swagger
 * /tiers:
 *   get:
 *     summary: Get all tiers
 *     tags:
 *       - Tiers
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tiers retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error occurred retrieving tiers
 */
router.get("/", auth, getTiers)

/**
 * @swagger
 * /tiers/{tierId}:
 *   patch:
 *     summary: Update a tier
 *     tags:
 *       - Tiers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tierId
 *         required: true
 *         schema:
 *           type: string
 *         description: Tier ObjectId
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Tier name
 *               alias:
 *                 type: string
 *                 description: Tier alias
 *               description:
 *                 type: string
 *                 description: Tier description
 *     responses:
 *       200:
 *         description: Tier updated successfully
 *       400:
 *         description: |
 *           Possible errors:
 *           - Invalid tier ID
 *           - Tier name already exists
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Tier not found
 *       500:
 *         description: Internal server error occurred updating tier
 */
router.patch("/:tierId", auth, validate(updateTierSchema), updateTier)


module.exports = router