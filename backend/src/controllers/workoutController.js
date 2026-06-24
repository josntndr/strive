const fs = require("fs/promises");
const { randomUUID } = require("crypto");
const connectDB = require("../config/db");
const { getProfileByUserId } = require("../services/profileStore");
const WorkoutPlan = require("../models/WorkoutPlan");

const exerciseVideoMap = {
  "Bodyweight Squats": "https://www.youtube.com/embed/P-yaD24bUE8",
  "Glute Bridges": "https://www.youtube.com/embed/OUgsJ8-Vi0E",
  "Reverse Lunges": "https://www.youtube.com/embed/xrPteyQLGAo",
  "Wall Push-ups": "https://www.youtube.com/embed/QpMTk21EmaM",
  "Dumbbell Romanian Deadlift": "https://www.youtube.com/embed/jEy_czb3RKA",
  "Resistance Band Rows": "https://www.youtube.com/embed/xQNrFHEMhI4",
  Plank: "https://www.youtube.com/embed/pSHjTRCQxIw",
  "Mountain Climbers": "https://www.youtube.com/embed/nmwgirgXLYM",
  "Standing Calf Raises": "https://www.youtube.com/embed/-M4-G8p8fmc",
  "Step-ups": "https://www.youtube.com/embed/dQqApCGd5Ss",
  "Side-Lying Leg Raises": "https://www.youtube.com/embed/jgh6sGwtTwk",
  "Bodyweight Hip Thrust": "https://www.youtube.com/embed/pF17m_CXfL0",
  "Bicycle Crunches": "https://www.youtube.com/embed/9FGilxCbdz8",
  "Jumping Jacks": "https://www.youtube.com/embed/c4DAnQ6DtF8",
  "Leg Press Machine": "https://www.youtube.com/embed/Aq5uxXrXq7c",
  "Hip Thrust Machine": "https://www.youtube.com/embed/UVucPKyQVLU",
  "Cable Kickbacks": "https://www.youtube.com/embed/5jJNfIlKTmg",
  "Lat Pulldown Machine": "https://www.youtube.com/embed/AOpi-p0cJkc",
  "Seated Row Machine": "https://www.youtube.com/embed/TeFo51Q_Nsc",
  "Chest Press Machine": "https://www.youtube.com/embed/sqNwDkUU_Ps",
  "Shoulder Press Machine": "https://www.youtube.com/embed/3R14MnZbcpw",
  "Leg Extension Machine": "https://www.youtube.com/embed/YyvSfVjQeL0",
  "Hamstring Curl Machine": "https://www.youtube.com/embed/t9sTSr-JYSs",
  "Abductor Machine": "https://www.youtube.com/embed/OjI5OpV6IWA",
  "Treadmill Incline Walk": "https://www.youtube.com/embed/NAsObfFJXvE",
  "Brisk Walk": "https://www.youtube.com/embed/wQrV75N2BrI",
  "Cable Tricep Pushdown": "https://www.youtube.com/embed/2-LAMcpzODU",
  "Dumbbell Bicep Curl": "https://www.youtube.com/embed/ykJmrZ5v0Oo",
};

const exerciseVideoAliases = {
  "Bodyweight Squat": "Bodyweight Squats",
  "Glute Bridge": "Glute Bridges",
  "Reverse Lunge": "Reverse Lunges",
  "Wall Push-Up": "Wall Push-ups",
  "Dumbbell Romanian Deadlift": "Dumbbell Romanian Deadlift",
  "Resistance Band Row": "Resistance Band Rows",
  "Standing Calf Raise": "Standing Calf Raises",
  "Step-Up": "Step-ups",
  "Side-Lying Leg Raise": "Side-Lying Leg Raises",
  "Bodyweight Hip Thrust": "Bodyweight Hip Thrust",
  "Bicycle Crunch": "Bicycle Crunches",
  "Cable Kickback": "Cable Kickbacks",
  "Lat Pulldown": "Lat Pulldown Machine",
  "Leg Press": "Leg Press Machine",
  "Hip Thrust Machine": "Hip Thrust Machine",
  "Chest Press Machine": "Chest Press Machine",
  "Shoulder Press Machine": "Shoulder Press Machine",
  "Leg Extension Machine": "Leg Extension Machine",
  "Hamstring Curl Machine": "Hamstring Curl Machine",
  "Abductor Machine": "Abductor Machine",
  "Treadmill Incline Walk": "Treadmill Incline Walk",
  "Cable Tricep Pushdown": "Cable Tricep Pushdown",
  "Dumbbell Bicep Curl": "Dumbbell Bicep Curl",
  "Pike Push-Up Hold": "Wall Push-ups",
  "Cable Pallof Press": "Plank",
  "Cable Woodchop": "Bicycle Crunches",
  "Machine Crunch": "Bicycle Crunches",
  "Step Touch Intervals": "Jumping Jacks",
  "High Knee March": "Jumping Jacks",
  "Squat Reach": "Bodyweight Squats",
  "Bench Dips": "Cable Tricep Pushdown",
  "Donkey Kick": "Cable Kickbacks",
  "Dead Bug": "Plank",
};

// Ordered keyword rules: the FIRST match wins, so the most specific movements
// must come before the generic ones (e.g. "leg press" before "press", "glute
// bridge" before "hip"). This keeps "Walking Lunges" mapped to a lunge video
// instead of a generic squat. Keep in sync with frontend src/lib/workoutDemoMap.ts.
const exerciseKeywordRules = [
  [/leg\s*press/, "Leg Press Machine"],
  [/leg\s*extension/, "Leg Extension Machine"],
  [/(hamstring|leg\s*curl|lying\s*curl)/, "Hamstring Curl Machine"],
  [/abductor|abduction/, "Abductor Machine"],
  [/kickback/, "Cable Kickbacks"],
  [/(lat\s*pulldown|pulldown|\blat\b)/, "Lat Pulldown Machine"],
  [/lunge/, "Reverse Lunges"],
  [/step[\s-]?up/, "Step-ups"],
  [/calf/, "Standing Calf Raises"],
  [/(glute\s*bridge|\bbridge\b)/, "Glute Bridges"],
  [/(hip\s*thrust|\bhip\b)/, "Bodyweight Hip Thrust"],
  [/(romanian|\brdl\b|deadlift|hinge)/, "Dumbbell Romanian Deadlift"],
  [/squat/, "Bodyweight Squats"],
  [/side[\s-]?lying|leg\s*raise/, "Side-Lying Leg Raises"],
  [/(seated\s*row|cable\s*row|\brow\b)/, "Seated Row Machine"],
  [/(band\s*row|resistance\s*band\s*row)/, "Resistance Band Rows"],
  [/(chest\s*press|bench\s*press)/, "Chest Press Machine"],
  [/(shoulder\s*press|overhead\s*press|military\s*press)/, "Shoulder Press Machine"],
  [/(wall\s*push|push[\s-]?up|pushup|press[\s-]?up)/, "Wall Push-ups"],
  [/(tricep|pushdown|\bdip\b)/, "Cable Tricep Pushdown"],
  [/(bicep|curl)/, "Dumbbell Bicep Curl"],
  [/mountain\s*climber/, "Mountain Climbers"],
  [/(bicycle|crunch)/, "Bicycle Crunches"],
  [/plank/, "Plank"],
  [/(jumping\s*jack|\bjack\b|jump)/, "Jumping Jacks"],
  [/(treadmill|incline\s*walk|brisk\s*walk|\bwalk\b)/, "Treadmill Incline Walk"],
  [/(bike|cycle|cardio|interval|march|step\s*touch)/, "Jumping Jacks"],
];

