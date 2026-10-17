const mongoose = require("mongoose");

const productCodeCounterSchema = new mongoose.Schema(
    {
        productType: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "product-types",
            required: true,
            unique: true,
        },
        nextNumber: {
            type: Number,
            required: true,
            default: 1,
            min: 1,
        },
    },
    {
        timestamps: true,
    }
);

const ProductCodeCounts = mongoose.model("product-code-counts", productCodeCounterSchema);
module.exports = ProductCodeCounts