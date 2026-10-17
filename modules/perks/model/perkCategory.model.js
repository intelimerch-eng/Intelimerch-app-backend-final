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

        tierId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "tiers",
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

const PerkCategory = mongoose.model("perk-categories", perkCategorySchema)

module.exports = PerkCategory