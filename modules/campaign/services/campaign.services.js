const Campaigns = require("../model/campaign.model")
const CampaignPerks = require("../model/campaignPerks.model")
const CampaignProducts = require("../model/campaignProducts.model")
const CampaignPages = require("../model/campaignPage.model")
const Perks = require("../../perks/model/perk.model")
const uploadToCloudinary = require("../../../utils/uploadToCloudinary")


async function isCampaignExist(campaignId) {
    const isCampaignExist = await Campaigns.findOne({ _id: campaignId })
    if (!isCampaignExist) {
        return false
    }
    return true
}

const createCampaignService = async (accountId, campaignName, startDate, endDate, perks, media, mediaType, mediaUrl, file, status, session) => {
    // campaign Name must be unique
    const isCampaignExist = await Campaigns.findOne({ campaignName }).session(session)
    if (isCampaignExist) {
        const error = new Error(`"${campaignName}" is not available, name already used.`);
        error.statusCode = 400;
        throw error;
    }

    // validate uploaded file
    if (!mediaUrl && (["audio", "video", "image", "document"].includes(mediaType) && !file)) {
        const error = new Error("Media file is missing");
        error.statusCode = 400;
        throw error;
    }

    // validate perks existence
    for (let count = 0; count < perks.length; count++) {   // perks = ["perkId1", "perkId2", ...,"perkIdn"]
        const isPerkExist = await Perks.findOne({ _id: perks[count], artistId: accountId }).session(session)
        if (!isPerkExist) {
            const error = new Error(`Perk of Id ${perks[count]} does not exist`)
            error.statusCode = 400
            throw error
        }
    }

    // upload media to cdn
    let fileUrl
    if (mediaType != "link") {
        const uploaded = await uploadToCloudinary(file)
        fileUrl = uploaded.secure_url   //upload to cloudinary
        console.log({ uploaded })
    }


    // create campaign
    const [newCampaign] = await Campaigns.create([{
        artistId: accountId,
        campaignName,
        startDate,
        endDate,
        mediaType,
        fileUrl: fileUrl || mediaUrl,
        status
    }], { session });

    // create campaign perks
    const campaignPerks = await createCampaignPerks(perks, newCampaign._id, session)

    return [newCampaign, campaignPerks]
}

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