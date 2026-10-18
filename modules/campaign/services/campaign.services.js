const Campaigns = require("../model/campaign.model")
const CampaignPerks = require("../model/campaignPerks.model")
const CampaignProducts = require("../model/campaignProducts.model")
const CampaignPages = require("../model/campaignPage.model")
const Perks = require("../../perks/model/perk.model")
const {
    uploadToCloudinary,
    deleteFromCloudinary,
} = require("../../../services/cloudinaryService");


async function isCampaignExist(campaignId) {
    const isCampaignExist = await Campaigns.findOne({ _id: campaignId })
    if (!isCampaignExist) {
        return false
    }
    return true
}

const createCampaignService = async (
    accountId,
    campaignName,
    startDate,
    endDate,
    perks = [],
    media,
    mediaType,
    mediaUrl,
    file,
    status,
    session
) => {
    // Campaign name must be unique.
    const isCampaignExist = await Campaigns.findOne({
        campaignName,
    }).session(session);

    if (isCampaignExist) {
        const error = new Error(
            `"${campaignName}" is not available, name already used.`
        );
        error.statusCode = 400;
        throw error;
    }

    // Validate that required media is provided.
    if (
        !mediaUrl &&
        ["audio", "video", "image", "document"].includes(mediaType) &&
        !file
    ) {
        const error = new Error("Media file is missing");
        error.statusCode = 400;
        throw error;
    }

    // Validate perk ownership and existence.
    for (let count = 0; count < perks.length; count++) {
        const isPerkExist = await Perks.findOne({
            _id: perks[count],
            artistId: accountId,
        }).session(session);

        if (!isPerkExist) {
            const error = new Error(
                `Perk of Id ${perks[count]} does not exist`
            );
            error.statusCode = 400;
            throw error;
        }
    }

    let uploaded;

    try {
        // Upload a file unless this is a link campaign.
        if (mediaType !== "link" && file) {
            uploaded = await uploadToCloudinary(file, "intelimerch/campaigns");
        }

        // Create campaign.
        const [newCampaign] = await Campaigns.create(
            [
                {
                    artistId: accountId,
                    campaignName,
                    startDate,
                    endDate,
                    mediaType,
                    fileUrl: uploaded?.url || mediaUrl,
                    filePublicId: uploaded?.publicId,
                    fileResourceType: uploaded?.resourceType,
                    status,
                },
            ],
            { session }
        );

        // Associate perks with the campaign.
        const campaignPerks = await createCampaignPerks(
            perks,
            newCampaign._id,
            session
        );

        return [newCampaign, campaignPerks];
    } catch (error) {
        // Remove the uploaded asset if subsequent database operations fail.
        if (uploaded?.publicId && uploaded?.resourceType) {
            try {
                await deleteFromCloudinary(
                    uploaded.publicId,
                    uploaded.resourceType
                );
            } catch (cleanupError) {
                console.error(
                    "Failed to clean up Cloudinary campaign media:",
                    cleanupError
                );
            }
        }

        throw error;
    }
};

const createCampaignPageService = async (accountId, campaignId, pageStructure) => {
    if (!(await Campaigns.findOne({ _id: campaignId, artistId: accountId }))) {
        const error = new Error("Campaign not found")
        error.statusCode = 400
        throw error
    }

    const campaignPage = await CampaignPages.create({
        campaignId,
        pageStructure
    })

    return campaignPage
}

async function createCampaignPerks(perkIds, campaignId, session) {

    // validate if perks already exist in campaign
    const existingPerk = await CampaignPerks.findOne({
        campaignId,
        perkId: { $in: perkIds }
    }).session(session);
    if (existingPerk) {
        const error = new Error("Duplicate perk error. One or more perks already exist in campaign");
        error.statusCode = 400
        throw error
    }

    let campaignPerksData = []
    for (let count = 0; count < perkIds.length; count++) {
        const data = {
            campaignId: campaignId,
            perkId: perkIds[count]
        }
        campaignPerksData.push(data)
    }

    const campaignPerks = await CampaignPerks.insertMany(campaignPerksData, { session })
    return campaignPerks
}

async function getArtistCampaignsService(artistId, page, limit, skip, search, status) {
    const filter = {
        artistId
    };

    if (search) {
        filter.campaignName = {
            $regex: search,
            $options: "i"
        };
    }

    if (status) {
        filter.status = status;
    }

    const [campaigns, total] = await Promise.all([
        Campaigns.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),

        Campaigns.countDocuments(filter)
    ]);

    return [campaigns, total]

}





module.exports = { createCampaignService, createCampaignPageService, createCampaignPerks, getArtistCampaignsService }