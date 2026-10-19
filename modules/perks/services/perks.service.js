const mongoose = require("mongoose")
const Perks = require("../model/perk.model");
const PerkCategory = require("../model/perkCategory.model")
const Campaigns = require("../../campaign/model/campaign.model")
const CampaignPerks = require("../../campaign/model/campaignPerks.model")
const validateObjectId = require("../../../utils/objectIdValidators")
const {
    uploadToCloudinary,
    deleteFromCloudinary,
} = require("../../../services/cloudinaryService");


const createPerkService = async ({
    artistId,
    perkName,
    perkCategoryId,
    contentType,
    description,
    file,
}) => {
    let uploadedAsset;

    try {
        const allowedContentTypes = [
            "audio",
            "video",
            "image",
            "link",
            "document",
        ];

        if (!allowedContentTypes.includes(contentType)) {
            const error = new Error("Invalid perk content type.");
            error.statusCode = 400;
            throw error;
        }

        const category = await PerkCategory.findById(perkCategoryId);

        if (!category) {
            const error = new Error("Perk category does not exist.");
            error.statusCode = 400;
            throw error;
        }

        const matchesContentType = {
            audio: file.mimetype.startsWith("audio/"),
            video: file.mimetype.startsWith("video/"),
            image: file.mimetype.startsWith("image/"),
            document: [
                "application/pdf",
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "application/vnd.ms-excel",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "text/plain",
                "text/csv",
            ].includes(file.mimetype),
            link: false,
        };

        if (!matchesContentType[contentType]) {
            const error = new Error(
                `The uploaded file does not match content type "${contentType}".`
            );
            error.statusCode = 400;
            throw error;
        }

        uploadedAsset = await uploadToCloudinary(
            file,
            `intelimerch/perks/${artistId}`
        );

        const perk = await Perks.create({
            artistId,
            perkName,
            perkCategoryId,
            contentType,
            fileUrl: uploadedAsset.url,
            description,
        });

        return perk;
    } catch (error) {
        if (uploadedAsset) {
            await deleteFromCloudinary(
                uploadedAsset.publicId,
                uploadedAsset.resourceType
            ).catch(() => { });
        }

        throw error;
    }
};


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

module.exports = { createPerkService, getPerksService, assignPerkToCampaignService }