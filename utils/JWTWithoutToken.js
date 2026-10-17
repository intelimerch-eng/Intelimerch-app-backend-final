const jwt = require("jsonwebtoken")

function JWTWithoutToken(payload, tokenType) {  //where type is either "accessToken" or "refreshToken"
    return jwt.sign(
        payload,
        process.env.JWT_SECRET
    );
}


module.exports = JWTWithoutToken