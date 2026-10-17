const express = require("express")
const router = express.Router()
// import routes
const authRoutes = require("../modules/auth/routes/auth.routes")
const adminRoutes = require("../modules/admin/routes/admin.routes")
const internalTeamRoutes = require("../modules/internalTeam/routes/admin.routes")
const artistRoutes = require("../modules/artist/artist.routes")
const productRoutes = require("../modules/products/routes/product.routes")
const perkRoutes = require("../modules/perks/routes/perk.routes")
const campaignRoutes = require("../modules/campaign/routes/campaign.routes")
const tierRoutes = require("../modules/tier/tier.routes")
const tagRoutes = require("../modules/tags/tags.routes")
const tapRoutes = require("../modules/tap/tap.routes")
const campaignAnalyticsRoutes = require("../modules/analytics/campaigns/campaignAnalytics.routes")
const dashboardAnalyticsRoutes = require("../modules/analytics/dashboard/dashboardAnalytics.routes")

// setup routes
router.use("/auth", authRoutes)
router.use("/admin", adminRoutes)
router.use("/internal", internalTeamRoutes)
router.use("/artist", artistRoutes)
router.use("/products", productRoutes)
router.use("/perks", perkRoutes)
router.use("/campaigns", campaignRoutes)
router.use("/tiers", tierRoutes)
router.use("/tags", tagRoutes)
router.use("/taps", tapRoutes)
router.use("/campaigns/analytics", campaignAnalyticsRoutes)
router.use("/dashboard/analytics", dashboardAnalyticsRoutes)


module.exports = router