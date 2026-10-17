const mongoose = require("mongoose");

const tagSchema = new mongoose.Schema(
    {
        tagId: { //NFC-001
            type: String,
            required: true,
            unique: true,
            trim: true
        },


        campaignId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "campaigns",
            required: true
        },

        productVariantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "product-variants",
            required: true
        },

        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "fans",
            default: null
        },

        tapCount: {
            type: Number,
            default: 0,
            min: 0
        },

        lastTappedAt: {
            type: Date,
            default: null
        },

        status: {
            type: String,
            enum: ["unassigned", "assigned", "activated", "disabled"],
            default: "unassigned"
        },

        activatedAt: {
            type: Date,
            default: null
        },

        claimedAt: {
            type: Date,
            default: null
        },

        activatingLocation: {
            country: String,
            state: String,
            city: String,
        },

        activatingDevice: {
            type: String,
            enum: ["mobile", "tablet", "desktop", "unknown"],
            default: "unknown"
        }
    },
    { timestamps: true }
);


tagSchema.index({ productVariantId: 1 });
tagSchema.index({ ownerId: 1 });

const Tags = mongoose.model("tags", tagSchema);
module.exports = Tags