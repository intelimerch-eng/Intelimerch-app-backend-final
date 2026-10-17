const express = require("express")
const router = express.Router()
const { campaignAnalytics } = require("../analytics.controller")
const auth = require("../../../middleware/auth.middleware")


/**
 * @swagger
 * /campaigns/analytics/{campaignId}:
 *   get:
 *     summary: Get campaign analytics
 *     description: |
 *       Retrieves analytics for a specific campaign including summary metrics,
 *       campaign tags, scan timeline, scans per tag and top-performing tags.
 *
 *       **Authentication Required:** Artist
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: campaignId
 *         required: true
 *         schema:
 *           type: string
 *           example: 6898a9cb1d7c8d7b9e5f1234
 *         description: Campaign ID
 *     responses:
 *       200:
 *         description: Campaign analytics retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Winter Merch Drop campaign analytics retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalTags:
 *                       type: object
 *                       properties:
 *                         count:
 *                           type: number
 *                           example: 5
 *
 *                     totalScans:
 *                       type: object
 *                       properties:
 *                         count:
 *                           type: number
 *                           example: 1610
 *                         percentage:
 *                           type: number
 *                           nullable: true
 *                           example: null
 *
 *                     avgScansPerTag:
 *                       type: object
 *                       properties:
 *                         count:
 *                           type: number
 *                           example: 322
 *
 *                     topTagScans:
 *                       type: object
 *                       properties:
 *                         count:
 *                           type: number
 *                           example: 501
 *                         percentage:
 *                           type: number
 *                           nullable: true
 *                           example: null
 *
 *                     allTags:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: 6898a9cb1d7c8d7b9e5f1234
 *                           tagId:
 *                             type: string
 *                             example: NFC-H001
 *                           product:
 *                             type: string
 *                             example: Premium Hoodie
 *                           scans:
 *                             type: number
 *                             example: 412
 *                           lastScan:
 *                             type: string
 *                             format: date-time
 *
 *                     scanTimeline:
 *                       type: object
 *                       properties:
 *                         12Months:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/TimelineItem'
 *                         3Months:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/TimelineItem'
 *                         30Days:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/TimelineItem'
 *                         7Days:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/TimelineItem'
 *                         24Hours:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/TimelineItem'
 *
 *                     scansPerTag:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           label:
 *                             type: string
 *                             example: NFC-H001
 *                           value:
 *                             type: number
 *                             example: 412
 *
 *                     topPerformingTags:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           tagId:
 *                             type: string
 *                             example: NFC-H002
 *                           scans:
 *                             type: number
 *                             example: 501
 *                           product:
 *                             type: string
 *                             example: Premium Hoodie — Navy
 *
 *       400:
 *         description: Invalid campaign ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Invalid campaign id
 *
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *
 *       404:
 *         description: Campaign not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Campaign not found
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     TimelineItem:
 *       type: object
 *       properties:
 *         _id:
 *           type: object
 *           properties:
 *             year:
 *               type: number
 *               example: 2026
 *             month:
 *               type: number
 *               example: 8
 *             day:
 *               type: number
 *               example: 12
 *             hour:
 *               type: number
 *               example: 22
 *         value:
 *           type: number
 *           example: 42
 */
router.get("/:campaignId", auth, campaignAnalytics)




module.exports = router