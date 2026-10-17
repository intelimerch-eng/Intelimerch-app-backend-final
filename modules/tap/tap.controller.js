// src/modules/tap/tap.controller.js
const mongoose = require("mongoose");
const Tags = require("../tags/tag.model");
const Fans = require("../fan/fan.model");
const Campaigns = require("../campaign/model/campaign.model.js");
const CampaignPerks = require("../campaign/model/campaignPerks.model.js");
const CampaignPages = require("../campaign/model/campaignPage.model");
const { createFan } = require("../fan/fan.service");
const { activateTag } = require("../tags/tag.services");
const asyncHandler = require("express-async-handler");
const validateObjectId = require("../../utils/objectIdValidators");
const { tapTag } = require("../tap/tap.service");
const { generateJWT, generateOwnerToken } = require("../../shared/utils/JWT");
const { getLocation } = require("../../shared/services/getLocation.services.js");

const tap = asyncHandler(async (req, res) => {
  const { tagId } = req.params;
  const { owner } = req;

  const tag = await validateObjectId(tagId, Tags, "tag");

  // get location
  const { location } = req.body;
  const { country: locCountry, state: locState, city: locCity } = location || {};

  let locationData = {
    suburb: locCity || null,
    state: locState || null,
    country: locCountry || null,
  };

  const { suburb, state, country } = locationData;

  const NFCTag = await Tags.findById(tagId);

  // Check if tag exists
  if (!NFCTag) {
    const error = new Error("Tag not found");
    error.statusCode = 404;
    throw error;
  }

  // ── FIXED: read owner.ownerId, not owner.id (JWT payload uses "ownerId")
  const isNFCActivated = NFCTag.status === "activated";
  const tagOwnerId = NFCTag.ownerId ? NFCTag.ownerId.toString() : null;
  const requesterId = owner?.ownerId ? owner.ownerId.toString() : null;
  const isOwnerValid = Boolean(
    isNFCActivated && tagOwnerId && requesterId && tagOwnerId === requesterId
  );

  const tapType =
    isNFCActivated && isOwnerValid
      ? "subsequent"
      : !isNFCActivated && !isOwnerValid
        ? "fresh"
        : "illegal";

  const artistId = NFCTag.artistId || tag.artistId || NFCTag.campaignId;
  const campaignId = NFCTag.campaignId || tag.campaignId;

  if (isNFCActivated && isOwnerValid) {
    const tapToken = await generateJWT({ tagId }, "tapToken");

    await tapTag({
      tagId,
      ownerId: owner?.ownerId,
      success: true,
      deviceType: req.body.deviceType,
      tapType,
      location: { country, state, city: suburb },
      artistId,
      campaignId,
    });

    await Tags.findByIdAndUpdate(tagId, {
      $inc: { tapCount: 1 },
      lastTappedAt: new Date(),
    });

    await Campaigns.findByIdAndUpdate(campaignId, {
      $inc: { tapCount: 1, scanCount: 1 },
    });

    return res.status(200).json({
      success: true,
      message: "Tap successful, welcome back!",
      tapToken,
    });
  }

  if (!isNFCActivated && !isOwnerValid) {
    await tapTag({
      tagId,
      ownerId: owner?.ownerId,
      success: true,
      deviceType: req.body.deviceType,
      tapType,
      location: { country, state, city: suburb },
      artistId,
      campaignId,
    });

    await Tags.findByIdAndUpdate(tagId, {
      $inc: { tapCount: 1 },
      lastTappedAt: new Date(),
    });

    await Campaigns.findByIdAndUpdate(campaignId, {
      $inc: { tapCount: 1, scanCount: 1 },
    });

    const tapToken = await generateJWT({ tagId }, "tapToken");

    return res.status(200).json({
      success: true,
      message: "Fresh tap detected. Proceed to activate",
      tapToken,
    });
  }

  if (isNFCActivated && !isOwnerValid) {
    await tapTag({
      tagId,
      ownerId: owner?.ownerId,
      success: true,
      deviceType: req.body.deviceType,
      tapType,
      location: { country, state, city: suburb },
      artistId,
      campaignId,
    });

    await Tags.findByIdAndUpdate(tagId, {
      $inc: { tapCount: 1 },
      lastTappedAt: new Date(),
    });

    await Campaigns.findByIdAndUpdate(campaignId, {
      $inc: { tapCount: 1, scanCount: 1 },
    });

    // Look up the owner's first name and the campaign's saved socials
    // so the fan page can name the owner and show "Follow the artist" links.
    const [tagOwner, campaignPage] = await Promise.all([
      NFCTag.ownerId
        ? Fans.findById(NFCTag.ownerId).select("firstName")
        : null,
      campaignId
        ? CampaignPages.findOne({ campaignId }).select("pageStructure.socials")
        : null,
    ]);

    const error = new Error("Access denied! Merch claimed by another fan");
    error.statusCode = 403;
    error.ownerFirstName = tagOwner?.firstName || null;
    error.socials = campaignPage?.pageStructure?.socials || null;
    throw error;
  }

  // ── SAFETY NET
  const error = new Error("Unexpected tag state. Please try again or contact support.");
  error.statusCode = 400;
  throw error;
});

