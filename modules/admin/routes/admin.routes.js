const express = require("express")
const router = express.Router()
const {
    registerStaff,
    dashboard,
    createCreator,
    creatorsList,
    fansList,
    getAllFans,
    getAllCampaigns,
    createPerkCategory,
    getPerksCategories,

    createCampaign,
    createCampaignPage,
    getCampaigns,
    createProduct,
    getProducts,
    createPerk,
    getPerks,
    assignProductToCampaign,
    assignPerkToCampaign
} = require("../controller/admin.controller")
const auth = require("../../../middleware/auth.middleware")
const { registerStaffSchema } = require("../../../validators/internalTeamValidator")
const { registerArtistSchema } = require("../../../validators/artistValidator")
const validate = require("../../../middleware/validate")
const { autheRoles } = require("../../../middleware/authRole.middleware")

// internal operations
/**
 * @swagger
 * /admin/register-staff:
 *   post:
 *     summary: 
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - userName
 *               - roleId
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *               middleName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               userName:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               roleId:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Internal team account created successfully
 *       400:
 *         description: |
 *           Possible errors:
 *           - Required fields missing
 *           - Email already exists
 *           - Phone already exists
 *           - Password must be at least 8 characters
 *       500:
 *         descripton: Something went wrong creating account
 */
router.post("/register-staff", auth, autheRoles("admin"), validate(registerStaffSchema), registerStaff)

router.get("/staffs", auth, registerStaff)

router.get("/dashboard", auth, dashboard)

/**
 * @swagger
 * /admin/register-creator:
 *   post:
 *     summary: 
 *     tags:
 *       - Admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - userName
 *               - email
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *               middleName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               userName:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Artist registered successfully
 *       400:
 *         description: |
 *           Possible errors:
 *           - Required fields missing
 *           - Email already exists
 *           - Phone already exists
 *           - Password must be at least 8 characters
 *       500:
 *         descripton: Internal server error occured creating artist
 */
router.post("/register-creator", auth, autheRoles("admin"), validate(registerArtistSchema), createCreator)

/**
 * @swagger
 * /admin/creators:
 *   get:
 *     summary: Retrieve creators
 *     description: Retrieves all creators with their campaign, tag, and scan statistics.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Creators retrieved successfully.
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
 *                   example: Creators retrieved successfully.
 *
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalCreators:
 *                       type: integer
 *                       example: 15
 *
 *                     currentlyActive:
 *                       type: integer
 *                       example: 12
 *
 *                     creators:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: Luna Torres
 *
 *                           totalCampaign:
 *                             type: integer
 *                             example: 4
 *
 *                           totalTags:
 *                             type: integer
 *                             example: 25
 *
 *                           totalScans:
 *                             type: integer
 *                             example: 14220
 *
 *                           email:
 *                             type: string
 *                             format: email
 *                             example: luna@example.com
 *
 *       401:
 *         description: Unauthorized. Authentication is required.
 *
 *       500:
 *         description: Internal server error.
 */
router.get("/creators", auth, creatorsList)

/**
 * @swagger
 * /admin/fans/{artistid}:
 *   get:
 *     summary: Retrieve creator's fans
 *     description: Retrieves all creators fans.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 * 
 *     parameters:
 *       - in: path
 *         name: artistId
 *         required: true
 *         schema:
 *           type: string
 *         description: Artist ObjectId
 * 
 *     responses:
 *       200:
 *         description: Creator's fans retrieved successfully.
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
 *                   example: Fans retrieved successfully.
 *
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalCreators:
 *                       type: integer
 *                       example: 15
 *
 *                     currentlyActive:
 *                       type: integer
 *                       example: 12
 *
 *                     fans:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           firstName:
 *                             type: string
 *                             example: Luna
 *
 *                           lastName:
 *                             type: string
 *                             example: Torres
 *
 *                           email:
 *                             type: strinf
 *                             example: luna@gmail.com
 *
 *                           phone:
 *                             type: integer
 *                             example: 08112345678
 *
 *                           status:
 *                             type: string
 *                             example: active
 *                           consetGiven:
 *                             type: boolean
 *                             example: true
 *
 *       401:
 *         description: Unauthorized. Authentication is required.
 *
 *       500:
 *         description: Internal server error.
 */
