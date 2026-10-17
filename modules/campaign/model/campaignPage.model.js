const mongoose = require("mongoose")


const campaignPageSchema = new mongoose.Schema({
    campaignId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "campaigns",
        require: true
    },

    pageStructure: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    }
},
    {
        timestamps: true
    }
)


const CampaignPages = mongoose.model("campaign-page", campaignPageSchema)
module.exports = CampaignPages