const activateMerch = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  const tagId = req.tag.tagId;
  const tag = await Tags.findById(tagId).session(session);

  // Check if tag exists
  if (!tag) {
    const error = new Error("Tag not found");
    error.statusCode = 404;
    throw error;
  }

  const hasTagBeenActivated = tag.status === "activated";

  // ── FIXED: read owner.ownerId, not owner.id
  const { owner } = req;
  if (owner) {
    await validateObjectId(owner.ownerId, Fans, "owner");
  }

  try {
    if (!hasTagBeenActivated) {
      const { firstName, lastName, email, phone, deviceType, location, consentGiven } = req.body;

      const { country: locCountry, state: locState, city: locCity } = location || {};
      let locationData = {
        suburb: locCity || null,
        state: locState || null,
        country: locCountry || null,
      };
      const { suburb, state, country } = locationData;

      let fan;
      if (!owner) {
        fan = await createFan(firstName, lastName, email, phone, consentGiven, session);
      } else {
        // ── FIXED: read owner.ownerId
        fan = await Fans.findById(owner.ownerId);
      }

      const activatedTag = await activateTag(
        tagId,
        fan._id,
        { country, state, city: suburb },
        deviceType,
        session
      );

      const artistId = tag.artistId || activatedTag.artistId || tag.campaignId;
      const campaignId = tag.campaignId || activatedTag.campaignId;

      await tapTag({
        tagId,
        ownerId: fan._id,
        success: true,
        deviceType,
        tapType: "fresh",
        location: { country, state, city: suburb },
        artistId,
        campaignId,
        session,
      });

      await Campaigns.findByIdAndUpdate(
        campaignId,
        {
          $inc: { tagCount: 1, claims: 1 },
        },
        { returnDocument: "after", runValidators: true }
      );

      const tapToken = await generateJWT({ tagId }, "tapToken");
      const ownerToken = await generateOwnerToken(
        { ownerId: activatedTag.ownerId },
        "ownerToken"
      );

      await session.commitTransaction();

      return res.status(201).json({
        success: true,
        message: "Tag activation successful",
        data: {
          activatedTag,
          tapToken,
          ownerToken,
        },
      });
    }

    const error = new Error("Action denied on activated tag.");
    error.statusCode = 400;
    throw error;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
    await Tags.findByIdAndUpdate(tagId, {
      $inc: { tapCount: 1 },
      lastTappedAt: new Date(),
    });
  }
});

const getCampaignPageResources = asyncHandler(async (req, res) => {
  const tagId = req.tag.tagId;
  const { owner } = req;

  if (!owner?.ownerId) {
    const error = new Error("Owner token is required");
    error.statusCode = 401;
    throw error;
  }

  await validateObjectId(owner.ownerId, Fans, "owner");

  const tag = await Tags.findOne({ _id: tagId, ownerId: owner.ownerId });
  if (!tag) {
    const error = new Error("Tag not found or does not belong to you");
    error.statusCode = 401;
    throw error;
  }

  const campaignId = tag.campaignId;

  const [campaignPageResources, campaign, campaignPage] = await Promise.all([
    CampaignPerks.find({ campaignId }).populate("perkId"),
    Campaigns.findById(campaignId).select("campaignName"),
    CampaignPages.findOne({ campaignId }),
  ]);

  return res.status(200).json({
    success: true,
    message: "Campaign resources retrieved",
    data: {
      campaign: {
        campaignId,
        campaignName: campaign?.campaignName || null,
        pageStructure: campaignPage?.pageStructure || {
          version: 1,
          theme: {},
          blocks: [],
        },
      },
      resources: campaignPageResources,
    },
  });
});

const getCampaignPageResource = asyncHandler(async (req, res) => {
  const { resourceId } = req.params;
  const { owner } = req;

  if (!owner?.ownerId) {
    const error = new Error("Owner token is required");
    error.statusCode = 401;
    throw error;
  }

  await validateObjectId(resourceId, CampaignPerks, "resource");

  const campaignPageResource = await CampaignPerks.findById(resourceId).populate("perkId");

  if (!campaignPageResource) {
    const error = new Error("Campaign resource not found");
    error.statusCode = 404;
    throw error;
  }

  const [campaign, campaignPage] = await Promise.all([
    Campaigns.findById(campaignPageResource.campaignId).select("campaignName"),
    CampaignPages.findOne({ campaignId: campaignPageResource.campaignId }),
  ]);

  return res.status(200).json({
    success: true,
    message: "Campaign resource retrieved",
    data: {
      campaign: {
        campaignId: campaignPageResource.campaignId,
        campaignName: campaign?.campaignName || null,
        pageStructure: campaignPage?.pageStructure || {
          version: 1,
          theme: {},
          blocks: [],
        },
      },
      resource: campaignPageResource,
    },
  });
});

module.exports = {
  tap,
  activateMerch,
  getCampaignPageResources,
  getCampaignPageResource,
};