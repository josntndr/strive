import { getWorkoutDemo } from "@/lib/workoutDemoMap";

export type EquipmentKey = "none" | "dumbbells" | "bands";

export type WorkoutAlternative = {
  name: string;
  locationType: "Home" | "Gym" | "Both";
  equipment: string;
  reason: string;
  instruction: string;
  youtubeEmbedUrl: string;
  animationKey: string;
};

export const EQUIPMENT_OPTIONS: { key: EquipmentKey; label: string }[] = [
  { key: "none", label: "No equipment" },
  { key: "dumbbells", label: "Dumbbells" },
  { key: "bands", label: "Resistance bands" },
];

type RawAlt = {
  name: string;
  locationType?: "Home" | "Gym" | "Both";
  equipment: string;
  reason: string;
  instruction: string;
  youtubeEmbedUrl?: string;
  animationKey?: string;
};

// Fill any missing demo fields from the shared demo resolver so "View demo"
// always has a video (or a sensible animation fallback).
const normalize = (alt: RawAlt): WorkoutAlternative => {
  const demo = getWorkoutDemo(alt.name);
  return {
    name: alt.name,
    locationType: alt.locationType || "Home",
    equipment: alt.equipment,
    reason: alt.reason,
    instruction: alt.instruction,
    youtubeEmbedUrl: alt.youtubeEmbedUrl || demo.youtubeEmbedUrl || "",
    animationKey: alt.animationKey || demo.animationKey || "generic",
  };
};

