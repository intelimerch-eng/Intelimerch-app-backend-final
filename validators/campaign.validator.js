// validations/campaignValidation.js

const Joi = require("joi");

const createCampaignSchema = Joi.object({
    campaignName: Joi.string()
        .trim()
        .required(),

    startDate: Joi.date()
        .required(),

    endDate: Joi.date()
        .greater(Joi.ref("startDate"))
        .required()
        .messages({
            "date.greater": "End date must be later than start date",
        }),

    perks: Joi.array()
        .items(Joi.string().hex().length(24))
        .default([]),

    mediaType: Joi.string()
        .valid("audio", "video", "image", "link", "document")
        .allow("", null)
        .optional(),

    mediaUrl: Joi.string()
        .uri()
        .optional(),

    status: Joi.string()
        .valid("draft", "active", "paused")
        .default("draft"),
});

module.exports = {
    createCampaignSchema,
};