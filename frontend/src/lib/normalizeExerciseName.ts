// Standardize inconsistent exercise names before looking up demo videos or
// rendering labels. Returns the canonical display name (e.g. "Wall Push-ups").
export function normalizeExerciseName(name: string): string {
  const normalized = String(name || "").trim().toLowerCase();

  const aliases: Record<string, string> = {
    // Wall push-ups
    "wall push up": "Wall Push-ups",
    "wall push ups": "Wall Push-ups",
    "wall push-up": "Wall Push-ups",
    "wall push-ups": "Wall Push-ups",
    "close-grip wall push-ups": "Wall Push-ups",

    // Push-ups
    "push up": "Push-ups",
    "push ups": "Push-ups",
    "push-up": "Push-ups",
    "push-ups": "Push-ups",
    "pushups": "Push-ups",
    "knee push-ups": "Push-ups",
    "incline push-ups": "Push-ups",

    // Pike push-ups
    "pike push up": "Pike Push-ups",
    "pike push ups": "Pike Push-ups",
    "pike push-up": "Pike Push-ups",
    "pike push-ups": "Pike Push-ups",
    "pike push-up hold": "Pike Push-ups",

    // Rows
    "resistance band row": "Resistance Band Rows",
    "resistance band rows": "Resistance Band Rows",
    "dumbbell row": "Dumbbell Rows",
    "dumbbell rows": "Dumbbell Rows",

    // Squats
    "bodyweight squat": "Bodyweight Squats",
    "bodyweight squats": "Bodyweight Squats",
    "wall squats": "Bodyweight Squats",
    "jump squats": "Bodyweight Squats",
    "squat reach": "Bodyweight Squats",
    "dumbbell squat": "Dumbbell Squats",
    "dumbbell squats": "Dumbbell Squats",
    "goblet squat": "Dumbbell Squats",
    "dumbbell squat to press": "Dumbbell Squats",

    // Lower body
    "glute bridge": "Glute Bridges",
    "glute bridges": "Glute Bridges",
    "single-leg glute bridges": "Glute Bridges",
    "weighted glute bridge": "Glute Bridges",
    "reverse lunge": "Reverse Lunges",
    "reverse lunges": "Reverse Lunges",
    "static lunges": "Reverse Lunges",
    "step-up": "Step-ups",
    "step up": "Step-ups",
    "step-ups": "Step-ups",
    "step ups": "Step-ups",
    "side-lying leg raise": "Side-Lying Leg Raises",
    "side-lying leg raises": "Side-Lying Leg Raises",
    "standing calf raise": "Standing Calf Raises",
    "standing calf raises": "Standing Calf Raises",
    "donkey kick": "Cable Kickbacks",
    "bodyweight hip thrust": "Bodyweight Hip Thrust",

    // Core
    "bicycle crunch": "Bicycle Crunches",
    "bicycle crunches": "Bicycle Crunches",
    "machine crunch": "Bicycle Crunches",
    "dead bug": "Dead Bug",
    "deadbug": "Dead Bug",
    "marching plank": "Plank",
    "knee plank": "Plank",
    "shoulder taps": "Plank",
    "cable pallof press": "Cable Pallof Press",
    "pallof press": "Cable Pallof Press",
    "cable woodchop": "Cable Pallof Press",
    "slow mountain climbers": "Mountain Climbers",
    "mountain climber": "Mountain Climbers",

    // Cardio
    "step touch intervals": "Step Touch Intervals",
    "step touch": "Step Touch Intervals",
    "high knees": "Jumping Jacks",
    "high knee march": "Jumping Jacks",
    "bike intervals": "Jumping Jacks",
    "incline treadmill walk": "Treadmill Incline Walk",
    "brisk walk": "Brisk Walk",

    // Upper body
    "dumbbell shoulder press": "Dumbbell Shoulder Press",
    "standing dumbbell shoulder press": "Dumbbell Shoulder Press",
    "bench dips": "Cable Tricep Pushdown",
    "chair dips": "Cable Tricep Pushdown",
    "resistance band curls": "Dumbbell Bicep Curl",
    "resistance band curl": "Dumbbell Bicep Curl",
    "water bottle curls": "Dumbbell Bicep Curl",

    // Machine aliases
    "lat pulldown": "Lat Pulldown Machine",
    "leg press": "Leg Press Machine",
    "cable kickback": "Cable Kickbacks",
    "band glute kickbacks": "Cable Kickbacks",
    "band squats": "Bodyweight Squats",
    "band pull aparts": "Resistance Band Rows",
    "band lateral walks": "Side-Lying Leg Raises",
  };

  return aliases[normalized] || String(name || "").trim();
}
