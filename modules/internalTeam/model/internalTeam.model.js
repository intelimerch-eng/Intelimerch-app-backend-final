const mongoose = require("mongoose")
const ACCOUNT = require("../../../shared/constants/account")

const internalTeamSchema = new mongoose.Schema({
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: "accounts", required: true },
    firstName: { type: String, required: true },
    middleName: { type: String },
    lastName: { type: String, required: true },
    isEmailConfirmed: { type: Boolean, default: false },
    emailConfirmedAt: { type: Date, default: null },
    roleId: { type: mongoose.Schema.Types.ObjectId, ref: "roles", required: true }
},
    {
        timestamps: true
    }
)



const InternalTeam = mongoose.model("internalteam", internalTeamSchema)
module.exports = InternalTeam