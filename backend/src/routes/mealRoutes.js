const express = require("express");
const {
  generateMealPlan,
  getMealPlans,
  updateMealPlan,
  deleteMealPlan,
} = require("../controllers/mealController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/generate", protect, generateMealPlan);
router.get("/", protect, getMealPlans);
router.route("/:id").put(protect, updateMealPlan).delete(protect, deleteMealPlan);

module.exports = router;
