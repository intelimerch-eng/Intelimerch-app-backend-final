
const Taps = require("./tap.model");

async function tapTag({
  tagId,
  ownerId,
  success,
  deviceType,
  tapType,
  location,
  artistId,
  campaignId,
  session,
}) {
  const tap = new Taps({
    tagId,
    userId: ownerId || null,
    success: success || null,
    tapType,
    deviceType,
    artistId,
    campaignId,
    location: {
      country: location?.country || null,
      state: location?.state || null,
      city: location?.city || location?.suburb || null,
    },
  });

  await tap.save({ session });
}

module.exports = { tapTag };