router.get("/fans/:artistId", auth, fansList)

/**
 * @swagger
 * /admin/get-all-fans:
 *   get:
 *     summary: Get all fans
 *     description: Retrieves all accounts with the account type of FANS.
 *     tags:
 *       - Admin
 *     responses:
 *       200:
 *         description: All fans retrieved successfully
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
 *                   example: All fans retrieved
 *                 data:
 *                   type: object
 *                   properties:
 *                     fans:
 *                       type: array
 *                       items:
 *                         type: object
 *                       description: List of fan accounts
 *       500:
 *         description: Internal server error
 */
router.get("/get-all-fans", getAllFans)

router.get("/get-all-campaigns", auth, getAllCampaigns)

/**
 * @swagger
 * /admin/create-perk-category:
 *   post:
 *     summary: Create perk category
 *     description: Create a new perk category.
 *     tags:
 *       - Admin
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
 *               - description
 *               - avatar
 * 
 *             properties:
 *               name:
 *                 type: string
 *                 example: Premium Access
 * 
 *               description:
 *                 type: string
 *                 example: Access to exclusive premium features and rewards
 * 
 *               avatar:
 *                 type: string
 *                 example: https://example.com/images/premium-access.png
 * 
 *     responses:
 *       201:
 *         description: Category created successfully
 * 
 *       400:
 *         description: Required fields missing
 * 
 *       500:
 *         description: Internal server error
 */
router.post("/create-perk-category", auth, autheRoles("admin"), createPerkCategory)

/**
 * @swagger
 * /admin/get-perks-categories:
 *   get:
 *     summary: Get all perk categories
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perk categories retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error occurred retrieving perk categories
 */
router.get("/get-perks-categories", getPerksCategories)


// on artist account
/**
 * @swagger
 * /admin/{artistId}/create-campaign:
 *   post:
 *     summary: Create campaign
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: artistId
 *         required: true
 *         schema:
 *           type: string
 *         description: Artist ObjectId
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
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
 *                 type: array
 *                 description: Array of perk IDs to associate with the campaign.
 *                 items:
 *                   type: string
 *                 example:
 *                   - "6889f6b4d3a8f2c1e5a9b123"
 *                   - "6889f6b4d3a8f2c1e5a9b124"
 *
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-08-01T10:00:00.000Z"
 *
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-08-31T23:59:59.000Z"
 *
 *               mediaType:
 *                 type: string
 *                 enum:
 *                   - image
 *                   - audio
 *                   - video
 *                   - document
 *                   - link
 *                 example: "image"
 *
 *               mediaUrl:
 *                 type: string
 *                 description: URL of the uploaded campaign media.
 *                 example: "https://cdn.intelimerch.com/campaigns/banner.jpg"
 *
 *               status:
 *                 type: string
 *                 enum:
 *                   - active
 *                   - inactive
 *                 example: "active"
 *
 *     responses:
 *       201:
 *         description: Campaign created successfully.
 *
 *       400:
 *         description: |
 *           Possible errors:
 *             - Campaign name already exists.
 *             - One or more perks do not exist.
 *             - One or more perks have already been assigned to the campaign.
 *             - Media file is missing.
 *             - Invalid campaign dates.
 *
 *       401:
 *         description: Unauthorized.
 *
 *       500:
 *         description: Internal server error occurred while creating the campaign.
 */
router.post("/:artistId/create-campaign", auth, createCampaign)

router.post("/:artistId/:campaignId/create-campaign-page", auth, createCampaignPage)

router.get("/:artistId/get-campaigns", auth, getCampaigns)

