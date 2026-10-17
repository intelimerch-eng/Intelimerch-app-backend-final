const express = require("express")
const router = express.Router()
const { tap,
    activateMerch,
    getCampaignPageResources,
    getCampaignPageResource
} = require("./tap.controller")
const auth = require("../../middleware/auth.middleware")
const authOwner = require("../../middleware/verifyTokenOwnerToken.middleware")
const authTap = require("../../middleware/authTap.middleware")
const validate = require("../../middleware/validate")
const { fanActivationSchema } = require("../../validators/fan.validator")


/**
 * @swagger
 * /taps/{tagId}/tap:
 *   post:
 *     summary: Process an NFC merchandise tap
 *     description: |
 *       Processes an NFC merchandise tap and determines the next step based on
 *       the merchandise activation status and the fan's ownership.
 *
 *       Possible outcomes:
 *       - Returning fan taps an activated merchandise → grants access and returns a tap token.
 *       - Fresh tap on an unactivated merchandise → initiates the merchandise activation flow.
 *       - Tap on merchandise already claimed by another fan → access denied.
 *
 *     tags:
 *       - Tags
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: tagId
 *         required: true
 *         description: MongoDB ID of the NFC merchandise tag.
 *         schema:
 *           type: string
 *         example: "68b12a8d0f8f2d9c3e3d4b01"
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deviceType
 *             properties:
 *               ownerToken:
 *                 type: string
 *                 description: |
 *                   Persistent owner token stored on the fan's device.
 *                   Optional for first-time activations.
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *
 *               deviceType:
 *                 type: string
 *                 enum:
 *                   - android
 *                   - ios
 *                   - web
 *                 example: "android"
 *
 *               location:
 *                 type: object
 *                 properties:
 *                   country:
 *                     type: string
 *                     example: "Nigeria"
 *                   state:
 *                     type: string
 *                     example: "Lagos"
 *                   city:
 *                     type: string
 *                     example: "Ikeja"
 *
 *     responses:
 *       200:
 *         description: NFC tap processed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *
 *                 message:
 *                   type: string
 *                   description: Outcome of the tap operation.
 *                   example: "Tap successful, welcome back!"
 *
 *                 tapToken:
 *                   type: string
 *                   description: Temporary token used for subsequent activation or campaign access.
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *
 *       400:
 *         description: Invalid request or malformed input.
 *
 *       401:
 *         description: Unauthorized. Owner token is invalid or could not be verified.
 *
 *       403:
 *         description: Access denied. This merchandise has already been claimed by another fan.
 *
 *       404:
 *         description: Tag or owner not found.
 *
 *       500:
 *         description: Internal server error.
 */
router.post("/:tagId/tap", authOwner, tap)

/**
 * @swagger
 * /taps/nfc/activate:
 *   post:
 *     summary: Activate NFC merchandise
 *     description: |
 *       Activates an unclaimed NFC merchandise.
 *
 *       The endpoint validates the supplied tap token, optionally validates an
 *       existing owner token, registers a new fan if necessary, assigns
 *       ownership of the merchandise, records the activation tap, updates
 *       campaign analytics and returns a new tap token.
 *
 *     tags:
 *       - Tags
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tapToken
 *               - firstName
 *               - email
 *               - phone
 *               - consentGiven
 *             properties:
 *               tapToken:
 *                 type: string
 *                 description: Temporary token returned from the NFC tap endpoint.
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *
 *               ownerToken:
 *                 type: string
 *                 description: Existing owner token stored on the fan's device. Omit for first-time owners.
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *
 *               firstName:
 *                 type: string
 *                 example: "Caleb"
 *
 *               lastName:
 *                 type: string
 *                 nullable: true
 *                 example: "Odedeji"
 *
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "caleb@example.com"
 *
 *               phone:
 *                 type: string
 *                 example: "+2348012345678"
 *
 *               consentGiven:
 *                 type: boolean
 *                 description: Must be true to activate the merchandise.
 *                 example: true
 *
 *               deviceType:
 *                 type: string
 *                 enum:
 *                   - android
 *                   - ios
 *                   - web
 *                 example: "android"
 *
 *               location:
 *                 type: object
 *                 properties:
 *                   latitude:
 *                     type: int
 *                     example: 6.514598964220166
 *                   longitude:
 *                     type: int
 *                     example: 3.3832071742326244
 *                   accuracy:
 *                     type: int
 *                     example: 73
 *                   ip:
 *                     type: string
 *                     example: "102.88.168.238"
 *
 *     responses:
 *       201:
 *         description: Merchandise activated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *
 *                 message:
 *                   type: string
 *                   example: "Tag activation successful"
 *
 *                 data:
 *                   type: object
 *                   properties:
 *                     activatedTag:
 *                       type: object
 *                       description: Activated merchandise tag.
 *
 *                     tapToken:
 *                       type: string
 *                       description: New tap token for subsequent NFC interactions.
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *
 *       400:
 *         description: |
 *           Possible errors:
 *           - Merchandise has already been activated.
 *           - Tap token is missing or invalid.
 *           - Consent not granted.
 *           - Validation failed.
 *
 *       401:
 *         description: Invalid or expired owner token.
 *
 *       404:
 *         description: Tag or owner not found.
 *
 *       500:
 *         description: Internal server error.
 */
