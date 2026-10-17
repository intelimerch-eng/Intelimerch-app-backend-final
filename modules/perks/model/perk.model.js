const mongoose = require("mongoose");

const perkSchema = new mongoose.Schema(
    {
        artistId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "artists",
            required: true,
        },

        perkCategoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "perk-category",
            required: true,
        },

        perkName: {
            type: String,
            required: true,
            trim: true,
        },

        contentType: {
            type: String,
            required: true,
            enum: ["audio", "video", "image", "link", "document"],
        },

        fileUrl: {
            type: String,
            trim: true,
            required: true,
        },

        description: {
            type: String,
            trim: true,
        },

        status: {
            type: String,
            enum: ["active", "inactive", "expired"],
            default: "inactive"
        }
    },
    {
        timestamps: true,
    }
);

const Perks = mongoose.model("perks", perkSchema);

module.exports = Perks;