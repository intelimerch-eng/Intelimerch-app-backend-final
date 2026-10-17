
function throwError(message, statusCode) {
    const error = new Error(message)
    error.statusCode = statusCode
    throw error
}


module.exports = throwError