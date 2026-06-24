import { getYouTubeEmbedUrl } from "@/lib/youtube";

export type WorkoutDemoEntry = {
  youtubeEmbedUrl: string;
  animationKey: string;
};

// Canonical demo data for every supported exercise. Keys are the exact
// exercise names produced by the workout generator.
export const workoutDemoMap: Record<string, WorkoutDemoEntry> = {
  // Home exercises
  "Bodyweight Squats": { youtubeEmbedUrl: "https://www.youtube.com/embed/P-yaD24bUE8", animationKey: "bodyweight-squats" },
  "Glute Bridges": { youtubeEmbedUrl: "https://www.youtube.com/embed/OUgsJ8-Vi0E", animationKey: "glute-bridges" },
  "Reverse Lunges": { youtubeEmbedUrl: "https://www.youtube.com/embed/xrPteyQLGAo", animationKey: "reverse-lunges" },
  "Wall Push-ups": { youtubeEmbedUrl: "https://www.youtube.com/embed/QpMTk21EmaM", animationKey: "wall-push-ups" },
  "Dumbbell Romanian Deadlift": { youtubeEmbedUrl: "https://www.youtube.com/embed/jEy_czb3RKA", animationKey: "dumbbell-romanian-deadlift" },
  "Resistance Band Rows": { youtubeEmbedUrl: "https://www.youtube.com/embed/xQNrFHEMhI4", animationKey: "resistance-band-rows" },
  Plank: { youtubeEmbedUrl: "https://www.youtube.com/embed/pSHjTRCQxIw", animationKey: "plank" },
  "Mountain Climbers": { youtubeEmbedUrl: "https://www.youtube.com/embed/nmwgirgXLYM", animationKey: "mountain-climbers" },
  "Standing Calf Raises": { youtubeEmbedUrl: "https://www.youtube.com/embed/-M4-G8p8fmc", animationKey: "standing-calf-raises" },
  "Step-ups": { youtubeEmbedUrl: "https://www.youtube.com/embed/dQqApCGd5Ss", animationKey: "step-ups" },
  "Side-Lying Leg Raises": { youtubeEmbedUrl: "https://www.youtube.com/embed/jgh6sGwtTwk", animationKey: "side-lying-leg-raises" },
  "Bodyweight Hip Thrust": { youtubeEmbedUrl: "https://www.youtube.com/embed/pF17m_CXfL0", animationKey: "bodyweight-hip-thrust" },
  "Bicycle Crunches": { youtubeEmbedUrl: "https://www.youtube.com/embed/9FGilxCbdz8", animationKey: "bicycle-crunches" },
  "Jumping Jacks": { youtubeEmbedUrl: "https://www.youtube.com/embed/c4DAnQ6DtF8", animationKey: "jumping-jacks" },

  // Gym exercises
  "Leg Press Machine": { youtubeEmbedUrl: "https://www.youtube.com/embed/Aq5uxXrXq7c", animationKey: "leg-press-machine" },
  "Hip Thrust Machine": { youtubeEmbedUrl: "https://www.youtube.com/embed/UVucPKyQVLU", animationKey: "hip-thrust-machine" },
  "Cable Kickbacks": { youtubeEmbedUrl: "https://www.youtube.com/embed/5jJNfIlKTmg", animationKey: "cable-kickbacks" },
  "Lat Pulldown Machine": { youtubeEmbedUrl: "https://www.youtube.com/embed/AOpi-p0cJkc", animationKey: "lat-pulldown-machine" },
  "Seated Row Machine": { youtubeEmbedUrl: "https://www.youtube.com/embed/TeFo51Q_Nsc", animationKey: "seated-row-machine" },
  "Chest Press Machine": { youtubeEmbedUrl: "https://www.youtube.com/embed/sqNwDkUU_Ps", animationKey: "chest-press-machine" },
  "Shoulder Press Machine": { youtubeEmbedUrl: "https://www.youtube.com/embed/3R14MnZbcpw", animationKey: "shoulder-press-machine" },
  "Leg Extension Machine": { youtubeEmbedUrl: "https://www.youtube.com/embed/YyvSfVjQeL0", animationKey: "leg-extension-machine" },
  "Hamstring Curl Machine": { youtubeEmbedUrl: "https://www.youtube.com/embed/t9sTSr-JYSs", animationKey: "hamstring-curl-machine" },
  "Abductor Machine": { youtubeEmbedUrl: "https://www.youtube.com/embed/OjI5OpV6IWA", animationKey: "abductor-machine" },
  "Treadmill Incline Walk": { youtubeEmbedUrl: "https://www.youtube.com/embed/NAsObfFJXvE", animationKey: "treadmill-incline-walk" },
  "Brisk Walk": { youtubeEmbedUrl: "https://www.youtube.com/embed/wQrV75N2BrI", animationKey: "treadmill-incline-walk" },
  "Cable Tricep Pushdown": { youtubeEmbedUrl: "https://www.youtube.com/embed/2-LAMcpzODU", animationKey: "cable-tricep-pushdown" },
  "Dumbbell Bicep Curl": { youtubeEmbedUrl: "https://www.youtube.com/embed/ykJmrZ5v0Oo", animationKey: "dumbbell-bicep-curl" },
};

