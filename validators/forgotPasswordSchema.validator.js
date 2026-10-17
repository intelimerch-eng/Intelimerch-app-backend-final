const Joi = require("joi");

const forgotPasswordSchema = Joi.object({
    email: Joi.string()
        .trim()
        .lowercase()
        .email()
        .required()
});

module.exports = { forgotPasswordSchema };