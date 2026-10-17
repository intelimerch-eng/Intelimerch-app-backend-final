const Tags = require("./tag.model")
const Campaigns = require("../campaign/model/campaign.model")
const asyncHandler = require("express-async-handler")


// get all tags
const getTags = asyncHandler(async (req, res) => {

    const artistId = req.user.accountId
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
        Tags.find({ artistId })  //make the artistId in campaignId equals the artistId from the query
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Tags.countDocuments({ artistId }),
    ]);

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

// get campaign all tags
const getCampaignTags = asyncHandler(async (req, res) => {

    const artistId = req.user.accountId
    const { campaignId } = req.params
    // verify campaign
    const isCampaignValid = await Campaigns.findOne({ _id: campaignId, artistId })
    if (!isCampaignValid) {
        return res.status(400).send("Campaign not found for artist")
    }
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [tags, total] = await Promise.all([
        Tags.find({ campaignId })
            .populate({
                path: "productVariantId",
                populate: [
                    {
                        path: "productId",
                        populate: [
                            { path: "productTypeId", select: "type", }
                        ]
                    },
                    { path: "colorId", select: "name" },
                    { path: "sizeId", select: "size" }
                ]
            })
            .populate("campaignId")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Tags.countDocuments({ campaignId }),
    ]);

    res.status(200).json({
        success: true,
        data: { tags },
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    });
});

// get artist tagss
const getArtistTags = asyncHandler(async (req, res) => {
    const artistId = req.user.accountId;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Get all campaigns belonging to the artist
    const campaigns = await Campaigns.find({ artistId }).select("_id");
    const campaignIds = campaigns.map(c => c._id);

    const [tags, total] = await Promise.all([
        Tags.find({
            campaignId: { $in: campaignIds }
        })
            .populate({
                path: "campaignId",
                select: "campaignName"
            })
            .populate({
                path: "productVariantId",
                select: "sku productId colorId sizeId",
                populate: [
                    {
                        path: "productId",
                        select: "productTypeId",
                        populate: {
                            path: "productTypeId",
                            select: "name"
                        }
                    },
                    {
                        path: "colorId",
                        select: "name"
                    },
                    {
                        path: "sizeId",
                        select: "size"
                    }
                ]
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),

        Tags.countDocuments({
            campaignId: { $in: campaignIds }
        })
    ]);

    const tagTable = tags.map(tag => ({
        id: tag._id,

        nfcLink: `${process.env.FRONTEND_BASE_URL}/nfc/io/${tag._id}`,

        type: tag.productVariantId?.productId?.productTypeId?.name || null,

        color: tag.productVariantId?.colorId?.name || null,

        size: tag.productVariantId?.sizeId?.size || null,

        sku: tag.productVariantId?.sku || null,

        campaign: tag.campaignId?.campaignName || null,

        campaignId: tag.campaignId?._id || null,

        scans: tag.tapCount,

        tagId: tag.tagId
    }));

    return res.status(200).json({
        success: true,
        message: "Tags retrieved successfully",
        data: {
            tags: tagTable
        },
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    });
});



module.exports = { getTags, getCampaignTags, getArtistTags }