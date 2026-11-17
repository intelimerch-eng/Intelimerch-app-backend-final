const mongoose = require("mongoose")
const asyncHandler = require("express-async-handler");
const Perks = require("../model/perk.model");
const PerkCategory = require("../model/perkCategory.model")
const Campaigns = require("../../campaign/model/campaign.model")
const CampaignPerks = require("../../campaign/model/campaignPerks.model")
const { createPerkService, getPerksService, assignPerkToCampaignService } = require("../services/perks.service")
const validateObjectId = require("../../../utils/objectIdValidators")
const { uploadToCloudinary } = require("../../../services/cloudinaryService")


// A link perk stores an http(s) URL as its payload instead of an upload.
function isValidUrl(value) {
    try {
        const parsed = new URL(value);
        return ["http:", "https:"].includes(parsed.protocol);
    } catch {
        return false;
    }
}



const createPerk = asyncHandler(async (req, res) => {
    const artistId = req.user.accountId;

    console.log(
        `[perks] body parsed file=${req.file ? req.file.originalname : "none"} bytes=${req.file ? req.file.size : 0} mimetype=${req.file ? req.file.mimetype : "none"}`
    );

    const {
        perkName,
        perkCategoryId,
        contentType,
        description,
        linkUrl,
        fileUrl,
    } = req.body;

    if (!perkName || !perkCategoryId || !contentType) {
        const error = new Error("Required fields missing.");
        error.statusCode = 400;
        throw error;
    }

    // A link perk carries its payload as a URL; every other content type is
    // a real file and must be uploaded.
    const isLinkPerk = String(contentType).toLowerCase() === "link";
    const providedUrl = (linkUrl || fileUrl || "").trim();

    if (isLinkPerk) {
        if (!providedUrl) {
            const error = new Error("A URL is required for a link perk.");
            error.statusCode = 400;
            throw error;
        }

        if (!isValidUrl(providedUrl)) {
            const error = new Error("The link perk URL is not a valid URL.");
            error.statusCode = 400;
            throw error;
        }
    } else if (!req.file) {
        const error = new Error("A file is required.");
        error.statusCode = 400;
        throw error;
    }

    const perk = await createPerkService({
        artistId,
        perkName,
        perkCategoryId,
        contentType,
        description,
        file: req.file,
        linkUrl: providedUrl,
    });

    return res.status(201).json({
        success: true,
        message: "Perk created successfully.",
        data: perk,
    });
});

const getPerks = asyncHandler(async (req, res) => {
    const artistId = req.user.accountId;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [perks, total] = await getPerksService(artistId, limit, skip)

    res.status(200).json({
        success: true,
        data: perks,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    });
});

const assignPerkToCampaign = asyncHandler(async (req, res) => {

    const artistId = req.user.accountId;
    const { perkId } = req.params
    const { campaignId } = req.body



    const campaignPerk = await assignPerkToCampaignService(artistId, perkId, campaignId)

    return res.status(200).json({
        success: true,
        message: "Perk aasigned to campaign successfully",
        data: { campaignPerk }
    })
})

const updatePerk = asyncHandler(async (req, res) => {
    const artistId = req.user.accountId;
    const { perkId } = req.params;

    const perk = await Perks.findOne({
        _id: perkId,
        artistId,
    });

    if (!perk) {
        const error = new Error("Perk not found");
        error.statusCode = 404;
        throw error;
    }

    const allowedFields = [
        "perkName",
        "perkCategoryId",
        "contentType",
        "description",
    ];

    const body = req.body || {};

    allowedFields.forEach((field) => {
        if (body[field] !== undefined) {
            perk[field] = body[field];
        }
    });

    // Link perks keep their payload in the body; file-based perks accept a
    // replacement upload through Cloudinary (multer uses memory storage, so
    // there is no req.file.path to fall back on).
    const providedLink = (body.linkUrl || body.fileUrl || "").trim();

    if (perk.contentType === "link") {
        if (!providedLink) {
            const error = new Error("A URL is required for a link perk.");
            error.statusCode = 400;
            throw error;
        }

        if (!isValidUrl(providedLink)) {
            const error = new Error("The link perk URL is not a valid URL.");
            error.statusCode = 400;
            throw error;
        }

        perk.fileUrl = providedLink;
    } else if (req.file) {
        const uploaded = await uploadToCloudinary(
            req.file,
            `intelimerch/perks/${artistId}`
        );
        perk.fileUrl = uploaded.url;
    }

    const updatedPerk = await perk.save();

    res.status(200).json({
        success: true,
        message: "Perk updated successfully",
        data: updatedPerk,
    });
});

const deletePerk = asyncHandler(async (req, res) => {

    const artistId = req.user.accountId;
    const { perkId } = req.params;

    const perk = await Perks.findOne({
        _id: perkId,
        artistId,
    });

    if (!perk) {
        const error = new Error("Perk not found");
        error.statusCode = 404;
        throw error;
    }

    await perk.deleteOne();

    res.status(200).json({
        success: true,
        message: "Perk deleted successfully",
    });
});



module.exports = {
    createPerk, getPerks, assignPerkToCampaign, updatePerk, deletePerk
};