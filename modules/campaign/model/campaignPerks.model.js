const mongoose = require("mongoose");


const campaignPerksSchema = new mongoose.Schema({

    campaignId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "campaigns",
        required: true,
    },

    perkId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "perks",
        required: true
    }
},
    {
        timestamps: true,
    }
)


const campaignPerks = mongoose.model("campaign-Perks", campaignPerksSchema)
module.exports = campaignPerks