const getExerciseVideoUrl = (name) => {
  const key = exerciseVideoAliases[name] || name;
  if (exerciseVideoMap[key]) return exerciseVideoMap[key];

  const lower = String(name || "").toLowerCase();
  for (const [pattern, canonical] of exerciseKeywordRules) {
    if (pattern.test(lower) && exerciseVideoMap[canonical]) {
      return exerciseVideoMap[canonical];
    }
  }

  return "";
};

const makeYouTubeEmbedUrl = (exerciseName) => {
  return getExerciseVideoUrl(exerciseName);
};

const makeVariant = ({ name, sets, reps, rest, equipment, summary, steps, safetyTips, commonMistakes, visualDemo, animationUrl, youtubeEmbedUrl }) => ({
  name,
  sets,
  reps,
  rest,
  equipment,
  summary,
  steps,
  safetyTips,
  commonMistakes,
  visualDemo,
  animationUrl: animationUrl || "",
  youtubeEmbedUrl: youtubeEmbedUrl || getExerciseVideoUrl(name),
});

const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const workoutBlueprints = {
  lower: [
    {
      targetMuscle: "Quadriceps, glutes, hamstrings",
      gym: makeVariant({
        name: "Leg Press",
        sets: 4,
        reps: "10-12",
        rest: "90 seconds",
        equipment: "Leg press machine",
        summary: "Push through your heels and keep your lower back supported.",
        steps: [
          "Sit with your feet shoulder-width apart on the platform.",
          "Lower the platform with control until your knees bend comfortably.",
          "Drive through your heels to press the platform back up.",
          "Stop short of locking your knees at the top.",
        ],
        safetyTips: ["Keep your back flat against the pad.", "Start with a lighter load until the range feels smooth."],
        commonMistakes: ["Letting knees collapse inward.", "Bouncing at the bottom.", "Unlocking the knees forcefully."],
        visualDemo: "Smooth seated pressing motion with controlled depth.",
      }),
      home: makeVariant({
        name: "Bodyweight Squat",
        sets: 3,
        reps: "12-15",
        rest: "60 seconds",
        equipment: "Bodyweight",
        summary: "Sit back, stay tall, and use a steady tempo.",
        steps: [
          "Stand with feet slightly wider than hips and toes turned out slightly.",
          "Send your hips back as if sitting into a chair.",
          "Lower until thighs are comfortable, then press through your feet to stand.",
          "Keep your chest lifted and knees tracking over toes.",
        ],
        safetyTips: ["Use a chair behind you if you need a depth target.", "Keep your heels grounded."],
        commonMistakes: ["Rounding the back.", "Letting the knees cave in.", "Rushing the descent."],
        visualDemo: "Bodyweight squat pattern with a steady beginner tempo.",
      }),
      alternativeName: "Bodyweight Squat",
      alternativeEquipment: "Bodyweight",
      alternativeSummary: "A home-friendly squat pattern that still builds leg strength.",
    },
    {
      targetMuscle: "Glutes and hamstrings",
      gym: makeVariant({
        name: "Hip Thrust Machine",
        sets: 4,
        reps: "10-12",
        rest: "90 seconds",
        equipment: "Hip thrust machine",
        summary: "Squeeze the glutes at the top and keep your ribs stacked.",
        steps: [
          "Set your upper back and feet so you can drive through the heels.",
          "Brace your core and press the hips up until your torso is parallel to the floor.",
          "Pause briefly at the top and squeeze the glutes.",
          "Lower slowly without relaxing completely at the bottom.",
        ],
        safetyTips: ["Keep your chin tucked slightly.", "Avoid overextending the lower back at lockout."],
        commonMistakes: ["Pushing from the toes.", "Flaring the ribs.", "Dropping too quickly."],
        visualDemo: "Hip drive movement with a stable torso and full glute squeeze.",
      }),
      home: makeVariant({
        name: "Glute Bridge",
        sets: 3,
        reps: "12-15",
        rest: "45 seconds",
        equipment: "Bodyweight",
        summary: "A floor-based glute builder that is easy to learn.",
        steps: [
          "Lie on your back with knees bent and feet flat on the floor.",
          "Brace your core and press through your heels to lift your hips.",
          "Squeeze the glutes at the top for one second.",
          "Lower back down with control and repeat.",
        ],
        safetyTips: ["Keep the movement smooth and controlled.", "Stop if you feel it mostly in the lower back."],
        commonMistakes: ["Hyperextending the spine.", "Spreading the feet too far away.", "Moving too fast."],
        visualDemo: "Floor bridge with controlled hip extension.",
      }),
      alternativeName: "Glute Bridge",
      alternativeEquipment: "Bodyweight",
      alternativeSummary: "A simple at-home hip extension exercise for glutes and hamstrings.",
    },
    {
      targetMuscle: "Glutes and single-leg stability",
      gym: makeVariant({
        name: "Cable Kickback",
        sets: 3,
        reps: "12 each leg",
        rest: "45 seconds",
        equipment: "Cable machine or ankle strap",
        summary: "Drive the heel back while keeping your torso steady.",
        steps: [
          "Attach the ankle strap and stand tall with a slight hinge at the hips.",
          "Kick one leg back in a controlled arc without swinging.",
          "Pause briefly at the top and squeeze the glute.",
          "Return slowly and repeat on the other side.",
        ],
        safetyTips: ["Keep the standing knee soft.", "Move through the hip, not the lower back."],
        commonMistakes: ["Arching the lower back.", "Swinging the leg.", "Using too much weight."],
        visualDemo: "Standing cable glute kickback with stable posture.",
      }),
      home: makeVariant({
        name: "Donkey Kick",
        sets: 3,
        reps: "12 each leg",
        rest: "45 seconds",
        equipment: "Bodyweight",
        summary: "A beginner-friendly glute isolation move on the mat.",
        steps: [
          "Start on hands and knees with your core gently braced.",
          "Lift one bent leg up and back while keeping the pelvis square.",
          "Squeeze the glute at the top and lower slowly.",
          "Alternate legs after finishing the set.",
        ],
        safetyTips: ["Keep your hips level.", "Avoid swinging the leg high if it shifts your spine."],
        commonMistakes: ["Twisting the hips.", "Pushing through momentum.", "Collapsing the core."],
        visualDemo: "Hands-and-knees glute kickback with a short controlled range.",
      }),
      alternativeName: "Donkey Kick",
      alternativeEquipment: "Bodyweight",
      alternativeSummary: "A floor-friendly alternative to cable kickbacks.",
    },
    {
      targetMuscle: "Quadriceps",
      gym: makeVariant({
        name: "Leg Extension Machine",
        sets: 3,
        reps: "12-15",
        rest: "60 seconds",
        equipment: "Leg extension machine",
        summary: "Extend the knees slowly and squeeze the quads at the top.",
        steps: [
          "Sit with your knees aligned to the machine pivot.",
          "Extend the legs until they are nearly straight.",
          "Pause briefly and squeeze the quads.",
          "Lower with control to the start position.",
        ],
        safetyTips: ["Keep the motion smooth.", "Choose a load that allows full control."],
        commonMistakes: ["Kicking the weight up.", "Locking the knees aggressively.", "Letting the hips lift."],
        visualDemo: "Controlled knee extension on the machine.",
      }),
      home: makeVariant({
        name: "Step-Up",
        sets: 3,
        reps: "10 each leg",
        rest: "60 seconds",
        equipment: "Sturdy step or bench",
        summary: "Drive through the lead foot and stand tall on the step.",
        steps: [
          "Place one foot on a stable step or bench.",
          "Push through the heel to stand up onto the step.",
          "Lower back down with control.",
          "Alternate legs after each set or rep.",
        ],
        safetyTips: ["Use a stable surface.", "Keep the knee tracking over the toes."],
        commonMistakes: ["Pushing off the back foot too much.", "Wobbling the knee inward.", "Rushing the descent."],
        visualDemo: "Step-up with a controlled lift and lowering phase.",
      }),
      alternativeName: "Step-Up",
      alternativeEquipment: "Sturdy step or bench",
      alternativeSummary: "A home alternative that builds the same single-leg quad pattern.",
    },
    {
      targetMuscle: "Hamstrings and glutes",
      gym: makeVariant({
        name: "Hamstring Curl Machine",
        sets: 3,
        reps: "12-15",
        rest: "60 seconds",
        equipment: "Hamstring curl machine",
        summary: "Curl the heels toward the glutes with a slow squeeze.",
        steps: [
          "Adjust the pad so it sits just above the ankles.",
          "Curl the heels toward the glutes in a smooth motion.",
          "Hold briefly at the top.",
          "Return slowly to the start.",
        ],
        safetyTips: ["Avoid lifting the hips.", "Keep the reps smooth and controlled."],
        commonMistakes: ["Jerking the weight.", "Letting the hips pop up.", "Moving too fast."],
        visualDemo: "Machine curl with a steady pull and return.",
      }),
      home: makeVariant({
        name: "Dumbbell Romanian Deadlift",
        sets: 3,
        reps: "10-12",
        rest: "75 seconds",
        equipment: "Dumbbells",
        summary: "Hinge at the hips and keep a soft bend in the knees.",
        steps: [
          "Hold the dumbbells in front of your thighs.",
          "Push the hips back while keeping the spine long.",
          "Lower until you feel tension in the hamstrings.",
          "Drive the hips forward to stand tall.",
        ],
        safetyTips: ["Keep the weights close to the legs.", "Do not round the lower back."],
        commonMistakes: ["Squatting instead of hinging.", "Overextending at the top.", "Dropping the weights too far away."],
        visualDemo: "Hip hinge with dumbbells and a controlled return.",
      }),
      alternativeName: "Dumbbell Romanian Deadlift",
      alternativeEquipment: "Dumbbells",
      alternativeSummary: "A home posterior-chain movement that mirrors the machine curl pattern.",
    },
    {
      targetMuscle: "Outer hips and glutes",
      gym: makeVariant({
        name: "Abductor Machine",
        sets: 3,
        reps: "12-15",
        rest: "45 seconds",
        equipment: "Abductor machine",
        summary: "Open the knees outward and squeeze the side glutes.",
        steps: [
          "Sit tall with the knees inside the pads.",
          "Press the knees outward without leaning back.",
          "Pause and feel the side glutes working.",
          "Return slowly to the center.",
        ],
        safetyTips: ["Keep the torso upright.", "Do not use momentum to force the pads out."],
        commonMistakes: ["Leaning back.", "Bouncing the reps.", "Moving through the lower back."],
        visualDemo: "Seated hip abduction with a smooth outward drive.",
      }),
      home: makeVariant({
        name: "Side-Lying Leg Raise",
        sets: 3,
        reps: "12 each side",
        rest: "45 seconds",
        equipment: "Bodyweight",
        summary: "Lift the top leg to train the outer hip at home.",
        steps: [
          "Lie on your side with legs stacked.",
          "Lift the top leg upward without rolling the hips back.",
          "Lower slowly and repeat.",
          "Switch sides after the set.",
        ],
        safetyTips: ["Keep the toes pointed forward or slightly down.", "Move in a controlled range."],
        commonMistakes: ["Rotating the pelvis.", "Using momentum.", "Lifting too high and losing tension."],
        visualDemo: "Side-lying leg lift with clean hip isolation.",
      }),
      alternativeName: "Side-Lying Leg Raise",
      alternativeEquipment: "Bodyweight",
      alternativeSummary: "A home version that works the same outer-hip pattern.",
    },
    {
      targetMuscle: "Calves",
      gym: makeVariant({
        name: "Standing Calf Raise",
        sets: 3,
        reps: "15-20",
        rest: "45 seconds",
        equipment: "Calf raise machine or dumbbells",
        summary: "Rise up onto the toes and lower with control.",
        steps: [
          "Stand tall with feet hip-width apart.",
          "Press through the balls of the feet to lift the heels.",
          "Pause at the top and squeeze the calves.",
          "Lower slowly to complete the rep.",
        ],
        safetyTips: ["Keep the ankles moving through a comfortable range.", "Avoid bouncing at the bottom."],
        commonMistakes: ["Rolling the feet outward.", "Rushing the lowering phase.", "Locking the knees."],
        visualDemo: "Vertical calf raise with a crisp toe-off.",
      }),
      home: makeVariant({
        name: "Standing Calf Raise",
        sets: 3,
        reps: "15-20",
        rest: "45 seconds",
        equipment: "Bodyweight",
        summary: "A simple calf raise that needs no equipment.",
        steps: [
          "Stand with feet flat and tall posture.",
          "Lift the heels slowly off the floor.",
          "Pause at the top.",
          "Lower down under control.",
        ],
        safetyTips: ["Hold a wall lightly for balance if needed.", "Keep the movement smooth."],
        commonMistakes: ["Bouncing rapidly.", "Leaning forward.", "Using a tiny partial range."],
        visualDemo: "Bodyweight calf raise with a slow lift and lower.",
      }),
      alternativeName: "Standing Calf Raise",
      alternativeEquipment: "Bodyweight",
      alternativeSummary: "A simple home calf exercise with the same movement pattern.",
    },
  ],
  upper: [
    {
      targetMuscle: "Upper back and lats",
      gym: makeVariant({
        name: "Lat Pulldown",
        sets: 4,
        reps: "10-12",
        rest: "75 seconds",
        equipment: "Lat pulldown machine",
        summary: "Pull the bar to the upper chest while keeping the shoulders down.",
        steps: [
          "Sit tall and grip the bar slightly wider than shoulder width.",
          "Pull the bar toward your upper chest by driving elbows down.",
          "Pause briefly with your shoulder blades squeezed.",
          "Return slowly until your arms are fully extended.",
        ],
        safetyTips: ["Do not lean far back to finish the rep.", "Keep the neck relaxed."],
        commonMistakes: ["Pulling behind the neck.", "Shrugging the shoulders.", "Using momentum."],
        visualDemo: "Controlled pulldown with elbows tracking down and back.",
      }),
      home: makeVariant({
        name: "Resistance Band Row",
        sets: 3,
        reps: "12-15",
        rest: "45 seconds",
        equipment: "Resistance band",
        summary: "A simple at-home pull that trains the back and posture.",
        steps: [
          "Anchor the band securely at chest height.",
          "Stand tall and pull the handles or band ends toward your ribs.",
          "Squeeze the shoulder blades together.",
          "Return slowly and keep the torso still.",
        ],
        safetyTips: ["Check that the anchor is secure.", "Keep your neck long and shoulders relaxed."],
        commonMistakes: ["Leaning back to cheat the pull.", "Letting the band snap back.", "Shrugging up."],
        visualDemo: "Standing band row with a clean squeeze at the end range.",
      }),
      alternativeName: "Resistance Band Row",
      alternativeEquipment: "Resistance band",
      alternativeSummary: "A home-friendly back exercise that still builds pulling strength.",
    },
    {
      targetMuscle: "Chest, shoulders, triceps",
      gym: makeVariant({
        name: "Chest Press Machine",
        sets: 3,
        reps: "10-12",
        rest: "75 seconds",
        equipment: "Chest press machine",
        summary: "Press straight forward with your wrists stacked over elbows.",
        steps: [
          "Set the seat so the handles line up with the middle of your chest.",
          "Press the handles forward until the arms are nearly straight.",
          "Slowly return until you feel a comfortable stretch.",
          "Keep your shoulders down and back the whole time.",
        ],
        safetyTips: ["Keep the movement controlled.", "Do not let the elbows flare aggressively."],
        commonMistakes: ["Bouncing the stack.", "Shrugging the shoulders.", "Locking out too hard."],
        visualDemo: "Machine press with stable shoulder position and even tempo.",
      }),
      home: makeVariant({
        name: "Wall Push-Up",
        sets: 3,
        reps: "10-15",
        rest: "45 seconds",
        equipment: "Wall",
        summary: "A low-impact push-up variation that builds pressing strength safely.",
        steps: [
          "Stand facing a wall with hands placed at chest height.",
          "Bend your elbows and bring your chest toward the wall.",
          "Press back to the start while keeping your body straight.",
          "Move your feet farther away to increase difficulty.",
        ],
        safetyTips: ["Keep wrists comfortable by adjusting hand angle.", "Use a slow tempo for better control."],
        commonMistakes: ["Letting the hips sag.", "Moving too close to the wall.", "Rushing the rep."],
        visualDemo: "Wall-based press with a straight body line.",
      }),
      alternativeName: "Wall Push-Up",
      alternativeEquipment: "Wall",
      alternativeSummary: "An approachable pressing variation for beginners at home.",
    },
    {
      targetMuscle: "Shoulders and triceps",
      gym: makeVariant({
        name: "Dumbbell Shoulder Press",
        sets: 3,
        reps: "8-10",
        rest: "75 seconds",
        equipment: "Dumbbells",
        summary: "Press overhead without arching the lower back.",
        steps: [
          "Hold the dumbbells at shoulder level and brace the core.",
          "Press the weights overhead in a smooth path.",
          "Lower them back to shoulder height with control.",
          "Keep your ribs stacked over your hips.",
        ],
        safetyTips: ["Use a neutral grip if shoulders feel better that way.", "Avoid excessive back extension."],
        commonMistakes: ["Flaring the ribs.", "Pressing too fast.", "Dropping the dumbbells too low."],
        visualDemo: "Seated or standing shoulder press with controlled overhead path.",
      }),
      home: makeVariant({
        name: "Pike Push-Up Hold",
        sets: 3,
        reps: "20-30 seconds",
        rest: "45 seconds",
        equipment: "Bodyweight",
        summary: "A beginner overhead-strength alternative that uses bodyweight.",
        steps: [
          "Start in a modified pike position with hips slightly lifted.",
          "Bend the elbows a small amount or hold the position statically.",
          "Keep the head and neck neutral.",
          "Push the floor away and reset between holds.",
        ],
        safetyTips: ["Keep the range small if shoulders are new to overhead work.", "Stop if you feel neck strain."],
        commonMistakes: ["Letting the shoulders collapse.", "Rushing through the hold.", "Locking the elbows harshly."],
        visualDemo: "Short-range overhead shoulder pattern with bodyweight support.",
      }),
      alternativeName: "Pike Push-Up Hold",
      alternativeEquipment: "Bodyweight",
      alternativeSummary: "A home shoulder-strength option when dumbbells are not available.",
    },
    {
      targetMuscle: "Upper back and posture",
      gym: makeVariant({
        name: "Seated Row Machine",
        sets: 3,
        reps: "10-12",
        rest: "75 seconds",
        equipment: "Seated row machine",
        summary: "Pull the handles toward your torso and squeeze the shoulder blades.",
        steps: [
          "Sit tall with the chest lifted.",
          "Pull the handles toward the ribs.",
          "Pause and squeeze the shoulder blades.",
          "Return slowly with control.",
        ],
        safetyTips: ["Keep your torso still.", "Do not shrug your shoulders."],
        commonMistakes: ["Leaning back too far.", "Using momentum.", "Letting the shoulders round forward."],
        visualDemo: "Rowing motion with the elbows driving back.",
      }),
      home: makeVariant({
        name: "Resistance Band Row",
        sets: 3,
        reps: "12-15",
        rest: "45 seconds",
        equipment: "Resistance band",
        summary: "Anchor the band and row toward your ribs.",
        steps: [
          "Anchor the band securely.",
          "Pull the band toward your ribcage.",
          "Squeeze the shoulder blades together.",
          "Return under control.",
        ],
        safetyTips: ["Use a secure anchor.", "Keep the neck long."],
        commonMistakes: ["Leaning back.", "Snapping the band.", "Shrugging the shoulders."],
        visualDemo: "Standing band row with a steady pull.",
      }),
      alternativeName: "Resistance Band Row",
      alternativeEquipment: "Resistance band",
      alternativeSummary: "A home row pattern that mirrors the machine movement.",
    },
    {
      targetMuscle: "Arms and triceps",
      gym: makeVariant({
        name: "Cable Tricep Pushdown",
        sets: 3,
        reps: "12-15",
        rest: "45 seconds",
        equipment: "Cable machine",
        summary: "Push the bar down by extending the elbows.",
        steps: [
          "Stand tall with elbows pinned to your sides.",
          "Push the handle down until the arms are nearly straight.",
          "Slowly return to the start.",
          "Keep the upper arms still.",
        ],
        safetyTips: ["Do not swing the torso.", "Keep your wrists neutral."],
        commonMistakes: ["Flaring the elbows.", "Leaning into the weight.", "Using body momentum."],
        visualDemo: "Downward tricep press with elbows fixed.",
      }),
      home: makeVariant({
        name: "Bench Dips",
        sets: 3,
        reps: "10-12",
        rest: "45 seconds",
        equipment: "Sturdy chair or bench",
        summary: "A simple tricep move using a stable surface.",
        steps: [
          "Place your hands on a sturdy bench behind you.",
          "Lower the hips by bending the elbows.",
          "Press back up through the palms.",
          "Keep the shoulders down and away from the ears.",
        ],
        safetyTips: ["Use a stable surface.", "Reduce range if the shoulders feel stressed."],
        commonMistakes: ["Dropping too low.", "Shrugging the shoulders.", "Letting the hips drift too far forward."],
        visualDemo: "Bench dip with controlled elbow bend and press.",
      }),
      alternativeName: "Bench Dips",
      alternativeEquipment: "Sturdy chair or bench",
      alternativeSummary: "A home tricep alternative that is easy to set up.",
    },
    {
      targetMuscle: "Biceps",
      gym: makeVariant({
        name: "Dumbbell Bicep Curl",
        sets: 3,
        reps: "10-12",
        rest: "45 seconds",
        equipment: "Dumbbells",
        summary: "Curl the weights while keeping your elbows close.",
        steps: [
          "Stand tall with dumbbells by your sides.",
          "Curl the weights toward the shoulders.",
          "Pause briefly at the top.",
          "Lower slowly without swinging.",
        ],
        safetyTips: ["Keep the elbows tucked.", "Use a controlled lowering phase."],
        commonMistakes: ["Swinging the torso.", "Curling the wrists too hard.", "Dropping the weight quickly."],
        visualDemo: "Standing dumbbell curl with a smooth rise and lower.",
      }),
      home: makeVariant({
        name: "Resistance Band Curl",
        sets: 3,
        reps: "12-15",
        rest: "45 seconds",
        equipment: "Resistance band",
        summary: "A home-friendly curl that keeps tension on the biceps.",
        steps: [
          "Stand on the band and hold the handles.",
          "Curl the hands toward the shoulders.",
          "Squeeze the biceps at the top.",
          "Return slowly to the start.",
        ],
        safetyTips: ["Keep the upper arms still.", "Step wider if you need more resistance."],
        commonMistakes: ["Leaning back.", "Pulling with the shoulders.", "Letting the band snap back."],
        visualDemo: "Band curl with a clean elbow bend.",
      }),
      alternativeName: "Resistance Band Curl",
      alternativeEquipment: "Resistance band",
      alternativeSummary: "A beginner-friendly home alternative for bicep training.",
    },
  ],
  core: [
    {
      targetMuscle: "Deep core and anti-rotation",
      gym: makeVariant({
        name: "Cable Pallof Press",
        sets: 3,
        reps: "10 each side",
        rest: "45 seconds",
        equipment: "Cable machine",
        summary: "Resist twisting by keeping the torso square while pressing out.",
        steps: [
          "Stand sideways to the cable with the handle at chest height.",
          "Brace your core and press the handle straight out from the chest.",
          "Hold briefly without letting the torso rotate.",
          "Bring the handle back with control and repeat on both sides.",
        ],
        safetyTips: ["Keep the hips and shoulders aligned.", "Use a lighter setting to learn the pattern."],
        commonMistakes: ["Leaning away from the cable.", "Letting the ribs flare.", "Rotating the body."],
        visualDemo: "Anti-rotation press that keeps the torso quiet.",
      }),
      home: makeVariant({
        name: "Dead Bug",
        sets: 3,
        reps: "10 each side",
        rest: "45 seconds",
        equipment: "Bodyweight",
        summary: "A controlled core drill that teaches stability and breathing.",
        steps: [
          "Lie on your back with arms up and knees bent at 90 degrees.",
          "Extend the opposite arm and leg slowly while keeping the back down.",
          "Return to the start and switch sides.",
          "Move slowly enough to keep tension in the core.",
        ],
        safetyTips: ["Keep the lower back gently pressed toward the floor.", "Exhale as you extend."],
        commonMistakes: ["Arching the lower back.", "Moving too quickly.", "Losing control of the opposite limb."],
        visualDemo: "Alternating arm-leg extension on the floor.",
      }),
      alternativeName: "Dead Bug",
      alternativeEquipment: "Bodyweight",
      alternativeSummary: "A simple home core drill that reinforces stability.",
    },
    {
      targetMuscle: "Core, shoulders, glutes",
      gym: makeVariant({
        name: "Plank",
        sets: 3,
        reps: "30-45 seconds",
        rest: "45 seconds",
        equipment: "Mat",
        summary: "Keep a straight line from shoulders to ankles and breathe steadily.",
        steps: [
          "Place your forearms on the mat with elbows under shoulders.",
          "Lift into a straight line from head to heels.",
          "Brace the abs and breathe without holding tension too hard.",
          "Lower before your form breaks down.",
        ],
        safetyTips: ["Drop to knees if your lower back starts to sag.", "Keep your gaze just ahead of your hands."],
        commonMistakes: ["Sagging hips.", "Piking the hips too high.", "Holding the breath."],
        visualDemo: "Forearm plank with a long straight posture.",
      }),
      home: makeVariant({
        name: "Plank",
        sets: 3,
        reps: "20-40 seconds",
        rest: "45 seconds",
        equipment: "Floor",
        summary: "A floor-friendly plank that can be shortened for beginners.",
        steps: [
          "Set your forearms down and step the feet back.",
          "Keep the body in one long line.",
          "Engage the abs and glutes lightly.",
          "Rest before form quality drops.",
        ],
        safetyTips: ["Use a wall or bench incline if needed.", "Keep breathing through the hold."],
        commonMistakes: ["Dropping the hips.", "Craning the neck.", "Holding longer than good form allows."],
        visualDemo: "Short, controlled core hold with beginner scaling.",
      }),
      alternativeName: "Plank",
      alternativeEquipment: "Floor",
      alternativeSummary: "A simple static hold for core endurance.",
    },
    {
      targetMuscle: "Core and coordination",
      gym: makeVariant({
        name: "Mountain Climbers",
        sets: 3,
        reps: "30 seconds",
        rest: "45 seconds",
        equipment: "Mat",
        summary: "Drive one knee at a time while keeping the hips steady.",
        steps: [
          "Start in a strong high plank position.",
          "Drive one knee forward, then switch legs in a steady rhythm.",
          "Keep your shoulders stacked over your wrists.",
          "Slow down if the torso starts bouncing.",
        ],
        safetyTips: ["Keep your hands planted firmly.", "Use a controlled pace rather than maximum speed."],
        commonMistakes: ["Jumping instead of stepping.", "Lifting the hips too much.", "Letting the shoulders drift back."],
        visualDemo: "Alternating knee drive in a high plank position.",
      }),
      home: makeVariant({
        name: "Marching Plank",
        sets: 3,
        reps: "20-30 seconds",
        rest: "45 seconds",
        equipment: "Mat",
        summary: "A slower, beginner-friendly plank variation for home training.",
        steps: [
          "Hold a high plank with hands under shoulders.",
          "Lift one foot a small amount and set it back down.",
          "Alternate sides while keeping the torso stable.",
          "Slow the movement if your hips start wobbling.",
        ],
        safetyTips: ["Keep the movement small and intentional.", "Drop to knees if the wrists need a break."],
        commonMistakes: ["Swinging the hips.", "Hurrying the steps.", "Allowing the core to relax."],
        visualDemo: "Slow plank march with minimal body sway.",
      }),
      alternativeName: "Marching Plank",
      alternativeEquipment: "Mat",
      alternativeSummary: "A slower way to train core stability at home.",
    },
    {
      targetMuscle: "Abs and rotation",
      gym: makeVariant({
        name: "Cable Woodchop",
        sets: 3,
        reps: "10 each side",
        rest: "45 seconds",
        equipment: "Cable machine",
        summary: "Rotate through the torso while keeping the core braced.",
        steps: [
          "Stand with the cable set high or low depending on the direction.",
          "Pull the handle across the body with control.",
          "Rotate through the torso and hips together.",
          "Return slowly to the start.",
        ],
        safetyTips: ["Keep the movement smooth.", "Do not yank the cable."],
        commonMistakes: ["Twisting only through the lower back.", "Using momentum.", "Rushing the return."],
        visualDemo: "Diagonal cable chop with controlled rotation.",
      }),
      home: makeVariant({
        name: "Bicycle Crunch",
        sets: 3,
        reps: "12 each side",
        rest: "45 seconds",
        equipment: "Bodyweight",
        summary: "A home core drill that trains rotation and control.",
        steps: [
          "Lie on your back and lift the knees.",
          "Bring one elbow toward the opposite knee.",
          "Switch sides in a smooth pedaling motion.",
          "Keep the core active throughout.",
        ],
        safetyTips: ["Avoid pulling on the neck.", "Move through a controlled range."],
        commonMistakes: ["Rushing the reps.", "Lifting the lower back too much.", "Forcing the elbow to the knee."],
        visualDemo: "Alternating bicycle motion with a steady rhythm.",
      }),
      alternativeName: "Bicycle Crunch",
      alternativeEquipment: "Bodyweight",
      alternativeSummary: "A home rotation-based alternative for core training.",
    },
    {
      targetMuscle: "Core and conditioning",
      gym: makeVariant({
        name: "Machine Crunch",
        sets: 3,
        reps: "12-15",
        rest: "45 seconds",
        equipment: "Ab crunch machine",
        summary: "Crunch forward by tightening the abs instead of pulling with the arms.",
        steps: [
          "Sit on the machine and set the pad comfortably.",
          "Crunch forward through the abs.",
          "Pause and squeeze at the bottom.",
          "Return slowly to the start.",
        ],
        safetyTips: ["Keep the movement controlled.", "Do not yank through the neck."],
        commonMistakes: ["Using the arms too much.", "Rushing the reps.", "Letting the hips slide."],
        visualDemo: "Seated crunch with a smooth abdominal squeeze.",
      }),
      home: makeVariant({
        name: "Jumping Jacks",
        sets: 3,
        reps: "30-45 seconds",
        rest: "45 seconds",
        equipment: "Bodyweight",
        summary: "A low-complexity cardio-core move that raises the heart rate.",
        steps: [
          "Jump feet out while bringing the arms overhead.",
          "Jump feet back together with the arms at your sides.",
          "Maintain a steady rhythm.",
          "Land softly and keep breathing.",
        ],
        safetyTips: ["Use a smaller range if needed.", "Stay light on your feet."],
        commonMistakes: ["Landing hard.", "Hunching the shoulders.", "Moving without rhythm."],
        visualDemo: "Classic jumping jack with coordinated arm and leg motion.",
      }),
      alternativeName: "Jumping Jacks",
      alternativeEquipment: "Bodyweight",
      alternativeSummary: "A simple home conditioning alternative with movement and rhythm.",
    },
  ],
  cardio: [
    {
      targetMuscle: "Cardiovascular conditioning",
      gym: makeVariant({
        name: "Incline Treadmill Walk",
        sets: 1,
        reps: "20 minutes",
        rest: "As needed",
        equipment: "Treadmill",
        summary: "Use a brisk pace that challenges you but still allows conversation.",
        steps: [
          "Set the treadmill to a comfortable incline.",
          "Walk with tall posture and relaxed arms.",
          "Breathe rhythmically and keep your pace steady.",
          "Increase incline gradually if you want more challenge.",
        ],
        safetyTips: ["Hold the rails only if needed for balance.", "Stay hydrated during longer sessions."],
        commonMistakes: ["Leaning on the handles.", "Setting the incline too high too soon.", "Taking tiny hunched steps."],
        visualDemo: "Steady incline walk with upright posture.",
      }),
      home: makeVariant({
        name: "Step Touch Intervals",
        sets: 1,
        reps: "20 minutes",
        rest: "As needed",
        equipment: "Bodyweight",
        summary: "A low-impact home cardio option that keeps the heart rate up.",
        steps: [
          "Step side to side with a light reach of the arms.",
          "Add knee lifts or quick arms to raise intensity.",
          "Work in a steady rhythm for the full interval.",
          "Keep breathing smooth and controlled.",
        ],
        safetyTips: ["Keep the floor clear.", "Stay light on the feet to protect the joints."],
        commonMistakes: ["Moving without rhythm.", "Locking the knees.", "Holding the breath."],
        visualDemo: "Simple low-impact marching and step touch pattern.",
      }),
      alternativeName: "Step Touch Intervals",
      alternativeEquipment: "Bodyweight",
      alternativeSummary: "A no-equipment cardio option for home workouts.",
    },
    {
      targetMuscle: "Cardiovascular endurance",
      gym: makeVariant({
        name: "Bike Intervals",
        sets: 5,
        reps: "1 min hard, 1 min easy",
        rest: "60 seconds",
        equipment: "Stationary bike",
        summary: "Work hard during the interval, then recover with easy pedaling.",
        steps: [
          "Warm up with a smooth easy pedal for a minute.",
          "Increase resistance and cadence for the hard interval.",
          "Recover with slower easy pedaling.",
          "Repeat for the planned number of rounds.",
        ],
        safetyTips: ["Keep your hips stable on the seat.", "Adjust resistance before starting the next round."],
        commonMistakes: ["Starting too aggressively.", "Rocking the torso.", "Ignoring recovery pace."],
        visualDemo: "Alternating hard and easy cycling intervals.",
      }),
      home: makeVariant({
        name: "High Knee March",
        sets: 5,
        reps: "1 min hard, 1 min easy",
        rest: "60 seconds",
        equipment: "Bodyweight",
        summary: "A low-impact cardio swap for cycling intervals at home.",
        steps: [
          "March in place while driving the knees up.",
          "Swing the arms to raise the heart rate.",
          "Move faster during hard rounds and slower during recovery.",
          "Stay upright and keep your landing soft.",
        ],
        safetyTips: ["Use a smaller knee lift if balance is a concern.", "Keep the steps light and quiet."],
        commonMistakes: ["Slamming the feet down.", "Leaning back.", "Holding the arms too stiffly."],
        visualDemo: "Marching with a stronger knee drive for intervals.",
      }),
      alternativeName: "High Knee March",
      alternativeEquipment: "Bodyweight",
      alternativeSummary: "A home cardio substitute when a bike is not available.",
    },
    {
      targetMuscle: "Cardio and lower body",
      gym: makeVariant({
        name: "Treadmill Incline Walk",
        sets: 1,
        reps: "20 minutes",
        rest: "As needed",
        equipment: "Treadmill",
        summary: "Walk with a steady incline to build conditioning.",
        steps: [
          "Set the treadmill to a comfortable incline.",
          "Walk with tall posture.",
          "Swing the arms naturally.",
          "Keep the pace steady throughout.",
        ],
        safetyTips: ["Do not lean on the rails.", "Increase incline gradually."],
        commonMistakes: ["Hunching forward.", "Holding the rails.", "Starting too steep too soon."],
        visualDemo: "Steady incline walk with a small step rhythm.",
      }),
      home: makeVariant({
        name: "Jumping Jacks",
        sets: 1,
        reps: "20 minutes",
        rest: "As needed",
        equipment: "Bodyweight",
        summary: "A simple home cardio option that keeps you moving.",
        steps: [
          "Jump the feet out and raise the arms.",
          "Return to the starting position.",
          "Keep a consistent pace.",
          "Rest briefly as needed.",
        ],
        safetyTips: ["Keep the landings soft.", "Modify to step jacks if needed."],
        commonMistakes: ["Landing hard.", "Holding your breath.", "Going too fast too soon."],
        visualDemo: "Rhythmic jumping jack with coordinated limbs.",
      }),
      alternativeName: "Jumping Jacks",
      alternativeEquipment: "Bodyweight",
      alternativeSummary: "A no-equipment cardio alternative for the home plan.",
    },
  ],
  fullBody: [
    {
      targetMuscle: "Total-body strength and coordination",
      gym: makeVariant({
        name: "Dumbbell Squat to Press",
        sets: 3,
        reps: "10-12",
        rest: "75 seconds",
        equipment: "Dumbbells",
        summary: "Combine a squat and press to train legs, shoulders, and core together.",
        steps: [
          "Hold dumbbells at shoulder height and squat down with control.",
          "Stand up and press the weights overhead in one smooth motion.",
          "Lower the weights back to shoulders before the next rep.",
          "Keep the core braced through the whole sequence.",
        ],
        safetyTips: ["Start light so the pattern stays clean.", "Stop if your lower back starts overworking."],
        commonMistakes: ["Using momentum.", "Rushing the press.", "Letting the knees collapse inward."],
        visualDemo: "Squat and overhead press combined into one fluid rep.",
      }),
      home: makeVariant({
        name: "Squat Reach",
        sets: 3,
        reps: "12-15",
        rest: "60 seconds",
        equipment: "Bodyweight",
        summary: "A simple full-body pattern that keeps the workout accessible.",
        steps: [
          "Perform a bodyweight squat with control.",
          "Stand up and reach both arms overhead.",
          "Reset your breathing before the next rep.",
          "Keep the pace smooth rather than fast.",
        ],
        safetyTips: ["Use this to warm up or finish a session.", "Keep the reach comfortable for your shoulders."],
        commonMistakes: ["Overarching the back on the reach.", "Squatting too shallow or too fast.", "Holding tension in the neck."],
        visualDemo: "Bodyweight squat flowing into a gentle overhead reach.",
      }),
      alternativeName: "Squat Reach",
      alternativeEquipment: "Bodyweight",
      alternativeSummary: "A no-equipment full-body pattern that scales well for beginners.",
    },
  ],
};

