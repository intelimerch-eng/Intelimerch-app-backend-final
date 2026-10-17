import mongoose from "mongoose";

const tagTapSchema = new mongoose.Schema(
    {
        tagId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "tags",
            required: true
        },

        userId: {  // note: it doesn't say ownerId but userId; useful to track the person trying to tap
            type: mongoose.Schema.Types.ObjectId,
            ref: "fans",
            default: null
        },

        success: {
            type: Boolean,
            enum: [true, false],
            default: null
        },

        ipAddress: {
            type: String,
            default: null
        },

        userAgent: {
            type: String,
            default: null
        },

        deviceType: {
            type: String,
            enum: ["mobile", "tablet", "desktop", "unknown"],
            default: "unknown"
        },

        location: {
            country: String,
            state: String,
            city: String
        }
    },
    { timestamps: true }
);


tagTapSchema.index({ tagId: 1, createdAt: -1 });
tagTapSchema.index({ userId: 1 });

const TagTaps = mongoose.model("tag-taps", tagTapSchema);
module.exports = TagTaps