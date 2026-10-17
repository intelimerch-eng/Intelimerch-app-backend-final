const mongoose = require("mongoose")
const asyncHandler = require("express-async-handler")
const Taps = require("../tap/tap.model")
const Tags = require("../tags/tag.model")
const Campaigns = require("../campaign/model/campaign.model")
const validateObjectId = require("../../utils/objectIdValidators")



const dashboardAnalytics = asyncHandler(async (req, res) => {

    const artistId = req.user.accountId;


    const taps = await Taps.aggregate([
        {
            $lookup: {
                from: "tags",
                localField: "tagId",
                foreignField: "_id",
                as: "tag"
            }
        },
        { $unwind: "$tag" },

        {
            $lookup: {
                from: "campaigns",
                localField: "tag.campaignId",
                foreignField: "_id",
                as: "campaign"
            }
        },
        { $unwind: "$campaign" },

        {
            $match: {
                "campaign.artistId": new mongoose.Types.ObjectId(artistId)
            }
        }
    ]);

    const tags = await Tags.aggregate([
        {
            $lookup: {
                from: "campaigns",
                localField: "campaignId",
                foreignField: "_id",
                as: "campaign"
            }
        },
        { $unwind: "$campaign" },

        {
            $match: {
                "campaign.artistId": new mongoose.Types.ObjectId(artistId)
            }
        }
    ]);

    const repeatTaps = taps.filter((tap) => tap.tapType === "subsequent")

    const overallConversion = await Campaigns.aggregate([
        {
            $match: {
                artistId: new mongoose.Types.ObjectId(artistId)
            }
        },
        {
            $group: {
                _id: null,
                totalClaims: { $sum: "$claims" },
                totalSuccessfulScans: { $sum: "$scanCount" }
            }
        },
        {
            $project: {
                _id: 0,
                conversionRate: {
                    $cond: [
                        { $eq: ["$totalSuccessfulScans", 0] },
                        0,
                        {
                            $round: [
                                {
                                    $multiply: [
                                        {
                                            $divide: [
                                                "$totalClaims",
                                                "$totalSuccessfulScans"
                                            ]
                                        },
                                        100
                                    ]
                                },
                                1
                            ]
                        }
                    ]
                }
            }
        }
    ]);

    const scanTimeline = await Taps.aggregate([
        {
            $lookup: {
                from: "tags",
                localField: "tagId",
                foreignField: "_id",
                as: "tag"
            }
        },
        { $unwind: "$tag" },

        {
            $lookup: {
                from: "campaigns",
                localField: "tag.campaignId",
                foreignField: "_id",
                as: "campaign"
            }
        },
        { $unwind: "$campaign" },

        {
            $match: {
                "campaign.artistId": new mongoose.Types.ObjectId(artistId)
            }
        },

        {
            $facet: {

                "12Months": [
                    {
                        $match: {
                            createdAt: {
                                $gte: new Date(new Date().setMonth(new Date().getMonth() - 12))
                            }
                        }
                    },
                    {
                        $group: {
                            _id: {
                                year: { $year: "$createdAt" },
                                month: { $month: "$createdAt" }
                            },
                            value: { $sum: 1 }
                        }
                    },
                    { $sort: { "_id.year": 1, "_id.month": 1 } }
                ],

                "3Months": [
                    {
                        $match: {
                            createdAt: {
                                $gte: new Date(new Date().setMonth(new Date().getMonth() - 3))
                            }
                        }
                    },
                    {
                        $group: {
                            _id: {
                                year: { $year: "$createdAt" },
                                month: { $month: "$createdAt" }
                            },
                            value: { $sum: 1 }
                        }
                    },
                    { $sort: { "_id.year": 1, "_id.month": 1 } }
                ],

                "30Days": [
                    {
                        $match: {
                            createdAt: {
                                $gte: new Date(new Date().setDate(new Date().getDate() - 30))
                            }
                        }
                    },
                    {
                        $group: {
                            _id: {
                                year: { $year: "$createdAt" },
                                month: { $month: "$createdAt" },
                                day: { $dayOfMonth: "$createdAt" }
                            },
                            value: { $sum: 1 }
                        }
                    },
                    { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
                ],

                "7Days": [
                    {
                        $match: {
                            createdAt: {
                                $gte: new Date(new Date().setDate(new Date().getDate() - 7))
                            }
                        }
                    },
                    {
                        $group: {
                            _id: {
                                year: { $year: "$createdAt" },
                                month: { $month: "$createdAt" },
                                day: { $dayOfMonth: "$createdAt" }
                            },
                            value: { $sum: 1 }
                        }
                    },
                    { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
                ],

                "24Hours": [
                    {
                        $match: {
                            createdAt: {
                                $gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
                            }
                        }
                    },
                    {
                        $group: {
                            _id: {
                                year: { $year: "$createdAt" },
                                month: { $month: "$createdAt" },
                                day: { $dayOfMonth: "$createdAt" },
                                hour: { $hour: "$createdAt" }
                            },
                            value: { $sum: 1 }
                        }
                    },
                    { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.hour": 1 } }
                ]
            }
        }
    ]);

    const topLocations = await Taps.aggregate([
        {
            $lookup: {
                from: "tags",
                localField: "tagId",
                foreignField: "_id",
                as: "tag"
            }
        },
        { $unwind: "$tag" },

        {
            $lookup: {
                from: "campaigns",
                localField: "tag.campaignId",
                foreignField: "_id",
                as: "campaign"
            }
        },
        { $unwind: "$campaign" },

        {
            $match: {
                "campaign.artistId": new mongoose.Types.ObjectId(artistId)
            }
        },

        {
            $group: {
                _id: "$location.city",
                value: { $sum: 1 }
            }
        },

        {
            $project: {
                _id: 0,
                label: "$_id",
                value: 1
            }
        },

        {
            $sort: {
                value: -1
            }
        },

        {
            $limit: 5
        }
    ]);


    const campaignPerformance = await Campaigns.aggregate([
        {
            $match: {
                artistId: new mongoose.Types.ObjectId(artistId)
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $project: {
                _id: 1,
                campaignName: 1,
                productsLinked: 1,
                dateCreated: "$createdAt",
                scans: "$scanCount",
                conversion: "$conversionRate",
                status: 1
            }
        }
    ]);

    // const taps = await Taps.find().populate({
    //     path: "tagId",
    //     populate: {
    //         path: "campaignId",
    //         match: { artistId }
    //     }
    // });

    const analyticsData = {
        totalNFCScans: { count: taps.length, percentage: null },
        uniqueActivations: { count: tags.length, percentage: null },
        repeatScans: { count: repeatTaps.length, percentage: null },
        conversionRate: { count: overallConversion[0]?.conversionRate || 0, percentage: null },
        scanTimeline, //[{yr, mnth, dy, hr, number}...]
        campaignPerformance
    }

    return res.status(200).json({ analyticsData })

})


const campaignAnalytics = asyncHandler(async (req, res) => {

    const { campaignId } = req.params

    // campaign cards data
    await validateObjectId(campaignId, Campaigns, "campaign");
    const campaign = await Campaigns.findById(campaignId)

    // Tag table data
    const tags = await Tags.find({ campaignId })
        .select("tagId tapCount lastTappedAt productVariantId")
        .populate({
            path: "productVariantId",
            select: "productId",
            populate: {
                path: "productId",
                select: "productName"
            }
        })
        .sort({ createdAt: 1 });

    const campaignTags = tags.map((tag) => ({
        id: tag._id,
        tagId: tag.tagId,
        product: tag.productVariantId?.productId?.productName || null,
        scans: tag.tapCount,
        lastScan: tag.lastTappedAt
    }));

    // Charts
    // scanTimeLine chart
    const scanTimeline = await Taps.aggregate([
        {
            $match: {
                campaignId: new mongoose.Types.ObjectId(campaignId)
            }
        },

        {
            $facet: {

                "12Months": [
                    {
                        $match: {
                            createdAt: {
                                $gte: new Date(new Date().setMonth(new Date().getMonth() - 12))
                            }
                        }
                    },
                    {
                        $group: {
                            _id: {
                                year: { $year: "$createdAt" },
                                month: { $month: "$createdAt" }
                            },
                            value: { $sum: 1 }
                        }
                    },
                    { $sort: { "_id.year": 1, "_id.month": 1 } }
                ],

                "3Months": [
                    {
                        $match: {
                            createdAt: {
                                $gte: new Date(new Date().setMonth(new Date().getMonth() - 3))
                            }
                        }
                    },
                    {
                        $group: {
                            _id: {
                                year: { $year: "$createdAt" },
                                month: { $month: "$createdAt" }
                            },
                            value: { $sum: 1 }
                        }
                    },
                    { $sort: { "_id.year": 1, "_id.month": 1 } }
                ],

                "30Days": [
                    {
                        $match: {
                            createdAt: {
                                $gte: new Date(new Date().setDate(new Date().getDate() - 30))
                            }
                        }
                    },
                    {
                        $group: {
                            _id: {
                                year: { $year: "$createdAt" },
                                month: { $month: "$createdAt" },
                                day: { $dayOfMonth: "$createdAt" }
                            },
                            value: { $sum: 1 }
                        }
                    },
                    { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
                ],

                "7Days": [
                    {
                        $match: {
                            createdAt: {
                                $gte: new Date(new Date().setDate(new Date().getDate() - 7))
                            }
                        }
                    },
                    {
                        $group: {
                            _id: {
                                year: { $year: "$createdAt" },
                                month: { $month: "$createdAt" },
                                day: { $dayOfMonth: "$createdAt" }
                            },
                            value: { $sum: 1 }
                        }
                    },
                    { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
                ],

                "24Hours": [
                    {
                        $match: {
                            createdAt: {
                                $gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
                            }
                        }
                    },
                    {
                        $group: {
                            _id: {
                                year: { $year: "$createdAt" },
                                month: { $month: "$createdAt" },
                                day: { $dayOfMonth: "$createdAt" },
                                hour: { $hour: "$createdAt" }
                            },
                            value: { $sum: 1 }
                        }
                    },
                    {
                        $sort: {
                            "_id.year": 1,
                            "_id.month": 1,
                            "_id.day": 1,
                            "_id.hour": 1
                        }
                    }
                ]
            }
        }
    ]);

    // scanPerTag Chart
    const scansPerTag = await Tags.aggregate([
        {
            $match: {
                campaignId: new mongoose.Types.ObjectId(campaignId)
            }
        },

        {
            $project: {
                _id: 0,
                label: "$tagId",
                value: "$tapCount"
            }
        },

        {
            $sort: {
                value: -1
            }
        }
    ]);

    // top performing tags
    const topPerformingTags = await Tags.find({ campaignId })
        .select("tagId tapCount productVariantId")
        .populate({
            path: "productVariantId",
            select: "productId colorId",
            populate: [
                {
                    path: "productId",
                    select: "productName"
                },
                {
                    path: "colorId",
                    select: "colorName"
                }
            ]
        })
        .sort({ tapCount: -1 })
        .limit(5);

    const topPerformingTagsStructured = topPerformingTags.map(tag => ({
        tagId: tag.tagId,
        scans: tag.tapCount,
        product: `${tag.productVariantId?.productId?.productName || ""} — ${tag.productVariantId?.colorId?.colorName || ""}`
    }));


    const campaignAnalyticsData = {
        // Summary cards
        totalTags: {
            count: campaign.tagCount
        },

        totalScans: {
            count: campaign.scanCount,
            percentage: null
        },

        avgScansPerTag: {
            count: campaign.tagCount === 0
                ? 0
                : Math.round(campaign.scanCount / campaign.tagCount)
        },

        topTagScans: {
            count: 0,
            percentage: null
        },

        // All campaign tags table
        allTags: campaignTags,

        // Charts
        scanTimeline: scanTimeline,

        scansPerTag: scansPerTag,

        topPerformingTags: topPerformingTagsStructured
    };


    res.status(200).json({
        success: true,
        message: `${campaign.campaignName} campaign analytics retrieved successfully`,
        data: campaignAnalyticsData
    })

})




module.exports = { dashboardAnalytics, campaignAnalytics }