const normalizeWorkoutLocation = (location) => {
  const value = String(location || "").toLowerCase();
  if (value.includes("home") && value.includes("gym")) return "both";
  if (value.includes("both")) return "both";
  if (value.includes("home")) return "home";
  return "gym";
};

const resolveVariant = (blueprint, workoutLocation) => {
  const location = normalizeWorkoutLocation(workoutLocation);
  const primary = location === "home" ? blueprint.home : blueprint.gym;
  const alternative = location === "home" ? blueprint.gym : blueprint.home;
  const displayLocation = location === "home" ? "Home" : location === "both" ? "Both" : "Gym";
  const alternativeLocation = location === "home" ? "Gym" : "Home";

  const machineSetupTips =
    location === "home"
      ? [
          "Clear a small space and grab a mat if you have one.",
          "Use a sturdy chair, wall, or step wherever the move needs support.",
          "Focus on slow, controlled reps instead of speed.",
        ]
      : [
          "Adjust the seat and pads so the movement lines up with your joints.",
          "Start with a light weight to learn the full range of motion.",
          "Keep your back supported and move in a smooth, controlled tempo.",
        ];

  return {
    name: primary.name,
    sets: primary.sets,
    reps: primary.reps,
    rest: primary.rest,
    equipment: primary.equipment,
    instruction: primary.summary,
    instructions: primary.summary,
    locationType: displayLocation,
    targetMuscle: blueprint.targetMuscle,
    difficulty: "Beginner",
    steps: primary.steps,
    machineSetupTips,
    safetyTips: primary.safetyTips,
    commonMistakes: primary.commonMistakes,
    visualDemo: primary.visualDemo,
    animationUrl: primary.animationUrl || "",
    animationKey: slugify(primary.name),
    completed: false,
    notes: "",
    youtubeEmbedUrl: primary.youtubeEmbedUrl || getExerciseVideoUrl(primary.name),
    alternativeExercise: {
      name: alternative.name,
      equipment: alternative.equipment,
      locationType: alternativeLocation,
      summary: alternative.summary,
      youtubeEmbedUrl: alternative.youtubeEmbedUrl || getExerciseVideoUrl(alternative.name),
    },
    alternativeExercises: [
      {
        name: alternative.name,
        locationType: alternativeLocation,
        equipment: alternative.equipment,
        reason: alternative.summary || "Trains the same muscles in a different setting.",
        instruction: (alternative.steps && alternative.steps[0]) || alternative.summary || "Move slowly with controlled form.",
        youtubeEmbedUrl: alternative.youtubeEmbedUrl || getExerciseVideoUrl(alternative.name),
        animationKey: slugify(alternative.name),
      },
    ],
  };
};

