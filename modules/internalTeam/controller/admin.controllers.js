const asyncHandler = require("express-async-handler");
const perkCategory = require("../model/perk-category.model")




const createCategory = async (req, res) => {
    const { name, description, avatar } = req.body

    if (!name || !description || !avatar) {
        const error = new Error("Required fields missing")
        error.statusCode = 400
        throw error
    }

    const category = await PerkCategory.create({
        name,
        description,
        avatar,
    })

    res.status(201).json({
        success: true,
        message: "Category created successfully",
        data: category,
    })
}

const getPerkCategories = asyncHandler(async (req, res) => {
    const perkCategories = await PerkCategory.find().sort({ name: 1 });

    res.status(200).json({
        success: true,
        data: perkCategories,
    });
});



module.exports = {
    createCategory, getPerkCategories
};