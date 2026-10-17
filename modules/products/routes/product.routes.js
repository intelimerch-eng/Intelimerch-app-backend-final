
const express = require("express")
const router = express.Router()
const auth = require("../../../middleware/auth.middleware")
const { createProduct, assignProductToCampaign, getProducts, getCampaignProduct, updateProduct, deleteProduct } = require("../controllers/product.controllers")
const { createProductSchema } = require("../../../validators/product.validator")
const validate = require("../../../middleware/validate")


/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
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
// create product
router.post("/", auth, validate(createProductSchema), createProduct)

/**
 * @swagger
 * /products/{productId}/assign-to-campaign:
 *   post:
 *     summary: Assign a product variant to a campaign
 *     description: Assigns a product variant to a campaign, associates the product with a tier, generates a unique NFC tag, and returns the generated tag link.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: productId
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
 *               - campaignId
 *               - tierId
 *               - variantId
 *             properties:
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
// assign product to campaign
router.post("/:productId/assign-to-campaign", auth, assignProductToCampaign)

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Retrieve all products
 *     description: Fetch all available products with optional pagination and filtering.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         required: false
 *         description: Current page number
 * 
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         required: false
 *         description: Number of products per page
 * 
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter products by category
 * 
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: false
 *         description: Search products by name
 * 
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 * 
 *       400:
 *         description: Invalid query parameters
 * 
 *       500:
 *         description: Internal server error
 */
// get products
router.get("/", auth, getProducts)

/**
 * @swagger
 * /products/{productId}:
 *   patch:
 *     summary: Update product
 *     description: Update an existing product by its ID.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 * 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productName:
 *                 type: string
 * 
 *               productPrice:
 *                 type: number
 * 
 *               productDescription:
 *                 type: string
 * 
 *               productCategory:
 *                 type: string
 * 
 *               productImage:
 *                 type: string
 * 
 *     responses:
 *       200:
 *         description: Product updated successfully
 * 
 *       400:
 *         description: Invalid request data
 * 
 *       404:
 *         description: Product not found
 * 
 *       500:
 *         description: Internal server error
 */
// update product
router.patch("/:productId", auth, updateProduct)

/**
 * @swagger
 * /products/campaign-products/{productId}/{campaignId}:
 *   get:
 *     summary: Get a campaign product
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ObjectId
 *       - in: path
 *         name: campaignId
 *         required: true
 *         schema:
 *           type: string
 *         description: Campaign ObjectId
 *     responses:
 *       200:
 *         description: Campaign product retrieved successfully
 *       400:
 *         description: |
 *           Possible errors:
 *           - Required fields missing
 *           - Invalid campaign
 *           - Product not found in campaign
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Campaign product not found
 *       500:
 *         description: Internal server error occurred retrieving campaign product
 */
// get campaign product
router.get("/campaign-products/:productId/:campaignId", auth, getCampaignProduct)

/**
 * @swagger
 * /products/{productId}:
 *   delete:
 *     summary: Delete product
 *     description: Delete an existing product by its ID.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 * 
 *     responses:
 *       200:
 *         description: Product deleted successfully
 * 
 *       404:
 *         description: Product not found
 * 
 *       500:
 *         description: Internal server error
 */
// delete product
router.delete("/:productId", auth, deleteProduct)



module.exports = router