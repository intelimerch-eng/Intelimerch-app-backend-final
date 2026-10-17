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


module.exports = getAccount