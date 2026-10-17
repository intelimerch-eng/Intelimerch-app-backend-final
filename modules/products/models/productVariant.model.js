const { required } = require("joi")
const mongoose = require("mongoose")


const productVariantSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "products",
        required: true
    },
    colorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "colors",
    },
    sizeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "size",
    },
    sku: {
        type: String,
        uppercase: true,
        trim: true,
        unique: true,
        required: true
    }
},
    {
        timestamps: true
    }
)


const ProductVariants = mongoose.model("product-variants", productVariantSchema)
module.exports = ProductVariants