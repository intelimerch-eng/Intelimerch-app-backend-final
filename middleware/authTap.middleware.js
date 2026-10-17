const jwt = require("jsonwebtoken");

const authTap = (req, res, next) => {
    const tapToken = req.body?.tapToken ?? req.query?.tapToken;

    if (!tapToken) {
        const error = new Error("Access denied! No tap token provided");
        error.statusCode = 401;
        throw error;
    }

    try {
        const decoded = jwt.verify(tapToken, process.env.JWT_SECRET);
        req.tag = decoded;
        console.log("Decoded tap token:", decoded);
        return next();
    }
    catch (error) {
        throw error
    }
};

module.exports = authTap;