import { getYouTubeEmbedUrl } from "@/lib/youtube";
import { normalizeExerciseName } from "@/lib/normalizeExerciseName";

// Every supported exercise maps to a real YouTube tutorial embed URL.
// Keys are the standardized exercise names (see normalizeExerciseName).
export const workoutDemoMap: Record<string, string> = {
  // Home / bodyweight
  "Bodyweight Squats": "https://www.youtube.com/embed/P-yaD24bUE8",
  "Dumbbell Squats": "https://www.youtube.com/embed/Xjo_fY9Hl9w",
  "Glute Bridges": "https://www.youtube.com/embed/OUgsJ8-Vi0E",
  "Reverse Lunges": "https://www.youtube.com/embed/xrPteyQLGAo",
  "Wall Push-ups": "https://www.youtube.com/embed/QpMTk21EmaM",
  "Push-ups": "https://www.youtube.com/embed/WDIpL0pjun0",
  "Pike Push-ups": "https://www.youtube.com/embed/XckEEwa1BPI",
  "Dumbbell Romanian Deadlift": "https://www.youtube.com/embed/jEy_czb3RKA",
  "Resistance Band Rows": "https://www.youtube.com/embed/Y3H17rshgZE",
  "Dumbbell Rows": "https://www.youtube.com/embed/6gvmcqr226U",
  "Dumbbell Shoulder Press": "https://www.youtube.com/embed/e_f5oodNEcI",
  Plank: "https://www.youtube.com/embed/pSHjTRCQxIw",
  "Dead Bug": "https://www.youtube.com/embed/bxn9FBrt4-A",
  "Mountain Climbers": "https://www.youtube.com/embed/nmwgirgXLYM",
  "Standing Calf Raises": "https://www.youtube.com/embed/-M4-G8p8fmc",
  "Step-ups": "https://www.youtube.com/embed/dQqApCGd5Ss",
  "Side-Lying Leg Raises": "https://www.youtube.com/embed/jgh6sGwtTwk",
  "Bodyweight Hip Thrust": "https://www.youtube.com/embed/pF17m_CXfL0",
  "Bicycle Crunches": "https://www.youtube.com/embed/9FGilxCbdz8",
  "Jumping Jacks": "https://www.youtube.com/embed/c4DAnQ6DtF8",
  "Step Touch Intervals": "https://www.youtube.com/embed/8oTjg7ZXJok",
  "Brisk Walk": "https://www.youtube.com/embed/wQrV75N2BrI",

  // Gym / machines
  "Leg Press Machine": "https://www.youtube.com/embed/Aq5uxXrXq7c",
  "Hip Thrust Machine": "https://www.youtube.com/embed/UVucPKyQVLU",
  "Cable Kickbacks": "https://www.youtube.com/embed/5jJNfIlKTmg",
  "Cable Pallof Press": "https://www.youtube.com/embed/SY5lRzBPtM4",
  "Lat Pulldown Machine": "https://www.youtube.com/embed/AOpi-p0cJkc",
  "Seated Row Machine": "https://www.youtube.com/embed/TeFo51Q_Nsc",
  "Chest Press Machine": "https://www.youtube.com/embed/sqNwDkUU_Ps",
  "Shoulder Press Machine": "https://www.youtube.com/embed/3R14MnZbcpw",
  "Leg Extension Machine": "https://www.youtube.com/embed/YyvSfVjQeL0",
  "Hamstring Curl Machine": "https://www.youtube.com/embed/t9sTSr-JYSs",
  "Abductor Machine": "https://www.youtube.com/embed/OjI5OpV6IWA",
  "Treadmill Incline Walk": "https://www.youtube.com/embed/NAsObfFJXvE",
  "Cable Tricep Pushdown": "https://www.youtube.com/embed/2-LAMcpzODU",
  "Dumbbell Bicep Curl": "https://www.youtube.com/embed/ykJmrZ5v0Oo",
};