const exerciseSetsForFocus = (focus, workoutLocation, dayIndex = 0) => {
  const lowerFocus = focus.toLowerCase();
  let blueprintGroup = workoutBlueprints.fullBody;

  if (lowerFocus.includes("lower") || lowerFocus.includes("glute")) blueprintGroup = workoutBlueprints.lower;
  else if (lowerFocus.includes("upper")) blueprintGroup = workoutBlueprints.upper;
  else if (lowerFocus.includes("cardio")) blueprintGroup = workoutBlueprints.cardio;
  else if (lowerFocus.includes("core")) blueprintGroup = workoutBlueprints.core;

  const selectionSize = Math.min(4, blueprintGroup.length);
  return Array.from({ length: selectionSize }, (_, index) => {
    const blueprint = blueprintGroup[(dayIndex + index) % blueprintGroup.length];
    return resolveVariant(blueprint, workoutLocation);
  });
};

const pickFocuses = (profile) => {
  const goal = (profile.fitnessGoal || "").toLowerCase();
  const target = (profile.targetBodyFocus || "").toLowerCase();

  if (target.includes("glute") || target.includes("leg")) return ["Lower Body and Glutes", "Upper Body", "Core and Mobility"];
  if (target.includes("upper") || target.includes("arm")) return ["Upper Body", "Lower Body", "Core and Conditioning"];
  if (goal.includes("endurance") || goal.includes("fat")) return ["Cardio and Core", "Lower Body", "Upper Body"];
  if (goal.includes("muscle")) return ["Upper Body Strength", "Lower Body and Glutes", "Full Body Strength"];
  return ["Full Body Strength", "Cardio and Core", "Lower Body and Glutes", "Upper Body"];
};

