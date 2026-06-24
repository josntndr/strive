const express = require("express");
const {
  generateWorkoutPlan,
  getWorkoutPlans,
  updateWorkoutPlan,
  deleteWorkoutPlan,
} = require("../controllers/workoutController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/generate", protect, generateWorkoutPlan);
router.get("/", protect, getWorkoutPlans);
router.route("/:id").put(protect, updateWorkoutPlan).delete(protect, deleteWorkoutPlan);

module.exports = router;
