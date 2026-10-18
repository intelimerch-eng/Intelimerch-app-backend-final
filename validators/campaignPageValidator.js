

const Joi = require("joi");

const createCampaignPageSchema = Joi.object({
    pageStructure: Joi.object()
        .min(1)
        .required()
        .messages({
            "any.required": "Page structure is required",
            "object.base": "Page structure must be an object",
            "object.min": "Page structure cannot be empty",
        }),
});

module.exports = {
    createCampaignPageSchema,
};