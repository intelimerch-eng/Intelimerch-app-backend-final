const mongoose = require("mongoose")
const Perks = require("../model/perk.model");
const Campaigns = require("../../campaign/model/campaign.model")
const CampaignPerks = require("../../campaign/model/campaignPerks.model")
const validateObjectId = require("../../../utils/objectIdValidators")


async function getPerksService(artistId, limit, skip) {
    const [perks, total] = await Promise.all([
        Perks.find({ artistId })
            .populate("perkCategoryId", "name")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Perks.countDocuments({ artistId }),
    ]);

    return [perks, total]

}


async function assignPerkToCampaignService(artistId, perkId, campaignId) {
    await validateObjectId(campaignId, Campaigns, "campaign")
    const campaign = await validateObjectId(perkId, Perks, "perk")

    if (campaign.artistId !== mongoose.Types.ObjectId(artistId)) {
        const error = new Error("Campaign not found");
        error.statusCode = 400;
        throw error;
    }

    const data = {
        campaignId,
        perkId
    }
    const campaignPerk = await CampaignPerks.create(data)

    return campaignPerk
}

module.exports = { getPerksService, assignPerkToCampaignService }