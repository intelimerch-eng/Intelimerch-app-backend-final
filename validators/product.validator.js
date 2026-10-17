const joi = require("joi")


const createProductSchema = joi.object({
    productName: joi.string()
        .required()
        .trim(),

    productType: joi.string()
        .required()
        .trim(),

    productCode: joi.string()
        .optional()
        .trim(),

    description: joi.string()
        .trim(),

    color: joi.string()
        .required()
        .trim(),

    size: joi.string()
        .required()
        .trim(),

    campaignId: joi.string()
        .hex()
        .length(24)
        .optional(),

    productTier: joi.string()  //collecting product tier name e.g "1"
        .length(1)
        .optional()
})



module.exports = { createProductSchema }