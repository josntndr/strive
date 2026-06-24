const express = require("express");
const { getAnalytics, getUsers } = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/analytics", protect, adminOnly, getAnalytics);
router.get("/users", protect, adminOnly, getUsers);

module.exports = router;
