const mongoose = require("mongoose")
const Products = require("../models/product.model")
const ProductVariants = require("../models/productVariant.model")
const ProductSizes = require("../models/size.model")
const ProductTypes = require("../models/productType.model")
const ProductCodeCounts = require("../models/productCodeCounts.model")
const ProductColors = require("../models/color.model")
const Tiers = require("../../tier/tier.model")
const Campaigns = require("../../campaign/model/campaign.model")
const campaignProducts = require("../../campaign/model/campaignProducts.model")
const CampaignProducts = require("../../campaign/model/campaignProducts.model")
const generateCode = require("../../../utils/generateCode")
const { generateTag } = require("../../tags/tag.services")
const validateObjectId = require("../../../utils/objectIdValidators")



const createProductService = async (artistId, productName, productType, productCode, description, color, size, campaignId, productTier, session) => {
    // create product code - TSH-001: productType and productCodeCounter
    // get product type or create one of does not exist
    let productTypeDoc
    productTypeDoc = await ProductTypes.findOne({ type: productType.toLowerCase() }).session(session)
    if (!productTypeDoc) {
        if (!productCode) {
            const error = new Error("product code is required")
            error.statusCode = 400
            throw error
        }
        [productTypeDoc] = await ProductTypes.create([{ type: productType, code: productCode }], { session })
    }

    // no two products in the same product category should have the same name
    const productAlreadyInProdCategory = await Products.findOne({ productName, productTypeId: productTypeDoc._id })
    if (productAlreadyInProdCategory) {
        const error = new Error(`${productName} already exist in "${productTypeDoc.type}" product category`)
        error.statusCode = 400
        throw error
    }

    // create product code counter
    let productCodeCount
    productCodeCount = await ProductCodeCounts.findOne({ productType: productTypeDoc._id }).session(session)
    // if the a counter table does not already exist, then create a new one
    if (!productCodeCount) {
        [productCodeCount] = await ProductCodeCounts.create([{ productType: productTypeDoc._id }], { session })  //system default the "nextNumber" field to 1 on newly created doc
    }

    const currentCount = productCodeCount.nextNumber

    // create product code
    const formattedProductCount = String(currentCount).padStart(3, "0");
    const fullProductCode = productTypeDoc.code + formattedProductCount  //productType + productCount - TSH001

    // create product
    const [newProduct] = await Products.create(
        [{
            artistId,
            productName,
            description,
            productTypeId: productTypeDoc._id,
            productCode: fullProductCode
        }],
        { session }
    )


    // update productCount doc
    await ProductCodeCounts.findByIdAndUpdate(productCodeCount._id, { $inc: { nextNumber: 1 } }, { returnDocument: "after", runValidators: true, session })


    // create variant - service 
    // get colorId
    let colorDoc
    const colorCode = generateCode(color)
    colorDoc = await ProductColors.findOne({ code: colorCode }).session(session)
    if (!colorDoc) {
        [colorDoc] = await ProductColors.create([{ name: color, code: colorCode }], { session })
    }
    const colorId = colorDoc._id


    // get sizeId
    let sizeDoc
    const sizeCode = generateCode(size)
    sizeDoc = await ProductSizes.findOne({ code: sizeCode }).session(session)
    if (!sizeDoc) {
        [sizeDoc] = await ProductSizes.create([{ size: size, code: sizeCode }], { session })
    }
    const sizeId = sizeDoc._id

    const sku = fullProductCode + "-" + colorCode + "-" + sizeCode
    const [variant] = await ProductVariants.create([{ productId: newProduct._id, colorId: colorId, sizeId: sizeId, sku }], { session })

    // if campaignId, create campaign product and tag - services
    if (campaignId) {
        if (!productTier) {
            const error = new Error("product tier is required")
            error.statusCode = 400
            throw error
        }

        const tier = await Tiers.findOne({ name: productTier })
        const tierId = tier._id

        const campaignProduct = await assignProductToCampaignService(newProduct._id, campaignId, tierId, session)
        // update number of product linked to campaign
        if (campaignProduct) { // update productLinked in campaign
            const updatedCampaign = await Campaigns.findByIdAndUpdate(
                campaignId,
                {
                    $inc: { productsLinked: 1 }
                },
                { afterDocument: true, runValidators: true, session }
            )

            if (!updatedCampaign) {
                const error = new Error("Error updating campaign")
                throw error
            }
        }


        // create tag
        const tag = await generateTag(campaignId, variant._id, tierId, session)
        // tag link = {baseUrl/nfc/io/tag._id}
        const tagLink = process.env.FRONTEND_BASE_URL + "/nfc/io/" + tag._id

        return [newProduct, campaignProduct, tag, tagLink]
    }

    return [newProduct]
}