// Singular / generator-name aliases that should resolve to a mapped entry.
const demoAliases: Record<string, string> = {
  "Bodyweight Squat": "Bodyweight Squats",
  "Glute Bridge": "Glute Bridges",
  "Reverse Lunge": "Reverse Lunges",
  "Wall Push-Up": "Wall Push-ups",
  "Resistance Band Row": "Resistance Band Rows",
  "Standing Calf Raise": "Standing Calf Raises",
  "Step-Up": "Step-ups",
  "Side-Lying Leg Raise": "Side-Lying Leg Raises",
  "Bicycle Crunch": "Bicycle Crunches",
  "Cable Kickback": "Cable Kickbacks",
  "Lat Pulldown": "Lat Pulldown Machine",
  "Leg Press": "Leg Press Machine",
  "Incline Treadmill Walk": "Treadmill Incline Walk",
  // Movements with no obvious keyword are mapped to the closest demo.
  "Donkey Kick": "Cable Kickbacks",
  "Bench Dips": "Cable Tricep Pushdown",
  "Dead Bug": "Plank",
  "Cable Woodchop": "Bicycle Crunches",
  "Cable Pallof Press": "Plank",
};

// Ordered keyword rules: the FIRST match wins, so list the most specific
// movements before the more generic ones (e.g. "leg press" before "press",
// "glute bridge" before "hip"). Each rule points to a name in workoutDemoMap.
// This is what keeps an exercise like "Walking Lunges" mapped to a lunge
// video instead of being lumped into a generic squat.
const keywordRules: ReadonlyArray<readonly [RegExp, string]> = [
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

export const slugify = (value?: string): string =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// Resolve the canonical demo entry for an exercise name. Tries an exact match,
// then an alias, then ordered keyword rules, before falling back to a generic
// (no-video) entry so the animation/placeholder can take over.
export const getWorkoutDemo = (name?: string): WorkoutDemoEntry => {
  if (!name) return { youtubeEmbedUrl: "", animationKey: "generic" };

  const exact = workoutDemoMap[demoAliases[name] || name];
  if (exact) return exact;

  const lower = name.toLowerCase();
  for (const [pattern, canonical] of keywordRules) {
    if (pattern.test(lower) && workoutDemoMap[canonical]) {
      return workoutDemoMap[canonical];
    }
  }

  return { youtubeEmbedUrl: "", animationKey: slugify(name) || "generic" };
};

// Attach demo data to an exercise without overwriting fields it already has.
export function attachWorkoutDemo<T extends { name?: string; youtubeEmbedUrl?: string; animationKey?: string }>(
  exercise: T
): T & { youtubeEmbedUrl: string; animationKey: string } {
  const demo = getWorkoutDemo(exercise.name);
  return {
    ...exercise,
    youtubeEmbedUrl: getYouTubeEmbedUrl(exercise.youtubeEmbedUrl) || demo.youtubeEmbedUrl || "",
    animationKey: exercise.animationKey || demo.animationKey || "generic",
  };
}