// Ordered keyword fallback for names not directly in the map (most specific
// first). Each rule points to a standardized name that exists in the map, so a
// niche variant still resolves to a relevant, correct tutorial video.
const keywordRules: ReadonlyArray<readonly [RegExp, string]> = [
  [/leg\s*press/, "Leg Press Machine"],
  [/leg\s*extension/, "Leg Extension Machine"],
  [/(hamstring|leg\s*curl|lying\s*curl)/, "Hamstring Curl Machine"],
  [/abductor|abduction|lateral\s*walk/, "Abductor Machine"],
  [/kickback|donkey/, "Cable Kickbacks"],
  [/(lat\s*pulldown|pulldown|\blat\b)/, "Lat Pulldown Machine"],
  [/lunge/, "Reverse Lunges"],
  [/step[\s-]?up/, "Step-ups"],
  [/calf/, "Standing Calf Raises"],
  [/(glute\s*bridge|\bbridge\b)/, "Glute Bridges"],
  [/(hip\s*thrust\s*machine)/, "Hip Thrust Machine"],
  [/(hip\s*thrust|\bhip\b)/, "Bodyweight Hip Thrust"],
  [/(romanian|\brdl\b|deadlift|hinge)/, "Dumbbell Romanian Deadlift"],
  [/(goblet|dumbbell\s*squat)/, "Dumbbell Squats"],
  [/squat/, "Bodyweight Squats"],
  [/side[\s-]?lying|leg\s*raise/, "Side-Lying Leg Raises"],
  [/pallof|woodchop|anti[\s-]?rotation/, "Cable Pallof Press"],
  [/dead\s*bug|deadbug/, "Dead Bug"],
  [/(dumbbell.*row|bent[\s-]?over\s*row)/, "Dumbbell Rows"],
  [/(band\s*row|resistance\s*band\s*row|pull\s*apart)/, "Resistance Band Rows"],
  [/(seated\s*row|cable\s*row|\brow\b)/, "Seated Row Machine"],
  [/(chest\s*press|bench\s*press)/, "Chest Press Machine"],
  [/pike/, "Pike Push-ups"],
  [/(dumbbell\s*shoulder\s*press|standing.*shoulder\s*press)/, "Dumbbell Shoulder Press"],
  [/(shoulder\s*press|overhead\s*press|military\s*press)/, "Shoulder Press Machine"],
  [/wall\s*push/, "Wall Push-ups"],
  [/(push[\s-]?up|pushup|press[\s-]?up)/, "Push-ups"],
  [/(tricep|pushdown|\bdip\b)/, "Cable Tricep Pushdown"],
  [/(bicep|curl)/, "Dumbbell Bicep Curl"],
  [/mountain\s*climber/, "Mountain Climbers"],
  [/(bicycle|crunch)/, "Bicycle Crunches"],
  [/plank|shoulder\s*tap/, "Plank"],
  [/step\s*touch/, "Step Touch Intervals"],
  [/(treadmill|incline\s*walk|brisk\s*walk|\bwalk\b)/, "Treadmill Incline Walk"],
  [/(jumping\s*jack|\bjack\b|high\s*knee|jump|march|bike|cycle|cardio|interval)/, "Jumping Jacks"],
];

/**
 * Resolve the correct YouTube embed URL for an exercise name. Standardizes the
 * name, tries the direct map, then keyword fallback. Returns "" only when no
 * relevant video exists, so the demo component can show a clean message.
 */
export const getWorkoutVideo = (name?: string): string => {
  if (!name) return "";

  const standardized = normalizeExerciseName(name);
  if (workoutDemoMap[standardized]) return workoutDemoMap[standardized];

  const lower = standardized.toLowerCase();
  for (const [pattern, canonical] of keywordRules) {
    if (pattern.test(lower) && workoutDemoMap[canonical]) {
      return workoutDemoMap[canonical];
    }
  }

  return "";
};

// Resolve the best embed URL for an exercise: prefer a valid URL it already
// carries, otherwise look it up. Always returns embed-format (or "").
export const resolveWorkoutVideo = (name?: string, existingUrl?: string): string =>
  getYouTubeEmbedUrl(existingUrl) || getWorkoutVideo(name);
