const mongoose = require("mongoose")

const perkCategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            required: true,
            trim: true,
        },

        avatar: {
            type: String,
            required: true,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
)

PerkCategory = mongoose.model("perk-category", perkCategorySchema)

module.exports = PerkCategory