async function getArtistProductService(artistId, limit, skip) {

    const result = await ProductVariants.aggregate([
        {
            $lookup: {
                from: "products",
                localField: "productId",
                foreignField: "_id",
                as: "product"
            }
        },
        { $unwind: "$product" },

        {
            $lookup: {
                from: "product-types",
                localField: "product.productTypeId",
                foreignField: "_id",
                as: "productType"
            }
        },
        {
            $set: {
                "product.productType": {
                    $arrayElemAt: ["$productType.type", 0]
                }
            }
        },
        {
            $unset: "product.productTypeId"
        },
        {
            $unset: "productType"
        },

        {
            $lookup: {
                from: "colors",
                localField: "colorId",
                foreignField: "_id",
                as: "colorData"
            }
        },
        {
            $set: {
                color: {
                    $arrayElemAt: ["$colorData.name", 0]
                }
            }
        },
        {
            $unset: ["colorId", "colorData"]
        },

        {
            $lookup: {
                from: "sizes",
                localField: "sizeId",
                foreignField: "_id",
                as: "sizeData"
            }
        },
        {
            $set: {
                size: {
                    $arrayElemAt: ["$sizeData.size", 0]
                }
            }
        },
        {
            $unset: ["sizeId", "sizeData"]
        },

        {
            $match: { "product.artistId": new mongoose.Types.ObjectId(artistId) }
        },
        {
            $facet: {
                data: [
                    { $skip: skip },
                    { $limit: limit }
                ],
                total: [
                    { $count: "count" }
                ]
            }
        }
    ])

    return result

}

//create product variant
const createProductVariant = async (productId, color, size, sku, session) => {
    const [variant] = await ProductVariants.create([{ productId, colorId: color, sizeId: size, sku }], { session })
    return variant
}

// Assign product to campaign - to be called by assignProductToCampaignServiceMain below
async function assignProductToCampaignService(productId, campaignId, tierId, session) {
    // check if product already exist, do not re-add - skip to tag creation
    const productAlreadyInCampaign = await campaignProducts.findOne({ campaignId: campaignId, product: productId }).session(session)

    if (!productAlreadyInCampaign) { //if product already in campaign, do not re-add, create Tag and generate link.
        const campaignProduct = await campaignProducts.create([{ campaignId, product: productId, tierId }], { session })
        return campaignProduct[0]
    }
}

// depends on assignProductToCampaignService above
const assignProductToCampaignServiceMain = async (artistId, productId, campaignId, tierId, variantId, session) => {

    await validateObjectId(campaignId, Campaigns, "campaign")
    await validateObjectId(tierId, Tiers, "tier")
    await validateObjectId(variantId, ProductVariants, "product variant")

    const productVariant = await ProductVariants.findOne({
        _id: variantId,
    });

    const product = await Products.findById(productVariant.productId)

    if (!product) {
        const error = new Error("Product not found");
        error.statusCode = 404;
        throw error;
    }

    const campaignProduct = await CampaignProducts.findOne({ campaignId, product: product._id }).session(session)
    if (campaignProduct && tierId.toString() !== campaignProduct.tierId.toString()) {
        const error = new Error("Product already assigned to this campaign with a different tier.");
        error.statusCode = 400;
        throw error;
    }

    const newCampaignProduct = await assignProductToCampaignService(product._id, campaignId, tierId, session)
    if (newCampaignProduct) { // update productLinked in campaign
        const updatedCampaign = await Campaigns.findByIdAndUpdate(
            campaignId,
            {
                $inc: { productsLinked: 1 }
            },
            { afterDocument: true, runValidators: true, session }
        )

        if (!updatedCampaign) {
            const error = new Error("Error updating campaign")
            throw error
        }
    }

    // create tag
    const tag = await generateTag(campaignId, productVariant._id, tierId, session)
    // increament tacgount value in campaign
    await Campaigns.findByIdAndUpdate(campaignId, { $inc: { tagCount: 1 } }, { session })
    // tag link = {baseUrl/nfc/io/tag._id}
    const tagLink = process.env.FRONTEND_BASE_URL + "/nfc/io/" + tag._id

    return [newCampaignProduct, tag, tagLink]
}



module.exports = { createProductService, getArtistProductService, createProductVariant, assignProductToCampaignService, assignProductToCampaignServiceMain }