const mongoose = require("mongoose")
const asyncHandler = require("express-async-handler");
const Products = require("../../products/models/product.model")
const Perks = require("../../perks/model/perk.model")
const Campaigns = require("../model/campaign.model")
const CampaignPages = require("../model/campaignPage.model")
const campaignPerks = require("../model/campaignPerks.model")
const Tiers = require("../../tier/tier.model")
const generateTag = require("../../tags/tag.model")
const throwError = require("../../../shared/utils/throwError")
const { createCampaignService, createCampaignPageService, createCampaignPerks, getArtistCampaignsService } = require("../services/campaign.services");
const {
    deleteFromCloudinary,
} = require("../../../services/cloudinaryService");


// Validators
// isCampaignExist
async function isCampaignExist(campaignId) {
    const isCampaignExist = await Campaigns.findOne({ _id: campaignId })
    if (!isCampaignExist) {
        return false
    }
    return true
}


const createCampaign = asyncHandler(async (req, res) => {
    const session = await mongoose.startSession();

    let campaign;
    let transactionCommitted = false;

    try {
        session.startTransaction();

        const accountId = req.user.accountId;

        const {
            campaignName,
            startDate,
            endDate,
            perks = [],
            media,
            mediaType,
            mediaUrl,
            status,
        } = req.body;

        const file = req.file;

        const result = await createCampaignService(
            accountId,
            campaignName,
            startDate,
            endDate,
            perks,
            media,
            mediaType,
            mediaUrl,
            file,
            status,
            session
        );

        // The service returns [campaign, campaignPerks].
        campaign = Array.isArray(result) ? result[0] : result;

        await session.commitTransaction();
        transactionCommitted = true;

        res.status(201).json({
            message: "Campaign created successfully",
            campaign,
        });
    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }

        // If the database transaction did not commit, remove the uploaded asset.
        if (
            !transactionCommitted &&
            campaign?.filePublicId &&
            campaign?.fileResourceType
        ) {
            try {
                await deleteFromCloudinary(
                    campaign.filePublicId,
                    campaign.fileResourceType
                );
            } catch (cleanupError) {
                console.error(
                    "Failed to clean up campaign media after transaction failure:",
                    cleanupError
                );
            }
        }

        throw error;
    } finally {
        await session.endSession();
    }
});


const createCampaignPage = asyncHandler(async (req, res) => {
    const accountId = req.user.accountId;
    const { campaignId } = req.params;

    let { pageStructure } = req.body;

    if (typeof pageStructure === "string") {
        try {
            pageStructure = JSON.parse(pageStructure);
        } catch {
            const error = new Error(
                "pageStructure must contain valid JSON."
            );
            error.statusCode = 400;
            throw error;
        }
    }

    const campaignPage = await createCampaignPageService(
        accountId,
        campaignId,
        pageStructure,
        req.files || []
    );

    return res.status(201).json({
        success: true,
        message: "Campaign page created successfully.",
        data: {
            campaignPage,
        },
    });
});


const getCampaigns = asyncHandler(async (req, res) => {
    const artistId = req.user.accountId;

    const IP = req.ip
    console.log({ IP })
    // Getting location via reverse geocoding
    // https://nominatim.openstreetmap.org/reverse?lat=<value>&lon=<value>&<params>

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const { search, status } = req.query;

    const [campaigns, total] = await getArtistCampaignsService(artistId, page, limit, skip, search, status)

    return res.status(200).json({
        success: true,
        message: "Campaigns retrieved successfully.",
        data: campaigns,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page < Math.ceil(total / limit),
            hasPreviousPage: page > 1
        }
    });
});



const deleteCampaign = asyncHandler(async (req, res) => {
    const { campaignId } = req.params;


    const deletedCampaign = await Campaigns.findByIdAndDelete(campaignId);

    if (!deletedCampaign) {
        const error = new Error("Campaign not found");
        error.statusCode = 404;
        throw error;
    }

    return res.status(200).json({
        success: true,
        message: "Campaign deleted successfully."
    });

});



module.exports = {
    createCampaign,
    createCampaignPage,
    getCampaigns,
    deleteCampaign
}
