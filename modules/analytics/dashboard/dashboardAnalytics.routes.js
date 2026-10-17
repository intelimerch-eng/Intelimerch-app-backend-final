const express = require("express")
const router = express.Router()
const { dashboardAnalytics } = require("../analytics.controller")
const auth = require("../../../middleware/auth.middleware")

/**
 * @swagger
 * /dashboard/analytics:
 *   get:
 *     tags:
 *       - Analytics
 *     summary: Get dashboard analytics
 *     description: Returns an overview of analytics for the authenticated artist's dashboard, including scan statistics, conversion rate, scan timeline, top locations and campaign performance.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard analytics retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 analyticsData:
 *                   type: object
 *                   properties:
 *                     totalNFCScans:
 *                       type: object
 *                       properties:
 *                         count:
 *                           type: integer
 *                           example: 1254
 *                         percentage:
 *                           type: number
 *                           nullable: true
 *                           example: null
 *
 *                     uniqueActivations:
 *                       type: object
 *                       properties:
 *                         count:
 *                           type: integer
 *                           example: 820
 *                         percentage:
 *                           type: number
 *                           nullable: true
 *                           example: null
 *
 *                     repeatScans:
 *                       type: object
 *                       properties:
 *                         count:
 *                           type: integer
 *                           example: 434
 *                         percentage:
 *                           type: number
 *                           nullable: true
 *                           example: null
 *
 *                     conversionRate:
 *                       type: object
 *                       properties:
 *                         count:
 *                           type: number
 *                           example: 65.7
 *                         percentage:
 *                           type: number
 *                           nullable: true
 *                           example: null
 *
 *                     scanTimeline:
 *                       type: array
 *                       description: Scan timeline grouped into different time intervals.
 *                       items:
 *                         type: object
 *
 *                     campaignPerformance:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 66f3af95bc72b18c19e7dfe2
 *                           campaignName:
 *                             type: string
 *                             example: Winter Merch Drop
 *                           productsLinked:
 *                             type: integer
 *                             example: 4
 *                           dateCreated:
 *                             type: string
 *                             format: date-time
 *                           scans:
 *                             type: integer
 *                             example: 1520
 *                           conversion:
 *                             type: number
 *                             example: 71.8
 *                           status:
 *                             type: string
 *                             enum:
 *                               - draft
 *                               - active
 *                               - paused
 *
 *       401:
 *         description: Unauthorized.
 *
 *       500:
 *         description: Internal server error.
 */
router.get("/", auth, dashboardAnalytics)




module.exports = router