// Hand-picked alternatives for specific (mostly gym) exercises.
export const alternativeWorkoutMap: Record<string, RawAlt[]> = {
  "Leg Press Machine": [
    { name: "Bodyweight Squats", locationType: "Home", equipment: "Bodyweight", reason: "Good home alternative for training legs and glutes.", instruction: "Keep your chest up and lower your hips with control.", youtubeEmbedUrl: "https://www.youtube.com/embed/P-yaD24bUE8", animationKey: "bodyweight-squats" },
    { name: "Step-ups", locationType: "Home", equipment: "Chair, bench, or step", reason: "Good single-leg alternative for legs and glutes.", instruction: "Step onto a stable surface and push through your heel.", youtubeEmbedUrl: "https://www.youtube.com/embed/dQqApCGd5Ss", animationKey: "step-ups" },
    { name: "Reverse Lunges", locationType: "Home", equipment: "Bodyweight", reason: "Single-leg move that builds legs and balance at home.", instruction: "Step back and lower your back knee with control." },
  ],
  "Leg Extension Machine": [
    { name: "Step-ups", locationType: "Home", equipment: "Chair, bench, or step", reason: "Trains the quads with a single-leg pattern at home.", instruction: "Step up driving through your heel, then lower slowly." },
    { name: "Bodyweight Squats", locationType: "Home", equipment: "Bodyweight", reason: "Builds the quads and glutes with no machine.", instruction: "Sit your hips back, keep your chest up, and stand tall." },
  ],
  "Hamstring Curl Machine": [
    { name: "Dumbbell Romanian Deadlift", locationType: "Home", equipment: "Dumbbells", reason: "Targets the hamstrings and glutes through a hip hinge.", instruction: "Hinge at the hips with soft knees and a flat back." },
    { name: "Glute Bridges", locationType: "Home", equipment: "Bodyweight or mat", reason: "Works the hamstrings and glutes from the floor.", instruction: "Drive through your heels and squeeze at the top." },
  ],
  "Abductor Machine": [
    { name: "Side-Lying Leg Raises", locationType: "Home", equipment: "Bodyweight or mat", reason: "Targets the outer hips and glutes without a machine.", instruction: "Lie on your side and lift the top leg with control." },
    { name: "Band Lateral Walks", locationType: "Home", equipment: "Resistance band", reason: "Strengthens the hips and glutes with band tension.", instruction: "Loop a band around your legs and step sideways." },
  ],
  "Cable Tricep Pushdown": [
    { name: "Chair Dips", locationType: "Home", equipment: "Sturdy chair or bench", reason: "Trains the triceps using your bodyweight.", instruction: "Lower your hips by bending the elbows, then press back up." },
    { name: "Close-Grip Wall Push-ups", locationType: "Home", equipment: "Wall", reason: "Beginner-friendly triceps work at home.", instruction: "Place your hands close together on the wall and press." },
  ],
  "Dumbbell Bicep Curl": [
    { name: "Resistance Band Curls", locationType: "Home", equipment: "Resistance band", reason: "Curls the biceps using band resistance.", instruction: "Stand on the band and curl your hands up with control." },
    { name: "Water Bottle Curls", locationType: "Home", equipment: "Water bottles or household weights", reason: "No-equipment biceps option using household items.", instruction: "Hold full bottles and curl slowly, elbows tucked." },
  ],
  "Hip Thrust Machine": [
    { name: "Glute Bridges", locationType: "Home", equipment: "Bodyweight or mat", reason: "Good home alternative for glute activation.", instruction: "Push through your heels and squeeze your glutes at the top.", youtubeEmbedUrl: "https://www.youtube.com/embed/OUgsJ8-Vi0E", animationKey: "glute-bridges" },
    { name: "Bodyweight Hip Thrust", locationType: "Home", equipment: "Chair, couch, or bench", reason: "Similar movement pattern to a hip thrust machine.", instruction: "Support your upper back and lift your hips with control.", youtubeEmbedUrl: "https://www.youtube.com/embed/pF17m_CXfL0", animationKey: "bodyweight-hip-thrust" },
  ],
  "Cable Kickbacks": [
    { name: "Side-Lying Leg Raises", locationType: "Home", equipment: "Bodyweight or mat", reason: "Good alternative for glute and hip work without cables.", instruction: "Lie on your side and lift your top leg with control.", youtubeEmbedUrl: "https://www.youtube.com/embed/jgh6sGwtTwk", animationKey: "side-lying-leg-raises" },
    { name: "Glute Bridges", locationType: "Home", equipment: "Bodyweight or mat", reason: "Simple glute-focused movement for home workouts.", instruction: "Lift your hips and squeeze your glutes at the top.", youtubeEmbedUrl: "https://www.youtube.com/embed/OUgsJ8-Vi0E", animationKey: "glute-bridges" },
  ],
  "Lat Pulldown Machine": [
    { name: "Resistance Band Rows", locationType: "Home", equipment: "Resistance band", reason: "Good back exercise alternative for home workouts.", instruction: "Pull the band toward your body and squeeze your back.", youtubeEmbedUrl: "https://www.youtube.com/embed/xQNrFHEMhI4", animationKey: "resistance-band-rows" },
    { name: "Dumbbell Rows", locationType: "Home", equipment: "Dumbbells", reason: "Good alternative for strengthening the back.", instruction: "Pull the dumbbell toward your waist while keeping your back stable.", youtubeEmbedUrl: "", animationKey: "dumbbell-rows" },
  ],
  "Chest Press Machine": [
    { name: "Wall Push-ups", locationType: "Home", equipment: "Wall", reason: "Beginner-friendly chest exercise at home.", instruction: "Place your hands on the wall and lower your chest with control.", youtubeEmbedUrl: "https://www.youtube.com/embed/QpMTk21EmaM", animationKey: "wall-push-ups" },
    { name: "Push-ups", locationType: "Home", equipment: "Bodyweight", reason: "Good bodyweight alternative for chest and arms.", instruction: "Keep your body straight and lower your chest toward the floor.", youtubeEmbedUrl: "", animationKey: "push-ups" },
  ],
  "Shoulder Press Machine": [
    { name: "Dumbbell Shoulder Press", locationType: "Home", equipment: "Dumbbells", reason: "Good home alternative for shoulders.", instruction: "Press the dumbbells overhead with control.", youtubeEmbedUrl: "", animationKey: "dumbbell-shoulder-press" },
    { name: "Pike Push-ups", locationType: "Home", equipment: "Bodyweight", reason: "Bodyweight alternative for shoulder strength.", instruction: "Keep hips high and bend elbows to lower your head.", youtubeEmbedUrl: "", animationKey: "pike-push-ups" },
  ],

  // Home exercises — easier and harder variations.
  "Bodyweight Squats": [
    { name: "Wall Squats", locationType: "Home", equipment: "Wall", reason: "Easier variation that builds endurance and form.", instruction: "Slide down a wall and hold, or do slow controlled reps." },
    { name: "Jump Squats", locationType: "Home", equipment: "Bodyweight", reason: "Harder, explosive variation once squats feel easy.", instruction: "Squat down and jump up, landing softly with bent knees." },
  ],
  "Glute Bridges": [
    { name: "Single-Leg Glute Bridges", locationType: "Home", equipment: "Bodyweight or mat", reason: "Harder variation that works one side at a time.", instruction: "Extend one leg and bridge up with the other." },
    { name: "Bodyweight Hip Thrust", locationType: "Home", equipment: "Chair, couch, or bench", reason: "Bigger range of motion for the glutes.", instruction: "Rest your upper back on a bench and drive your hips up." },
  ],
  "Reverse Lunges": [
    { name: "Static Lunges", locationType: "Home", equipment: "Bodyweight", reason: "Easier lunge with no stepping for better balance.", instruction: "Hold a split stance and lower straight down." },
    { name: "Step-ups", locationType: "Home", equipment: "Chair, bench, or step", reason: "Single-leg alternative that is easy to scale.", instruction: "Step up and down, driving through your heel." },
  ],
  "Wall Push-ups": [
    { name: "Incline Push-ups", locationType: "Home", equipment: "Table, counter, or bench", reason: "A slightly harder progression from wall push-ups.", instruction: "Hands on a raised surface, lower your chest with control." },
    { name: "Knee Push-ups", locationType: "Home", equipment: "Bodyweight or mat", reason: "A harder step toward full push-ups.", instruction: "Push up from your knees keeping a straight line." },
  ],
  "Plank": [
    { name: "Knee Plank", locationType: "Home", equipment: "Bodyweight or mat", reason: "Easier plank for building core endurance.", instruction: "Hold the plank from your knees with a straight back." },
    { name: "Shoulder Taps", locationType: "Home", equipment: "Bodyweight or mat", reason: "Adds an anti-rotation challenge to the plank.", instruction: "In a plank, tap each shoulder without rocking your hips." },
  ],
  "Mountain Climbers": [
    { name: "Slow Mountain Climbers", locationType: "Home", equipment: "Bodyweight or mat", reason: "Easier, controlled version for beginners.", instruction: "Drive one knee in at a time at a slow, steady pace." },
    { name: "High Knees", locationType: "Home", equipment: "Bodyweight", reason: "Standing cardio alternative for the core and legs.", instruction: "Jog in place bringing your knees up high." },
  ],
};