router.post("/nfc/activate", authTap, validate(fanActivationSchema), authOwner, activateMerch)

/**
 * @swagger
 * /nfc/campaign-page-resources:
 *   get:
 *     summary: Retrieve campaign page resources
 *     description: |
 *       Retrieves all campaign resources (perks) available to the authenticated
 *       owner of an activated NFC merchandise.
 *
 *       This endpoint validates the supplied tap token and owner token,
 *       verifies ownership of the merchandise, records the tap and returns
 *       the campaign resources.
 *
 *     tags:
 *       - Tags
 *
 *     parameters:
 *       - in: query
 *         name: tapToken
 *         required: true
 *         description: Tap token returned from the NFC tap or activation endpoint.
 *         schema:
 *           type: string
 *         example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *
 *       - in: query
 *         name: ownerToken
 *         required: true
 *         description: Owner token stored on the fan's device.
 *         schema:
 *           type: string
 *         example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *
 *     responses:
 *       200:
 *         description: Campaign resources retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *
 *                 message:
 *                   type: string
 *                   example: "Campaign resources retrieved"
 *
 *                 data:
 *                   type: array
 *                   description: Campaign resources (perks) associated with the merchandise.
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "68b12a8d0f8f2d9c3e3d4b01"
 *
 *                       campaignId:
 *                         type: string
 *                         example: "68b12a8d0f8f2d9c3e3d4b02"
 *
 *                       perkId:
 *                         type: object
 *                         description: Populated perk document.
 *
 *       400:
 *         description: Invalid request.
 *
 *       401:
 *         description: |
 *           Possible errors:
 *           - Invalid tap token.
 *           - Invalid owner token.
 *           - Merchandise does not belong to the authenticated fan.
 *           - Tag not found.
 *
 *       404:
 *         description: Campaign resources not found.
 *
 *       500:
 *         description: Internal server error.
 */
router.get("/nfc/campaign-page-resources", authTap, authOwner, getCampaignPageResources)

/**
 * @swagger
 * /nfc/campaign-page-resource/{resourceId}:
 *   get:
 *     summary: Retrieve a campaign page resource
 *     description: |
 *       Retrieves a single campaign page resource (perk) accessible to an
 *       authenticated merchandise owner.
 *
 *       The endpoint validates both the tap token and owner token before
 *       returning the requested campaign resource.
 *
 *     tags:
 *       - Tags
 *
 *     parameters:
 *       - in: path
 *         name: resourceId
 *         required: true
 *         description: MongoDB ID of the campaign resource (CampaignPerk).
 *         schema:
 *           type: string
 *         example: "68b12a8d0f8f2d9c3e3d4b01"
 *
 *       - in: query
 *         name: tapToken
 *         required: true
 *         description: Tap token returned from the NFC tap or activation endpoint.
 *         schema:
 *           type: string
 *         example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *
 *       - in: query
 *         name: ownerToken
 *         required: true
 *         description: Owner token stored on the fan's device.
 *         schema:
 *           type: string
 *         example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *
 *     responses:
 *       200:
 *         description: Campaign resource retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *
 *                 message:
 *                   type: string
 *                   example: "Campaign resource retrieved"
 *
 *                 data:
 *                   type: object
 *                   description: Campaign page resource.
 *
 *       400:
 *         description: Invalid request.
 *
 *       401:
 *         description: Invalid tap token or owner token.
 *
 *       404:
 *         description: Campaign resource not found.
 *
 *       500:
 *         description: Internal server error.
 */
router.get("/nfc/campaign-page-resource/:resourceId", authTap, authOwner, getCampaignPageResource)


module.exports = router