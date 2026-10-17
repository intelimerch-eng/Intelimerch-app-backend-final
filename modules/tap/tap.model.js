const mongoose = require("mongoose")


const tapSchema = new mongoose.Schema(
    {
        tagId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "tags",
            required: true
        },

        campaignId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "campaigns",
            required: true
        },

        artistId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "artists",
            required: true
        },

        userId: {  // note: it doesn't say ownerId but userId; anyone can attempt a tap, doesn't but everyone wil =l be granted access; useful to track the person trying to tap
            type: mongoose.Schema.Types.ObjectId,
            ref: "fans",
            default: null
        },

        success: {  // success if activation is successful on first tap, oron subsequent tap if ownerId is same as tag ownerId and access is eventually granted
            type: Boolean,
            enum: [true, false],
            default: null
        },

        tapType: {
            type: String,
            enum: ["fresh", "subsequent", "illegal"],
            required: true
        },

       deviceType: {
    type: String,
    enum: ["android", "ios", "web"],
    default: "web"
},

        location: {
            country: String,
            state: String,
            city: String
        }
    },
    { timestamps: true }
);


// tagTapSchema.index({ tagId: 1, createdAt: -1 });
// tagTapSchema.index({ userId: 1 });

const Taps = mongoose.model("taps", tapSchema);
module.exports = Taps