// models/Campaigns.js

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
            required: false,
        },

        filePublicId: {
            type: String,
            required: false,
        },

        fileResourceType: {
            type: String,
            enum: ["image", "video", "raw"],
            required: false,
        },

        // Analytics
        tapCount: {
            type: Number,
            default: 0,
        },

        tagCount: {
            type: Number,
            default: 0,
        },

        scanCount: {
            type: Number,
            default: 0,
        },

        claims: {
            type: Number,
            default: 0,
        },

        conversionRate: {
            type: Number,
            default: 0,
        },

        productsLinked: {
            type: Number,
            default: 0,
        },

        status: {
            type: String,
            enum: ["draft", "active", "paused"],
            default: "draft",
        },
    },
    {
        timestamps: true,
    }
);

const Campaigns = mongoose.model("campaigns", campaignSchema);

module.exports = Campaigns;