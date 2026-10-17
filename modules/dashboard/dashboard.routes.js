
const express = require("express")
const router = express.Router()
const  {getDashboard} = require("./dashboard.controller")
const auth = require("../../middleware/auth.middleware")



router.get("/", auth, getDashboard)


module.exports = router