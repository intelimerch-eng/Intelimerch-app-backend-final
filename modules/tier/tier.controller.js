const Tiers = require("./tier.model")
const asyncHandler = require("express-async-handler")


const createTier = async (req, res) => {

    const { name, alias, description } = req.body

    const tier = await Tiers.create({
        name,
        alias,
        description
    })

    return res.status(201).json({
        message: "Tier created successfully",
        data: tier
    })
}

const getTiers = asyncHandler(async (req, res) => {

    const tiers = await Tiers.find({})

    return res.status(200).json({
        success: true,
        message: "Tiers retrieved",
        data: { tiers }
    })
})


const updateTier = asyncHandler(async (req, res) => {
    const { tierId } = req.params
    const { alias, description } = req.body

    const updatedTier = await Tiers.findByIdAndUpdate(tierId, { alias, description }, { afterDocument: true, runValidators: true })

    return res.status(200).json({
        success: true,
        message: "Tier updated successfully",
        data: { tier: updatedTier }
    })

})




module.exports = { createTier, getTiers, updateTier }