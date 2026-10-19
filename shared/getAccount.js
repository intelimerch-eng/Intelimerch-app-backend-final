const Artists = require("../modules/artist/artist.model")
const InternalTeam = require("../modules/internalTeam/model/internalTeam.model")
const Fans = require("../modules/fan/fan.model")
const ACCOUNT = require("../shared/constants/account")

async function getAccount(accountId, accountType) {

    let account
    if (accountType === ACCOUNT.TYPE.ARTIST) {
        account = await Artists.findOne({ accountId: accountId })
    }

    else if (accountType === ACCOUNT.TYPE.INTERNAL_TEAM) {
        account = await InternalTeam.findOne({ accountId: accountId })
    }


    else if (accountType === ACCOUNT.TYPE.FAN) {
        account = await Fans.findOnew({ accountId: accountId })
    }

    return account

}

async function updateAccount(accountId, accountType, updateData) {
    let Model;

    if (accountType === ACCOUNT.TYPE.ARTIST) {
        Model = Artists;
    } else if (accountType === ACCOUNT.TYPE.INTERNAL_TEAM) {
        Model = InternalTeam;
    } else if (accountType === ACCOUNT.TYPE.FAN) {
        Model = Fans;
    } else {
        throw new Error("Invalid account type");
    }

    const account = await Model.findOneAndUpdate(
        { accountId },
        { $set: updateData },
        {
            new: true,
            runValidators: true,
        }
    );

    if (!account) {
        throw new Error("Account not found");
    }

    return account;
}


module.exports = { getAccount, updateAccount }