const express = require("express");
const { getProfile, upsertProfile } = require("../controllers/profileController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").get(protect, getProfile).post(protect, upsertProfile).put(protect, upsertProfile);

module.exports = router;
