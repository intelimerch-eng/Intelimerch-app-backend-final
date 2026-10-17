const mongoose = require("mongoose");

const colorCodeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            unique: true,
        },
        code: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
            unique: true,
        },
    },
    {
        timestamps: true,
    }
);

const ProductColors = mongoose.model("colors", colorCodeSchema);
module.exports = ProductColors