const generateWorkoutDays = (profile) => {
  const daysPerWeek = Math.min(Math.max(Number(profile.workoutDaysPerWeek) || 3, 1), 7);
  const focuses = pickFocuses(profile);
  const workoutLocation = profile.workoutLocation || profile.location || "Both";

  return Array.from({ length: daysPerWeek }, (_, index) => {
    const focus = focuses[index % focuses.length];
    return {
      day: `Day ${index + 1}`,
      focus,
      workoutLocation,
      exercises: exerciseSetsForFocus(focus, workoutLocation, index),
      completed: false,
      notes: "",
    };
  });
};

// Map a chosen session focus to one or more blueprint groups.
const FOCUS_CONFIG = {
  "full body": { groups: ["lower", "upper", "core", "cardio"], roundRobin: true },
  "upper body": { groups: ["upper", "core"], roundRobin: false },
  "lower body": { groups: ["lower", "core"], roundRobin: false },
  "glutes & legs": { groups: ["lower", "core"], roundRobin: false },
  core: { groups: ["core", "cardio", "lower"], roundRobin: false },
  cardio: { groups: ["cardio", "core", "lower"], roundRobin: false },
};

const resolveFocusConfig = (focus) => {
  const key = String(focus || "").toLowerCase().trim();
  if (FOCUS_CONFIG[key]) return FOCUS_CONFIG[key];
  if (key.includes("upper") || key.includes("arm")) return FOCUS_CONFIG["upper body"];
  if (key.includes("glute") || key.includes("leg") || key.includes("lower")) return FOCUS_CONFIG["lower body"];
  if (key.includes("core") || key.includes("abs")) return FOCUS_CONFIG.core;
  if (key.includes("cardio") || key.includes("endurance")) return FOCUS_CONFIG.cardio;
  return FOCUS_CONFIG["full body"];
};

