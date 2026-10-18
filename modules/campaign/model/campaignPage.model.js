// const mongoose = require("mongoose")


// const campaignPageSchema = new mongoose.Schema({
//     campaignId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "campaigns",
//         require: true
//     },

//     pageStructure: {
//         type: mongoose.Schema.Types.Mixed,
//         required: true
//     }
// },
//     {
//         timestamps: true
//     }
// )


// const CampaignPages = mongoose.model("campaign-page", campaignPageSchema)
// module.exports = CampaignPages


// models/CampaignPages.js
const mongoose = require("mongoose");

const blockSchema = new mongoose.Schema(
    {
        blockId: {
            type: String,
            required: true,
        },

        type: {
            type: String,
            required: true,
            enum: [
                "header",
                "text",
                "image",
                "video",
                "audio",
                "button",
                "footer",
            ],
        },

        content: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
        },

        styles: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
    },
    {
        _id: false,
    }
);

const campaignPageSchema = new mongoose.Schema(
    {
        campaignId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "campaigns",
            required: true,
            unique: true,
        },

        pageStructure: {
            blocks: {
                type: [blockSchema],
                default: [],
            },

            styles: {
                type: mongoose.Schema.Types.Mixed,
                default: {},
            },

            settings: {
                type: mongoose.Schema.Types.Mixed,
                default: {},
            },

            socialLinks: {
                instagram: {
                    type: String,
                    trim: true,
                },

                youtube: {
                    type: String,
                    trim: true,
                },

                spotify: {
                    type: String,
                    trim: true,
                },
            },
        },

        status: {
            type: String,
            enum: ["draft", "published"],
            default: "draft",
        },

        publishedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

const CampaignPages = mongoose.model(
    "campaign-page",
    campaignPageSchema
);

module.exports = CampaignPages;