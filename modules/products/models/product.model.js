const mongoose = require("mongoose")

const productSchema = new mongoose.Schema(
    {
        artistId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "artists",
            required: true,
        },

        productName: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            trim: true,
        },

        productTypeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "product-types",
            required: true,
        },

        productCode: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
            unique: true,
        }
    },
    {
        timestamps: true,
    }
);

productSchema.index(
    { productName: 1, productTypeId: 1 },
    { unique: true }
)

const Products = mongoose.model("products", productSchema);
module.exports = Products;