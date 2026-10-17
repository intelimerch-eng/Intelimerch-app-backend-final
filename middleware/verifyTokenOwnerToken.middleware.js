const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    const ownerToken = req.body?.ownerToken ?? req.query?.ownerToken;

    if (!ownerToken) {
        return next();
    }

    try {
        const decoded = jwt.verify(ownerToken, process.env.JWT_SECRET);
        req.owner = decoded;
        return next();
    }
    catch (error) {
        error.statusCode = 401;
        error.message = "Invalid owner token";
        return next(error);
    }
};

module.exports = verifyToken;