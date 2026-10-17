const Fans = require("../fan/fan.model")


const createFan = async (firstName, lastName, email, phone, consentGiven, session) => {

    const fan = new Fans({
        firstName,
        lastName,
        email,
        phone,
        consentGiven
    }, session)
    return fan.save({ session })
}

module.exports = { createFan }