// Singular generator names that should resolve to a mapped entry.
const mapAliases: Record<string, string> = {
  "Leg Press": "Leg Press Machine",
  "Lat Pulldown": "Lat Pulldown Machine",
  "Seated Row Machine": "Lat Pulldown Machine",
  "Cable Kickback": "Cable Kickbacks",
  // Singular generator names for home exercises.
  "Bodyweight Squat": "Bodyweight Squats",
  "Glute Bridge": "Glute Bridges",
  "Reverse Lunge": "Reverse Lunges",
  "Wall Push-Up": "Wall Push-ups",
  "Wall Push Up": "Wall Push-ups",
  "Mountain Climber": "Mountain Climbers",
};

// Category-tagged equipment pools for building home alternatives.
type Category = "legs" | "glutes" | "chest" | "back" | "shoulders" | "arms" | "core" | "cardio" | "calves";

type PoolItem = RawAlt & { categories: Category[] };

const equipmentPools: Record<EquipmentKey, PoolItem[]> = {
  none: [
    { name: "Bodyweight Squats", equipment: "Bodyweight", reason: "Builds legs and glutes with no equipment.", instruction: "Sit your hips back and keep your chest up.", categories: ["legs"] },
    { name: "Glute Bridges", equipment: "Bodyweight or mat", reason: "Activates the glutes from the floor.", instruction: "Drive through your heels and squeeze at the top.", categories: ["glutes"] },
    { name: "Reverse Lunges", equipment: "Bodyweight", reason: "Single-leg strength and balance at home.", instruction: "Step back and lower your back knee with control.", categories: ["legs", "glutes"] },
    { name: "Wall Push-ups", equipment: "Wall", reason: "Beginner-friendly pressing for chest and arms.", instruction: "Lower your chest to the wall and press back.", categories: ["chest", "shoulders"] },
    { name: "Plank", equipment: "Bodyweight or mat", reason: "Core and stability with no equipment.", instruction: "Hold a straight line from head to heels.", categories: ["core"] },
    { name: "Mountain Climbers", equipment: "Bodyweight", reason: "Core and light cardio in one move.", instruction: "Drive your knees in one at a time at a steady pace.", categories: ["core", "cardio"] },
    { name: "Standing Calf Raises", equipment: "Bodyweight", reason: "Trains the calves anywhere.", instruction: "Rise onto your toes and lower slowly.", categories: ["calves", "legs"] },
    { name: "Bicycle Crunches", equipment: "Bodyweight or mat", reason: "Targets the abs and obliques.", instruction: "Bring opposite elbow to knee in a slow pedal.", categories: ["core"] },
    { name: "Jumping Jacks", equipment: "Bodyweight", reason: "Simple home cardio to raise the heart rate.", instruction: "Jump feet out and arms up, then back in.", categories: ["cardio"] },
  ],
  dumbbells: [
    { name: "Dumbbell Romanian Deadlift", equipment: "Dumbbells", reason: "Strengthens hamstrings and glutes.", instruction: "Hinge at the hips with a soft knee bend.", categories: ["legs", "glutes"] },
    { name: "Dumbbell Squats", equipment: "Dumbbells", reason: "Adds load to the squat for legs and glutes.", instruction: "Hold the dumbbells and squat with control.", categories: ["legs"] },
    { name: "Dumbbell Shoulder Press", equipment: "Dumbbells", reason: "Builds shoulder strength at home.", instruction: "Press the dumbbells overhead without arching your back.", categories: ["shoulders"] },
    { name: "Dumbbell Rows", equipment: "Dumbbells", reason: "Strengthens the back and improves posture.", instruction: "Pull the dumbbell to your waist, keeping your back flat.", categories: ["back"] },
    { name: "Dumbbell Bicep Curl", equipment: "Dumbbells", reason: "Targets the biceps.", instruction: "Curl with control and keep your elbows tucked.", categories: ["arms"] },
    { name: "Weighted Glute Bridge", equipment: "Dumbbell", reason: "Adds resistance to glute bridges.", instruction: "Rest a dumbbell on your hips and bridge up.", categories: ["glutes"] },
  ],
  bands: [
    { name: "Resistance Band Rows", equipment: "Resistance band", reason: "Trains the back without a machine.", instruction: "Pull the band to your ribs and squeeze your back.", categories: ["back"] },
    { name: "Band Glute Kickbacks", equipment: "Resistance band", reason: "Isolates the glutes with band tension.", instruction: "Kick one leg back against the band with control.", categories: ["glutes"] },
    { name: "Band Squats", equipment: "Resistance band", reason: "Adds resistance to the squat pattern.", instruction: "Stand on the band and squat against the tension.", categories: ["legs"] },
    { name: "Band Pull Aparts", equipment: "Resistance band", reason: "Great for posture and upper back.", instruction: "Pull the band apart at chest height, squeezing your shoulder blades.", categories: ["back", "shoulders"] },
    { name: "Band Lateral Walks", equipment: "Resistance band", reason: "Strengthens the hips and glutes.", instruction: "Place the band around your legs and step sideways.", categories: ["glutes", "legs"] },
  ],
};

