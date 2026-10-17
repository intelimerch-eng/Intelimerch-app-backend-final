const mongoose = require('mongoose');

const TierSchema = new mongoose.Schema({
    name: {
        type: String, //e.g "1" 
        required: true,
        trim: true,
        unique: true
    },
    alias:{
        type: String,
        trim: true,
        lowercase: true
    },
    description: {
        type: String,
        default: '',
        trim: true,
    },
}, {
    timestamps: true,
});

const Tiers = mongoose.model('tiers', TierSchema);
module.exports = Tiers;