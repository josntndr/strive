const express = require("express");
const { createProgressRecord, getProgressRecords } = require("../controllers/progressController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").get(protect, getProgressRecords).post(protect, createProgressRecord);

module.exports = router;
