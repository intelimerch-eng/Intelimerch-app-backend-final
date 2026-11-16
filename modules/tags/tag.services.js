const Tags = require("./tag.model")
const TagCounts = require("./tagCounter.model")

// ADDED: maps frontend deviceType values to Tag model enum values
function mapDeviceType(deviceType) {
    if (deviceType === "android" || deviceType === "ios") return "mobile"
    if (deviceType === "web") return "desktop"
    return "unknown"
}

// Generates `quantity` sequential NFC tags in one go. One tag is produced per
// unit of a product, so a batch of 50 hoodies yields NFC-001..NFC-050.
async function generateTags(campaignId, productVariantId, tierId, quantity = 1, session) {
    const total = Number.isInteger(quantity) && quantity > 0 ? quantity : 1

    let tagCount = await TagCounts.findOne().session(session)
    if (!tagCount) {
        [tagCount] = await TagCounts.create([{}], { session })
    }

    const firstNumber = tagCount.nextNumber

    const tagData = []
    for (let index = 0; index < total; index++) {
        tagData.push({
            tagId: "NFC" + "-" + String(firstNumber + index).padStart(3, "0"),
            campaignId,
            productVariantId,
            tierId
        })
    }

    const tags = await Tags.create(tagData, { session })
    if (!tags || tags.length !== total) {
        const error = new Error("Error occured creating tag")
        error.statusCode = 500
        throw error
    }

    // Reserve the numbers we just used in a single atomic step.
    await TagCounts.findOneAndUpdate(
        { _id: tagCount._id },
        { $inc: { nextNumber: total } },
        { session }
    )

    return tags
}

// Backwards-compatible single-tag helper.
async function generateTag(campaignId, productVariantId, tierId, session) {
    const [tag] = await generateTags(campaignId, productVariantId, tierId, 1, session)
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

module.exports = { generateTag, generateTags, activateTag, retrieveTag, disableTag }