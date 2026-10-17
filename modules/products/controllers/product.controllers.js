const asyncHandler = require("express-async-handler")
const mongoose = require("mongoose")
const Products = require("../models/product.model")
const ProductTypes = require("../models/productType.model")
const ProductCodeCounts = require("../models/productCodeCounts.model")
const ProductVariants = require("../models/productVariant.model")
const ProductColors = require("../models/color.model")
const ProductSizes = require("../models/size.model")
const CampaignProducts = require("../../campaign/model/campaignProducts.model")
const Tiers = require("../../tier/tier.model")
const Campaigns = require("../../campaign/model/campaign.model")
const { createProductService, getArtistProductService, assignProductToCampaignService, assignProductToCampaignServiceMain } = require("../services/product.service")
const generateCode = require("../../../utils/generateCode")
const { generateTag } = require("../../tags/tag.services")
const validateObjectId = require("../../../utils/objectIdValidators")



const createProduct = asyncHandler(async (req, res) => {
    // collect data
    const artistId = req.user.accountId
    const {
        productName,
        productType, //collect name(as in "t-shirt") not Id
        productCode, // optional, not required if product type already exist.
        description,
        color,
        size,
        campaignId,
        productTier
    } = req.body;

    const session = await mongoose.startSession()

    try {
        session.startTransaction()

        const [product, campaignProduct, tag, tagLink] = await createProductService(artistId, productName, productType, productCode, description, color, size, campaignId, productTier, session)

        await session.commitTransaction()

        return res.status(201).json({
            success: true,
            message: "Product created succssfully",
            data: {
                product,
                campaignProduct,
                tag,
                tagLink
            }
        })
    }
    catch (error) {
        await session.abortTransaction()
        throw error
    }
    finally {
        await session.endSession()
    }
});


const assignProductToCampaign = asyncHandler(async (req, res) => {   //variantId, campaignId, tierId
    const session = await mongoose.startSession()
    try {
        session.startTransaction()
        // collate data
        const artistId = req.user.accountId;
        const { productId } = req.params;

        const { campaignId, tierId, variantId } = req.body;

        const [campaignProduct, tag, tagLink] = await assignProductToCampaignServiceMain(artistId, productId, campaignId, tierId, variantId, session)


        await session.commitTransaction()

        res.status(200).json({
            success: true,
            message: "Product assigned to campaign successfully",
            data: { campaignProduct, tag, tagLink }
        });

    }
    catch (error) {
        await session.abortTransaction()
        throw error

    }
    finally {
        session.endSession()
    }
});


const getProducts = asyncHandler(async (req, res) => {

    const artistId = req.user.accountId
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const result = await getArtistProductService(artistId, limit, skip)

    const products = result[0].data;
    const total = result[0].total[0]?.count || 0;


    res.status(200).json({
        success: true,
        data: products,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    });
});


const getCampaignProduct = asyncHandler(async (req, res) => {
    const artistId = req.user.accountId

    const { productId, campaignId } = req.params

    await validateObjectId(productId, Products, "product")
    await validateObjectId(campaignId, Campaigns, "campaign")

    const campaignProduct = await CampaignProducts.findOne({ campaignId, product: productId }).populate("tierId")

    return res.status(200).json({
        success: true,
        message: "Campaign product retrived.",
        data: campaignProduct
    })
})

const updateProduct = asyncHandler(async (req, res) => {
    const artistId = req.user.accountId;
    const { productId } = req.params;

    const product = await Products.findOne({
        _id: productId,
        artistId,
    });

    if (!product) {
        const error = new Error("Product not found");
        error.statusCode = 404;
        throw error;
    }

    const allowedFields = [
        "productName",
        "productType",
        "color",
        "size",
        "batchNumber",
    ];

    allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
            product[field] = req.body[field];
        }
    });

    await product.save();

    res.status(200).json({
        success: true,
        message: "Product updated successfully",
        data: product,
    });
});


const deleteProduct = asyncHandler(async (req, res) => {
    const artistId = req.user.accountId;
    const { productId } = req.params;

    const product = await Products.findOne({
        _id: productId,
        artistId,
    });

    if (!product) {
        const error = new Error("Product not found");
        error.statusCode = 404;
        throw error;
    }

    await product.deleteOne();

    res.status(200).json({
        success: true,
        message: "Product deleted successfully",
    });
});


module.exports = {
    createProduct,
    assignProductToCampaign,
    getProducts,
    getCampaignProduct,
    updateProduct,
    deleteProduct
}