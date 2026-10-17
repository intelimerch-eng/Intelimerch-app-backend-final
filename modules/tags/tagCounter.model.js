const mongoose = require("mongoose");

const taCounterSchema = new mongoose.Schema(
    {

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

const TagCounts = mongoose.model("tag-counts", taCounterSchema);
module.exports = TagCounts