// Build a single-session list of `count` distinct exercises for the focus.
const buildSessionExercises = (focus, workoutLocation, count) => {
  const cfg = resolveFocusConfig(focus);
  const groups = cfg.groups.map((g) => workoutBlueprints[g] || []);
  const pool = [];
  const seen = new Set();
  const addBlueprint = (bp) => {
    const key = (bp.gym && bp.gym.name) || (bp.home && bp.home.name) || bp.targetMuscle;
    if (!seen.has(key)) {
      seen.add(key);
      pool.push(bp);
    }
  };

  if (cfg.roundRobin) {
    const maxLen = Math.max(...groups.map((g) => g.length), 0);
    for (let i = 0; i < maxLen; i += 1) {
      for (const group of groups) if (group[i]) addBlueprint(group[i]);
    }
  } else {
    for (const group of groups) for (const bp of group) addBlueprint(bp);
  }

  const target = Math.min(Math.max(Number(count) || 6, 1), 12);
  return pool.slice(0, target).map((bp) => resolveVariant(bp, workoutLocation));
};

const buildSessionDays = (profile, focus, exerciseCount) => {
  const workoutLocation = profile.workoutLocation || profile.location || "Both";
  return [
    {
      day: "Today's Session",
      focus,
      workoutLocation,
      exercises: buildSessionExercises(focus, workoutLocation, exerciseCount),
      completed: false,
      notes: "",
    },
  ];
};

