
const autheRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).send({ msg: "permission denied" })
        }
        next()
    }
}


module.exports = { autheRoles }