/**
 * @swagger
 * /admin/{artistId}/create-product:
 *   post:
 *     summary: Create a new product
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: artistId
 *         required: true
 *         schema:
 *           type: string
 *         description: Artist ObjectId
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productName
 *               - productType
 *               - color
 *               - size
 *               - sku
 *             properties:
 *               productName:
 *                 type: string
 *               productType:
 *                 type: string
 *               description:
 *                 type: string
 *               color:
 *                 type: string
 *               size:
 *                 type: string
 *               campainId:
 *                 type: string
 *               productTier:
 *                 type: string
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: |
 *           Possible errors:
 *           - Required fields missing
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: |
 *           Possible errors:
 *           - SKU already exists
 *           - Product ID already exists
 *           - Tag ID already exists
 *       500:
 *         description: Internal server error occurred creating product
 */
router.post("/:artistId/create-product", auth, createProduct)

router.get("/:artistId/get-products", auth, getProducts)

/** 
 * @swagger
 * /admin/{artistId}/create-perk:
 *   post:
 *     summary: Create a new perk
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: artistId
 *         required: true
 *         schema:
 *           type: string
 *         description: Artist ObjectId
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - perkName
 *               - perkCategoryId
 *               - contentType
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
 *               fileUrl:
 *                 type: string
 *                 description: URL of the uploaded file
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Perk created successfully
 *       400:
 *         description: |
 *           Possible errors:
 *           - Required fields missing
 *           - Invalid perk category
 *           - Invalid campaign
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error occurred creating perk
 */
router.post("/:artistId/create-perk", auth, createPerk)

router.get("/:artistId/get-perks", auth, getPerks)

/**
 * @swagger
 * /admin/{artistId}/assign-product-to-campaign:
 *   post:
 *     summary: Assign a product variant to a campaign
 *     description: Assigns a product variant to a campaign, associates the product with a tier, generates a unique NFC tag, and returns the generated tag link.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: artistId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the product to assign.
 *         example: "6a709245d8dbb6835650ff29"
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - campaignId
 *               - tierId
 *               - variantId
 *             properties:
 *               productId:
 *                 type: string
 *                 example: "6a6b358cea901356b544b173"
 * 
 *               campaignId:
 *                 type: string
 *                 example: "6a6b358cea901356b544b173"
 *
 *               tierId:
 *                 type: string
 *                 example: "6a5f4c406eec4d7749091fc5"
 *
 *               variantId:
 *                 type: string
 *                 example: "6a7092b8d8dbb6835650ff31"
 *
 *     responses:
 *       200:
 *         description: Product assigned to campaign successfully.
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
 *                   example: Product assigned to campaign successfully
 *
 *                 data:
 *                   type: object
 *                   properties:
 *                     campaignProduct:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: "6a70a5d9d8dbb6835650ff55"
 *                         campaignId:
 *                           type: string
 *                           example: "6a6b358cea901356b544b173"
 *                         product:
 *                           type: string
 *                           example: "6a709245d8dbb6835650ff29"
 *                         tierId:
 *                           type: string
 *                           example: "6a5f4c406eec4d7749091fc5"
 *
 *                     tag:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: "6a70a61ad8dbb6835650ff56"
 *                         tagId:
 *                           type: string
 *                           example: "9f2d0e14-8f90-4f56-9f5d-8a8ef4c8fd11"
 *                         campaignId:
 *                           type: string
 *                           example: "6a6b358cea901356b544b173"
 *                         productVariantId:
 *                           type: string
 *                           example: "6a7092b8d8dbb6835650ff31"
 *                         tierId:
 *                           type: string
 *                           example: "6a5f4c406eec4d7749091fc5"
 *
 *                     tagLink:
 *                       type: string
 *                       example: https://app.intelimerch.com/nfc/io/6a70a61ad8dbb6835650ff56
 *
 *       400:
 *         description: |
 *           Possible errors:
 *             - Product already assigned to this campaign with a different tier.
 *             - Invalid campaign, tier or variant.
 *
 *       401:
 *         description: Unauthorized.
 *
 *       404:
 *         description: Product not found.
 *
 *       500:
 *         description: Internal server error occurred while assigning the product to the campaign.
 */
router.post("/:artistId/assign-product-to-campaign", auth, assignProductToCampaign)

router.post("/:artistId/:perkId/assign-perk-to-campaign", auth, assignPerkToCampaign)



module.exports = router