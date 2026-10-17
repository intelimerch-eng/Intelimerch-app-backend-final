const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema(
    {
        artistId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "artists",
            required: true,
        },

        campaignName: {
            type: String,
            unique: true,
            required: true,
            trim: true,
        },

        startDate: {
            type: Date,
            required: true,
        },

        endDate: {
            type: Date,
            required: true,
        },

        mediaType: {
            type: String,
            required: false,
            enum: ["audio", "video", "image", "link", "document"],
        },

        fileUrl: {
            type: String,
            trim: true,
            required: false
        },

        // ===Analytics Starts===
        tapCount: {  // measures how many times the tags for this campaign has been tapped, regardless of whether the tap was successful or not
            type: Number,
            default: 0
        },

        tagCount: {
            type: Number,
            default: 0
        },

        scanCount: {  //measures successful scans only i.e scans that leads to page access
            type: Number,
            default: 0
        },

        claims: {
            type: Number,
            default: 0
        },

        conversionRate: {
            type: Number,
            default: 0
        },

        productsLinked: {
            type: Number,
            default: 0
        },
        // ===Analytics Ends===

        status: {
            type: String,
            enum: ["draft", "active", "paused"],
            default: "draft",
        }
    },
    {
        timestamps: true,
    }
);

const Campaigns = mongoose.model("campaigns", campaignSchema);

module.exports = Campaigns;