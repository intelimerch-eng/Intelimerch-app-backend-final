const mongoose = require("mongoose");


const campaignProductSchema = new mongoose.Schema({

    campaignId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "campaigns",
        required: true,
    },

    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "products",
        required: true
    },

    tierId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "tiers",
        required: true
    },

    status: {
        type: String,
        enum: ["pending", "active", "disabled"],
    }
},
    {
        timestamps: true,
    }
)


const campaignProducts = mongoose.model("campaign-products", campaignProductSchema)
module.exports = campaignProducts