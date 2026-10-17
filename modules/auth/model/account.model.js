const mongoose = require("mongoose")
const ACCOUNT = require("../../../shared/constants/account")

const accountSchema = new mongoose.Schema(
    {
        email: { type: String, required: true, unique: true },
        phone: { type: String, required: true, unique: true },
        userName: { type: String, unique: true },
        password: { type: String, required: true, select: false },
        accountType: { type: String, required: true, enum: [ACCOUNT.TYPE.ARTIST, ACCOUNT.TYPE.INTERNAL_TEAM, ACCOUNT.TYPE.FAN] },
        accountStatus: { type: String, default: ACCOUNT.STATUS.ACTIVE },
    },
    {
        timestamps: true
    }
)



const Accounts = mongoose.model("accounts", accountSchema)
module.exports = Accounts