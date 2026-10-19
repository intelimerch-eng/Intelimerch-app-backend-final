const mongoose = require("mongoose");

const passwordResetSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        tokenHash: {
            type: String,
            required: true,
        },
        expiresAt: {
            type: Date,
            required: true,
            expires: 0,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model(
    "PasswordReset",
    passwordResetSchema
);