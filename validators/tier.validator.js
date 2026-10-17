const Joi = require("joi")


const createTierSchema = Joi.object({
    name: Joi.string()
        .trim()
        .valid("1", "2", "3", "4")
        .required(),

    alias: Joi.string()
        .trim()
        .lowercase()
        .required(),

    description: Joi.string()
        .trim()
})

const updateTierSchema = Joi.object({
    alias: Joi.string()
        .trim()
        .lowercase()
        .required(),

    description: Joi.string()
        .trim()
})


module.exports = { createTierSchema, updateTierSchema }