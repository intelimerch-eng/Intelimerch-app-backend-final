const mongoose = require("mongoose");


async function validateObjectId(id, model, DName) {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        const error = new Error("Invalid ObjectId");
        error.statusCode = 400;
        throw error;
    }

    const document = await model.findById(id)
    if (!document) {
        const error = new Error(DName + " not found");
        error.statusCode = 400;
        throw error;
    }
    return document
}


module.exports = validateObjectId