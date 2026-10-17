const Joi = require("joi");

const registerArtistSchema = Joi.object({
    firstName: Joi.string()
        .trim()
        .min(2)
        .max(50)
        .required(),

    middleName: Joi.string()
        .trim()
        .min(2)
        .max(50)
        .allow("")
        .optional(),

    lastName: Joi.string()
        .trim()
        .min(2)
        .max(50)
        .required(),

    userName: Joi.string()
        .trim()
        .min(3)
        .max(30)
        .required(),

    email: Joi.string()
        .trim()
        .lowercase()
        .email()
        .required(),

    phone: Joi.string()
        .trim()
        .required(),

    password: Joi.string()
        .min(8)
        .max(128)
        .required()
});



module.exports = { registerArtistSchema }