const readJsonDb = async () => {
  await connectDB.ensureJsonDatabaseFile();
  const file = await fs.readFile(connectDB.dataFile, "utf8");
  return JSON.parse(file);
};

const writeJsonDb = async (db) => {
  await fs.writeFile(connectDB.dataFile, JSON.stringify(db, null, 2));
};

const generateWorkoutPlan = async (req, res, next) => {
  try {
    const profile = await getProfileByUserId(req.user.id);
    if (!profile) return res.status(400).json({ message: "Create your fitness profile before generating a workout plan." });

    // Session mode: the user picked a focus + number of exercises on the
    // generate page. Otherwise fall back to the profile-based weekly plan.
    const { focus, exerciseCount } = req.body || {};
    const sessionMode = Boolean(focus);
    const days = sessionMode ? buildSessionDays(profile, focus, exerciseCount) : generateWorkoutDays(profile);
    const planName = sessionMode ? `${focus} Session` : "Workout Plan";

    if (connectDB.getDatabaseMode() === "json") {
      const db = await readJsonDb();
      const now = new Date().toISOString();

      db.workoutPlans = db.workoutPlans.map((plan) =>
        String(plan.user) === String(req.user.id) ? { ...plan, isActive: false, updatedAt: now } : plan
      );

      const workoutPlan = {
        _id: randomUUID(),
        user: String(req.user.id),
        planName,
        workoutLocation: profile.workoutLocation || profile.location || "Both",
        days,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      };

      db.workoutPlans.push(workoutPlan);
      await writeJsonDb(db);

      return res.status(201).json({
        message: "Workout plan generated successfully.",
        workoutPlan,
        plan: workoutPlan,
      });
    }

    await WorkoutPlan.updateMany({ user: req.user.id }, { $set: { isActive: false } });
    const workoutPlan = await WorkoutPlan.create({
      user: req.user.id,
      planName,
      workoutLocation: profile.workoutLocation || profile.location || "Both",
      days,
      isActive: true,
    });

    res.status(201).json({
      message: "Workout plan generated successfully.",
      workoutPlan,
      plan: workoutPlan,
    });
  } catch (error) {
    next(error);
  }
};

