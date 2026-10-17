const mongoose = require("mongoose")
const ACCOUNT = require("../../shared/constants/account")

const artistSchema = new mongoose.Schema({
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: "accounts", required: true },
    firstName: { type: String, required: true },
    middleName: { type: String },
    lastName: { type: String, required: true },
    isEmailConfirmed: { type: Boolean, default: false },
    emailConfirmedAt: { type: Date, default: null },
},
    {
        timestamps: true
    }
)



const Artists = mongoose.model("artists", artistSchema)
module.exports = Artists