const mongoose = require("mongoose");

const fanSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            trim: true,
        },

        lastName: {
            type: String,
            trim: true,
            default: null,
        },

        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            unique: true,
        },

        phone: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },

        consentGiven: {
            type: Boolean,
            required: true,
            default: false,
        },
        
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
        }
    },
    {
        timestamps: true,
    }
);

const Fans = mongoose.model("fans", fanSchema);

module.exports = Fans;