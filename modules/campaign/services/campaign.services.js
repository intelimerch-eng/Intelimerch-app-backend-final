const mongoose = require("mongoose");
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

const createCampaignPageService = async (
    accountId,
    campaignId,
    pageStructure,
    files = []
) => {
    const uploadedAssets = [];

    try {
        // 1. Validate campaign ID
        if (!mongoose.Types.ObjectId.isValid(campaignId)) {
            const error = new Error("Invalid campaign ID.");
            error.statusCode = 400;
            throw error;
        }

        // 2. Validate page structure
        if (
            !pageStructure ||
            typeof pageStructure !== "object" ||
            Array.isArray(pageStructure)
        ) {
            const error = new Error("A valid pageStructure is required.");
            error.statusCode = 400;
            throw error;
        }

        if (!Array.isArray(pageStructure.blocks)) {
            const error = new Error(
                "pageStructure.blocks must be an array."
            );
            error.statusCode = 400;
            throw error;
        }

        // 3. Confirm campaign ownership
        const campaign = await Campaigns.findOne({
            _id: campaignId,
            artistId: accountId,
        });

        if (!campaign) {
            const error = new Error("Campaign not found.");
            error.statusCode = 404;
            throw error;
        }

        // 4. Prevent duplicate page creation
        const existingPage = await CampaignPages.findOne({
            campaignId,
        });

        if (existingPage) {
            const error = new Error(
                "A page already exists for this campaign."
            );
            error.statusCode = 409;
            throw error;
        }

        // 5. Validate blocks and ensure block IDs are unique
        const blockIds = new Set();

        for (const block of pageStructure.blocks) {
            if (
                !block ||
                typeof block.blockId !== "string" ||
                !block.blockId.trim()
            ) {
                const error = new Error(
                    "Every block must have a valid blockId."
                );
                error.statusCode = 400;
                throw error;
            }

            if (blockIds.has(block.blockId)) {
                const error = new Error(
                    `Duplicate blockId: ${block.blockId}`
                );
                error.statusCode = 400;
                throw error;
            }

            blockIds.add(block.blockId);

            if (
                ![
                    "header",
                    "text",
                    "image",
                    "video",
                    "audio",
                    "button",
                    "footer",
                ].includes(block.type)
            ) {
                const error = new Error(
                    `Unsupported block type: ${block.type}`
                );
                error.statusCode = 400;
                throw error;
            }

            if (
                block.content === undefined ||
                block.content === null
            ) {
                const error = new Error(
                    `Block ${block.blockId} requires content.`
                );
                error.statusCode = 400;
                throw error;
            }
        }

        // 6. Validate uploaded file associations
        const mediaTypes = new Set(["image", "video", "audio"]);
        const filesByBlockId = new Map();

        for (const file of files) {
            const match = /^file_(.+)$/.exec(file.fieldname);

            if (!match) {
                const error = new Error(
                    `Unexpected file field: ${file.fieldname}`
                );
                error.statusCode = 400;
                throw error;
            }

            const blockId = match[1];

            if (!blockIds.has(blockId)) {
                const error = new Error(
                    `No page block exists for uploaded file: ${blockId}`
                );
                error.statusCode = 400;
                throw error;
            }

            const block = pageStructure.blocks.find(
                (item) => item.blockId === blockId
            );

            if (!mediaTypes.has(block.type)) {
                const error = new Error(
                    `Block ${blockId} does not support file uploads.`
                );
                error.statusCode = 400;
                throw error;
            }

            if (filesByBlockId.has(blockId)) {
                const error = new Error(
                    `Multiple files were supplied for block ${blockId}.`
                );
                error.statusCode = 400;
                throw error;
            }

            // Validate the actual file MIME type against the block.
            const matchesBlockType = {
                image: file.mimetype.startsWith("image/"),
                video: file.mimetype.startsWith("video/"),
                audio: file.mimetype.startsWith("audio/"),
            };

            if (!matchesBlockType[block.type]) {
                const error = new Error(
                    `Uploaded file type does not match block ${blockId}.`
                );
                error.statusCode = 400;
                throw error;
            }

            filesByBlockId.set(blockId, file);
        }

        // 7. Upload files and attach their metadata to blocks
        for (const block of pageStructure.blocks) {
            const file = filesByBlockId.get(block.blockId);

            if (!file) continue;

            const asset = await uploadToCloudinary(
                file,
                `intelimerch/campaign-pages/${campaignId}`
            );

            uploadedAssets.push(asset);

            // Preserve existing block content.
            const content =
                typeof block.content === "object" &&
                block.content !== null &&
                !Array.isArray(block.content)
                    ? block.content
                    : {};

            block.content = {
                ...content,
                url: asset.url,
                publicId: asset.publicId,
                resourceType: asset.resourceType,
                originalName: asset.originalName,
                format: asset.format,
                bytes: asset.bytes,
            };
        }

        // 8. Save using the agreed CampaignPages schema
        const campaignPage = await CampaignPages.create({
            campaignId,
            pageStructure,
        });

        return campaignPage;
    } catch (error) {
        // 9. Compensate for failed database creation or later errors.
        await Promise.allSettled(
            uploadedAssets.map((asset) =>
                deleteFromCloudinary(
                    asset.publicId,
                    asset.resourceType
                )
            )
        );

        throw error;
    }
};

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