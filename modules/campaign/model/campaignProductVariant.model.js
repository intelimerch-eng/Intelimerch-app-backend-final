const mongoose = require("mongoose");


const campaignProductVariantSchema = new mongoose.Schema({

    campaignProductId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "campaign-products",
        required: true,
    },

    variant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product-variants",
        required: true
    }
},
    {
        timestamps: true,
    }
)


const campaignProductVariants = mongoose.model("campaign-product-variants", campaignProductVariantSchema)
module.exports = campaignProductVariants