const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const Tags = require("../tags/tag.model")
const Fans = require("../fan/fan.model.js")
const Campaigns = require("../campaign/model/campaign.model.js")
const Products = require("../products/models/product.model.js");
const ProductVariants = require("../products/models/productVariant.model.js");
const ProductTypes = require("../products/models/productType.model.js");


const artistFanDashboard = asyncHandler(async (req, res) => {
    const artistId = req.user.accountId

    if (!mongoose.isValidObjectId(artistId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid artist ID",
        });
    }

    const {
        search = "",
        merchType,
        campaignId,
        purchaseDate,
        page = 1,
        limit = 10,
    } = req.query;

    const currentPage = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));

    if (merchType && !mongoose.isValidObjectId(merchType)) {
        return res.status(400).json({
            success: false,
            message: "Invalid merchandise type ID",
        });
    }

    const artistObjectId = new mongoose.Types.ObjectId(artistId);

    const campaignIds = await Campaigns.distinct("_id", {
        artistId: artistObjectId,
    });

    let selectedCampaignId;

    if (campaignId) {
        if (!mongoose.isValidObjectId(campaignId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid campaign ID",
            });
        }

        selectedCampaignId = campaignIds.find(
            (id) => id.toString() === campaignId
        );

        if (!selectedCampaignId) {
            return res.status(200).json({
                success: true,
                message: "Artist fans retrieved successfully",
                data: {
                    summary: {
                        totalFans: 0,
                        totalMerchSold: 0,
                        uniqueProducts: 0,
                        repeatBuyers: 0,
                    },
                    pagination: {
                        page: currentPage,
                        limit: pageSize,
                        total: 0,
                        totalPages: 0,
                    },
                    fans: [],
                },
            });
        }
    }

    const tagMatch = {
        campaignId: selectedCampaignId || { $in: campaignIds },
        ownerId: { $ne: null },
    };

    if (purchaseDate) {
        const start = new Date(purchaseDate);

        if (Number.isNaN(start.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Invalid purchase date",
            });
        }

        start.setHours(0, 0, 0, 0);

        const end = new Date(start);
        end.setDate(end.getDate() + 1);

        tagMatch.activatedAt = {
            $gte: start,
            $lt: end,
        };
    }

    const fanPipeline = [
        { $match: tagMatch },

        {
            $lookup: {
                from: "fans",
                localField: "ownerId",
                foreignField: "_id",
                as: "fan",
            },
        },
        { $unwind: "$fan" },

        {
            $lookup: {
                from: "productvariants",
                localField: "productVariantId",
                foreignField: "_id",
                as: "variant",
            },
        },
        {
            $unwind: {
                path: "$variant",
                preserveNullAndEmptyArrays: true,
            },
        },

        {
            $lookup: {
                from: "products",
                localField: "variant.productId",
                foreignField: "_id",
                as: "product",
            },
        },
        {
            $unwind: {
                path: "$product",
                preserveNullAndEmptyArrays: true,
            },
        },

        {
            $lookup: {
                from: "producttypes",
                localField: "product.productTypeId",
                foreignField: "_id",
                as: "productType",
            },
        },
        {
            $unwind: {
                path: "$productType",
                preserveNullAndEmptyArrays: true,
            },
        },

        ...(merchType
            ? [
                {
                    $match: {
                        "product.productTypeId": new mongoose.Types.ObjectId(
                            merchType
                        ),
                    },
                },
            ]
            : []),

        {
            $group: {
                _id: "$ownerId",
                firstName: { $first: "$fan.firstName" },
                lastName: { $first: "$fan.lastName" },
                email: { $first: "$fan.email" },
                status: { $first: "$fan.status" },
                numberOfItems: { $sum: 1 },
                categories: { $addToSet: "$productType.type" },
                campaignIds: { $addToSet: "$campaignId" },
            },
        },

        {
            $addFields: {
                name: {
                    $trim: {
                        input: {
                            $concat: [
                                { $ifNull: ["$firstName", ""] },
                                " ",
                                { $ifNull: ["$lastName", ""] },
                            ],
                        },
                    },
                },
            },
        },

        ...(search.trim()
            ? [
                {
                    $match: {
                        $or: [
                            { name: { $regex: search.trim(), $options: "i" } },
                            { email: { $regex: search.trim(), $options: "i" } },
                        ],
                    },
                },
            ]
            : []),
    ];

    const [fans, countResult] = await Promise.all([
        Tags.aggregate([
            ...fanPipeline,
            { $sort: { name: 1 } },
            { $skip: (currentPage - 1) * pageSize },
            { $limit: pageSize },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    email: 1,
                    categories: 1,
                    numberOfItems: 1,
                    status: 1,
                    campaignIds: 1,
                },
            },
        ]),
        Tags.aggregate([...fanPipeline, { $count: "total" }]),
    ]);

    const totalFilteredFans = countResult[0]?.total || 0;

    const [
        fanIds,
        totalMerchSold,
        uniqueProducts,
        repeatBuyersResult,
    ] = await Promise.all([
        Tags.distinct("ownerId", {
            campaignId: { $in: campaignIds },
            ownerId: { $ne: null },
        }),

        Tags.countDocuments({
            campaignId: { $in: campaignIds },
            status: "activated",
        }),

        Products.countDocuments({
            artistId: artistObjectId,
        }),

        Tags.aggregate([
            {
                $match: {
                    campaignId: { $in: campaignIds },
                    ownerId: { $ne: null },
                },
            },
            {
                $group: {
                    _id: "$ownerId",
                    itemCount: { $sum: 1 },
                },
            },
            { $match: { itemCount: { $gt: 1 } } },
            { $count: "total" },
        ]),
    ]);

    return res.status(200).json({
        success: true,
        message: "Artist fans retrieved successfully",
        data: {
            summary: {
                totalFans: fanIds.length,
                totalMerchSold,
                uniqueProducts,
                repeatBuyers: repeatBuyersResult[0]?.total || 0,
            },
            pagination: {
                page: currentPage,
                limit: pageSize,
                total: totalFilteredFans,
                totalPages: Math.ceil(totalFilteredFans / pageSize),
            },
            fans,
        },
    });
});



module.exports = { artistFanDashboard };
