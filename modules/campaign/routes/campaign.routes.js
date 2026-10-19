const express = require('express');
const router = express.Router();
const { createCampaign, createCampaignPage, getCampaigns, deleteCampaign } = require('../controller/campaign.controller');
const auth = require("../../../middleware/auth.middleware")
const validate = require("../../../middleware/validate")
const upload = require("../../../middleware/upload.middleware")
const { createCampaignSchema } = require("../../../validators/campaign.validator")


const normalizeCampaignBody = (req, res, next) => {
    try {
        const { perks } = req.body;

        if (perks === undefined || perks === null || perks === "") {
            req.body.perks = [];
        } else if (typeof perks === "string") {
            try {
                const parsed = JSON.parse(perks);
                req.body.perks = Array.isArray(parsed) ? parsed : [parsed];
            } catch {
                // Supports a single perk ID sent as a string.
                req.body.perks = [perks];
            }
        } else if (!Array.isArray(perks)) {
            req.body.perks = [perks];
        }

        next();
    } catch (error) {
        next(error);
    }
};


/**
 * @swagger
 * /campaigns:
 *   post:
 *     summary: Create a new campaign
 *     tags:
 *       - Campaigns
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - campaignName
 *               - perks
 *               - startDate
 *               - endDate
 *               - mediaType
 *             properties:
 *               campaignName:
 *                 type: string
 *                 example: "Summer Giveaway Campaign"
 *
 *               perks:
 *                 type: string
 *                 description: >
 *                   JSON-encoded array of perk MongoDB ObjectIds.
 *                   Example: ["6889f6b4d3a8f2c1e5a9b123",
 *                   "6889f6b4d3a8f2c1e5a9b124"].
 *                 example: '["6889f6b4d3a8f2c1e5a9b123","6889f6b4d3a8f2c1e5a9b124"]'
 *
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-11-01T10:00:00.000Z"
 *
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-11-30T23:59:59.000Z"
 *
 *               mediaType:
 *                 type: string
 *                 enum:
 *                   - image
 *                   - audio
 *                   - video
 *                   - document
 *                   - link
 *                 example: image
 *
 *               media:
 *                 type: string
 *                 format: binary
 *                 description: >
 *                   Campaign media file. Required for image, audio,
 *                   video, and document campaigns. For link campaigns,
 *                   provide mediaUrl instead.
 *
 *               mediaUrl:
 *                 type: string
 *                 format: uri
 *                 description: External URL required when mediaType is link.
 *                 example: "https://example.com/campaign"
 *
 *               status:
 *                 type: string
 *                 enum:
 *                   - active
 *                   - inactive
 *                 description: Campaign status. Defaults to the model's configured value.
 *                 example: active
 *
 *     responses:
 *       201:
 *         description: Campaign created successfully.
 *
 *       400:
 *         description: |
 *           Possible errors:
 *           - Required fields missing.
 *           - Campaign name already exists.
 *           - One or more perks do not exist or cannot be assigned.
 *           - Required campaign media is missing.
 *           - Uploaded file type does not match mediaType.
 *           - Invalid campaign dates.
 *           - Invalid perks JSON.
 *
 *       401:
 *         description: Unauthorized.
 *
 *       500:
 *         description: Internal server error occurred while creating the campaign.
 */
// create campaign
router.post("/", auth, upload.single("media"), normalizeCampaignBody, validate(createCampaignSchema), createCampaign)


/**
 * @swagger
 * /campaigns/{campaignId}/pages:
 *   post:
 *     summary: Create campaign page
 *     tags:
 *       - Campaigns
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: campaignId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the campaign.
 *         example: "6889f6b4d3a8f2c1e5a9b123"
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - pageStructure
 *             properties:
 *               pageStructure:
 *                 type: string
 *                 description: >
 *                   JSON-stringified page structure containing blocks, shared styles,
 *                   settings, and social links. Each block must have a unique blockId,
 *                   a supported type, content, and optional styles.
 *                 example: |
 *                   {
 *                     "blocks": [
 *                       {
 *                         "blockId": "hero-image",
 *                         "type": "image",
 *                         "content": {
 *                           "alt": "Campaign hero image"
 *                         },
 *                         "styles": {
 *                           "width": "100%"
 *                         }
 *                       },
 *                       {
 *                         "blockId": "welcome-text",
 *                         "type": "text",
 *                         "content": {
 *                           "text": "Welcome to the campaign!"
 *                         },
 *                         "styles": {}
 *                       },
 *                       {
 *                         "blockId": "campaign-button",
 *                         "type": "button",
 *                         "content": {
 *                           "text": "Explore perks",
 *                           "url": "https://example.com/perks"
 *                         },
 *                         "styles": {}
 *                       }
 *                     ],
 *                     "styles": {},
 *                     "settings": {},
 *                     "socialLinks": {
 *                       "instagram": "https://instagram.com/example",
 *                       "youtube": "https://youtube.com/@example",
 *                       "spotify": "https://open.spotify.com/artist/example"
 *                     }
 *                   }
 *               file_hero-image:
 *                 type: string
 *                 format: binary
 *                 description: Optional image file associated with the block whose blockId is "hero-image".
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *                 description: >
 *                   Only include this field if the API accepts status during creation.
 *     responses:
 *       201:
 *         description: Campaign page created successfully.
 *       400:
 *         description: |
 *           Possible errors:
 *             - Campaign does not exist or does not belong to the authenticated artist.
 *             - Campaign page already exists.
 *             - Invalid page structure JSON.
 *             - Invalid block type or duplicate block IDs.
 *             - Invalid file upload.
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error occurred while creating the campaign page.
 */
// create campaign page
router.post("/:campaignId/pages", auth, upload.any(), createCampaignPage)


/**
 * @swagger
 * /campaigns:
 *   get:
 *     summary: Retrieve all campaigns
 *     description: Returns a paginated list of campaigns belonging to the authenticated artist.
 *     tags:
 *       - Campaigns
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number.
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of campaigns per page.
 *
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search campaigns by campaign name.
 *         example: "Summer"
 *
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum:
 *             - active
 *             - inactive
 *             - draft
 *             - completed
 *         description: Filter campaigns by status.
 *         example: "active"
 *
 *     responses:
 *       200:
 *         description: Campaigns retrieved successfully.
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
 *                   example: Campaigns retrieved successfully.
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "6a6b358cea901356b544b173"
 *                       campaignName:
 *                         type: string
 *                         example: "Summer Giveaway"
 *                       status:
 *                         type: string
 *                         example: "active"
 *                       mediaType:
 *                         type: string
 *                         example: "image"
 *                       mediaUrl:
 *                         type: string
 *                         example: "https://cdn.intelimerch.com/campaigns/banner.jpg"
 *                       startDate:
 *                         type: string
 *                         format: date-time
 *                         example: "2026-08-01T10:00:00.000Z"
 *                       endDate:
 *                         type: string
 *                         format: date-time
 *                         example: "2026-08-31T23:59:59.000Z"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 42
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 20
 *                     totalPages:
 *                       type: integer
 *                       example: 3
 *                     hasNextPage:
 *                       type: boolean
 *                       example: true
 *                     hasPreviousPage:
 *                       type: boolean
 *                       example: false
 *
 *       401:
 *         description: Unauthorized.
 *
 *       500:
 *         description: Internal server error occurred while retrieving campaigns.
 */
// get artist campaigns
router.get("/", auth, getCampaigns)

// delete artist campaign 
router.delete("/:campaignId", auth, deleteCampaign);



module.exports = router
