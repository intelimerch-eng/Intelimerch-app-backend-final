const mongoose = require("mongoose");

const passwordResetRequestSchema = new mongoose.Schema(
{
    accountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "accounts",
        required: true
    },

    otp: {
        type: String,
        required: true
    },

    expiresAt: {
        type: Date,
        required: true
    },

    verified: {
        type: Boolean,
        default: false
    },

    used: {
        type: Boolean,
        default: false
    },

    attemptCount: {
        type: Number,
        default: 0
    }
},
{
    timestamps: true
});

passwordResetRequestSchema.index(
    { expiresAt: 1 },
    { expireAfterSeconds: 0 }
);

const PasswordResetRequests = mongoose.model(
    "password-reset-requests",
    passwordResetRequestSchema
);

module.exports = PasswordResetRequests;