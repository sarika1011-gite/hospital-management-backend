const express = require("express");
const router = express.Router();

const { getDashboardOverview } = require("../controllers/adminController");

router.get("/dashboard", getDashboardOverview);

module.exports = router;
