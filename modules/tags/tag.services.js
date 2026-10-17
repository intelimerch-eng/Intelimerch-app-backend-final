const Tags = require("./tag.model")
const TagCounts = require("./tagCounter.model")

// ADDED: maps frontend deviceType values to Tag model enum values
function mapDeviceType(deviceType) {
    if (deviceType === "android" || deviceType === "ios") return "mobile"
    if (deviceType === "web") return "desktop"
    return "unknown"
}

async function generateTag(campaignId, productVariantId, tierId, session) {
    let tagCount
    tagCount = await TagCounts.findOne().session(session)
    if (!tagCount) {
        [tagCount] = await TagCounts.create([{}], { session })
    }

    count = tagCount.nextNumber
    const tagId = "NFC" + "-" + String(count).padStart(3, "0")

    const tagData = {
        tagId,
        campaignId,
        productVariantId,
        tierId
    }

    const [tag] = await Tags.create([tagData], { session })
    if (!tag) {
        const error = new Error("Error occured creating tag")
        error.statusCode = 500
        throw error
    }

    await TagCounts.findOneAndUpdate({ _id: tagCount._id }, { $inc: { nextNumber: 1 } }, { session })

    return tag
}

async function activateTag(tagId, ownerId, location, deviceType, session) {

    const activationData = {
        ownerId,
        lastTappedAt: new Date(),
        status: "activated",
        activatingLocation: {
            country: location.country || null,
            state: location.state || null,
            city: location.suburb || location.city || null
        },
        activatedAt: new Date(),
        claimedAt: new Date(),
        // FIXED: map android/ios/web → mobile/desktop/unknown to match model enum
        activatingDevice: mapDeviceType(deviceType)
    }

    const activatedTag = await Tags.findOneAndUpdate(
        { _id: tagId },
        {
            $set: activationData,
            $inc: { tapCount: 1 }
        },
        { returnDocument: "after", runValidators: true, session }
    )

    return activatedTag
}

async function retrieveTag(tagId) {
    const tag = await Tags.findById(tagId)
    if (!tag) {
        const error = new Error("Tag not found")
        error.statusCode = 404
        throw error
    }
    return tag
}

async function disableTag(tagId) {
    const tag = await Tags.findByIdAndUpdate(tagId, { status: "disabled" }, { new: true, runValidators: true })
    if (!tag) {
        const error = new Error("Tag not found")
        error.statusCode = 404
        throw error
    }
    return tag
}

module.exports = { generateTag, activateTag, retrieveTag, disableTag }