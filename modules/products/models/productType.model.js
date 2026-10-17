const mongoose = require("mongoose")


const productTypeSchema = new mongoose.Schema(
    {
        type: {      //T-Shirt, Hoodie
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        code: {      //TSH, HDY
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        }
    },
    {
        timestamps: true,
    }
);



const ProductTypes = mongoose.model("product-types", productTypeSchema);

module.exports = ProductTypes;