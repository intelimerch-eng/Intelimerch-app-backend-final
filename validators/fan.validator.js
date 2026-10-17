const Joi = require("joi");

const fanActivationSchema = Joi.object({
    tapToken: Joi.string()
        .trim()
        .required(),

    ownerToken: Joi.string()
        .trim(),
        

    firstName: Joi.string()
        .trim()
        .required(),

    lastName: Joi.string()
        .trim()
        .allow("", null),

    email: Joi.string()
        .trim()
        .lowercase()
        .email()
        .required(),

    phone: Joi.string()
        .trim()
        .required(),

    deviceType: Joi.string()
        .trim()
        .valid("android", "ios", "web")
        .required(),

    location: Joi.object({
        country: Joi.string()
            .trim()
            .optional(),

        state: Joi.string()
            .trim()
            .optional(),

        city: Joi.string()
            .trim()
            .optional(),
    }).optional(),

    consentGiven: Joi.boolean()
        .valid(true)
        .required()
        .messages({
            "any.only": "You must agree to the Privacy Policy to continue."
        })
});

module.exports = { fanActivationSchema };