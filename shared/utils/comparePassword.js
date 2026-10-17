const bcrypt = require("bcrypt")

async function comparePassword(password, hash) {
    const isValid = await bcrypt.compare(password, hash)
    return isValid
}


module.exports = comparePassword