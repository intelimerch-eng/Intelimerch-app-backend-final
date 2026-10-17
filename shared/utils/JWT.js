const jwt = require("jsonwebtoken")

const types = {
    accessToken: "ACCESS_TOKEN_EXPIRES_IN",
    refreshToken: "REFRESH_TOKEN_EXPIRES_IN",
    tapToken: "TAP_TOKEN_EXPIRES_IN",
    ownerToken: "OWNER_TOKEN_EXPIRES_IN",
}

function generateJWT(payload, tokenType) {  //where type is either "accessToken" or "refreshToken"
    return jwt.sign(
        payload,
        process.env.JWT_SECRET,
        {
            expiresIn: process.env[types[tokenType]]
        }
    );
}

function generateOwnerToken(payload) {  //where type is either "accessToken" or "refreshToken"
    return jwt.sign(
        payload,
        process.env.JWT_SECRET
    );
}

module.exports = {generateJWT, generateOwnerToken}