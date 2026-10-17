const mongoose = require("mongoose");

const productSizeSchema = new mongoose.Schema(
    {
        size: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        code: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true,
        },
    },
    {
        timestamps: true,
    }
);

const ProductSizes = mongoose.model("size", productSizeSchema);
module.exports = ProductSizes