const categorize = (name: string, targetMuscle?: string): Category => {
  const t = `${name} ${targetMuscle || ""}`.toLowerCase();
  if (/calf|calves/.test(t)) return "calves";
  if (/glute|hip thrust|bridge|kickback|abductor/.test(t)) return "glutes";
  if (/squat|lunge|leg press|leg extension|step|quad|hamstring|leg curl|deadlift/.test(t)) return "legs";
  if (/lat|row|pulldown|\bpull\b|back/.test(t)) return "back";
  if (/shoulder|overhead|pike/.test(t)) return "shoulders";
  if (/chest|bench|push-?up|chest press/.test(t)) return "chest";
  if (/bicep|tricep|curl|\barm\b|\bdip\b/.test(t)) return "arms";
  if (/plank|crunch|core|climber|abs|bicycle|woodchop|pallof/.test(t)) return "core";
  if (/jump|cardio|treadmill|walk|march|run|bike|jack/.test(t)) return "cardio";
  return "legs";
};

type ExerciseLike = {
  name: string;
  targetMuscle?: string;
  locationType?: "Gym" | "Home" | "Both";
  alternativeExercise?: { name?: string; equipment?: string; locationType?: "Gym" | "Home" | "Both"; summary?: string; youtubeEmbedUrl?: string };
};

/**
 * Build a list of alternative exercises for the given exercise, biased toward
 * the user's selected equipment. Combines hand-picked mappings, the plan's own
 * cross-location alternative, and category-matched equipment-pool moves.
 */
export function getAlternatives(exercise: ExerciseLike, equipment: EquipmentKey = "none"): WorkoutAlternative[] {
  const out: WorkoutAlternative[] = [];
  const seen = new Set<string>();
  const currentName = exercise.name.toLowerCase();

  const push = (alt: RawAlt) => {
    const key = alt.name.toLowerCase();
    if (key === currentName || seen.has(key)) return;
    seen.add(key);
    out.push(normalize(alt));
  };

  // 1. Hand-picked alternatives for this specific exercise.
  const mapped = alternativeWorkoutMap[exercise.name] || alternativeWorkoutMap[mapAliases[exercise.name] || ""];
  if (mapped) mapped.forEach(push);

  // 2. The plan's own cross-location alternative, if present.
  const alt = exercise.alternativeExercise;
  if (alt?.name) {
    push({
      name: alt.name,
      locationType: alt.locationType || "Home",
      equipment: alt.equipment || "Bodyweight",
      reason: alt.summary || "Keeps the same movement pattern in a different setting.",
      instruction: alt.summary || "Move slowly with controlled form.",
      youtubeEmbedUrl: alt.youtubeEmbedUrl,
    });
  }

  // 3. Equipment-pool moves that match the muscle group.
  const category = categorize(exercise.name, exercise.targetMuscle);
  const pool = equipmentPools[equipment] || equipmentPools.none;
  const matches = pool.filter((item) => item.categories.includes(category));
  (matches.length ? matches : pool).forEach(push);

  return out.slice(0, 4);
}