const getWorkoutPlans = async (req, res, next) => {
  try {
    if (connectDB.getDatabaseMode() === "json") {
      const db = await readJsonDb();
      const plans = db.workoutPlans.filter((plan) => String(plan.user) === String(req.user.id)).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return res.json(plans);
    }

    const plans = await WorkoutPlan.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(plans);
  } catch (error) {
    next(error);
  }
};

const updateWorkoutPlan = async (req, res, next) => {
  try {
    if (connectDB.getDatabaseMode() === "json") {
      const db = await readJsonDb();
      const index = db.workoutPlans.findIndex((plan) => String(plan._id) === String(req.params.id) && String(plan.user) === String(req.user.id));
      if (index === -1) return res.status(404).json({ message: "Workout plan not found." });

      db.workoutPlans[index] = { ...db.workoutPlans[index], ...req.body, updatedAt: new Date().toISOString() };
      await writeJsonDb(db);
      return res.json({ message: "Workout plan updated successfully.", workoutPlan: db.workoutPlans[index] });
    }

    const plan = await WorkoutPlan.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!plan) return res.status(404).json({ message: "Workout plan not found." });
    res.json({ message: "Workout plan updated successfully.", workoutPlan: plan });
  } catch (error) {
    next(error);
  }
};

const deleteWorkoutPlan = async (req, res, next) => {
  try {
    if (connectDB.getDatabaseMode() === "json") {
      const db = await readJsonDb();
      const before = db.workoutPlans.length;
      db.workoutPlans = db.workoutPlans.filter((plan) => !(String(plan._id) === String(req.params.id) && String(plan.user) === String(req.user.id)));
      if (db.workoutPlans.length === before) return res.status(404).json({ message: "Workout plan not found." });
      await writeJsonDb(db);
      return res.json({ message: "Workout plan deleted successfully." });
    }

    const plan = await WorkoutPlan.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!plan) return res.status(404).json({ message: "Workout plan not found." });
    res.json({ message: "Workout plan deleted successfully." });
  } catch (error) {
    next(error);
  }
};

module.exports = { generateWorkoutPlan, getWorkoutPlans, updateWorkoutPlan, deleteWorkoutPlan };
