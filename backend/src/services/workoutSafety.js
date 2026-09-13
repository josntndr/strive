const {
  REVIEW_DATE,
  defaultSafetyNotes,
  evidenceSources,
  exerciseAliases,
  exerciseDatabase,
} = require("../catalog/exerciseDatabase");

const normalizeExerciseName = (name) => {
  const key = String(name || "").trim().toLowerCase();
  return exerciseAliases[key] || String(name || "").trim();
};

const getExerciseCatalogEntry = (name) => {
  const canonical = normalizeExerciseName(name);
  return exerciseDatabase[canonical] || null;
};

const getVerifiedExerciseVideoUrl = (name) => {
  const entry = getExerciseCatalogEntry(name);
  if (!entry || entry.video.status !== "verified") return "";
  return entry.video.url || "";
};

const getPrescriptionType = (exercise) => {
  if (exercise.prescriptionType) return exercise.prescriptionType;
  const reps = String(exercise.reps || "").toLowerCase();
  if (/minute|min|second|sec|\d+\s*s\b|as needed|interval/.test(reps)) return "duration";
  return "reps";
};

const toSeconds = (rest) => {
  const value = String(rest || "").toLowerCase();
  if (value.includes("as needed")) return 0;
  const match = value.match(/(\d+)/);
  if (!match) return 0;
  const amount = Number(match[1]);
  if (value.includes("min")) return amount * 60;
  return amount;
};

const estimateExerciseMinutes = (exercise) => {
  const sets = Math.max(Number(exercise.sets) || 1, 1);
  const reps = String(exercise.reps || "").toLowerCase();
  const restSeconds = toSeconds(exercise.rest) * Math.max(sets - 1, 0);

  if (reps.includes("minute") || /\bmin\b/.test(reps)) {
    const match = reps.match(/(\d+)(?:\s*-\s*(\d+))?/);
    const minutes = match ? Number(match[2] || match[1]) : 10;
    return Math.ceil(minutes + restSeconds / 60);
  }

  if (reps.includes("second") || /\bsec\b/.test(reps) || /\d+\s*s\b/.test(reps)) {
    const match = reps.match(/(\d+)(?:\s*-\s*(\d+))?/);
    const seconds = match ? Number(match[2] || match[1]) : 30;
    return Math.ceil((sets * seconds + restSeconds) / 60);
  }

  return Math.ceil((sets * 50 + restSeconds) / 60);
};

const attachExerciseMetadata = (exercise, options = {}) => {
  const canonicalName = normalizeExerciseName(exercise.name);
  const entry = getExerciseCatalogEntry(canonicalName);
  const difficulty = options.difficulty || exercise.difficulty || entry?.difficulty || "Beginner";
  const prescriptionType = getPrescriptionType({ ...exercise, prescriptionType: entry?.prescriptionType });

  return {
    ...exercise,
    name: canonicalName,
    sets: Number(exercise.sets) || entry?.defaultSets || 3,
    reps: exercise.reps || entry?.defaultReps || "8-12 reps",
    rest: exercise.rest || entry?.defaultRest || "60 seconds",
    equipment: exercise.equipment || entry?.equipment?.[0] || "Bodyweight",
    instruction: exercise.instruction || exercise.instructions || entry?.formCue || "Move slowly with controlled form.",
    instructions: exercise.instructions || exercise.instruction || entry?.formCue || "Move slowly with controlled form.",
    steps: exercise.steps?.length ? exercise.steps : entry?.instructions || [],
    safetyTips: [...new Set([...(exercise.safetyTips || []), ...(entry?.safetyNotes || defaultSafetyNotes)])],
    commonMistakes: exercise.commonMistakes?.length ? exercise.commonMistakes : entry?.commonMistakes || [],
    difficulty,
    prescriptionType,
    targetUnitLabel: prescriptionType === "duration" ? "Duration" : "Reps",
    targetMuscle:
      exercise.targetMuscle ||
      entry?.primaryMuscles?.concat(entry.secondaryMuscles || []).slice(0, 3).join(", ") ||
      "General strength",
    movementPattern: entry?.movementPattern || "General fitness",
    primaryMuscles: entry?.primaryMuscles || [],
    secondaryMuscles: entry?.secondaryMuscles || [],
    contraindications: entry?.contraindications || [],
    evidenceSources: entry?.evidenceSources || evidenceSources,
    reviewDate: entry?.reviewedOn || REVIEW_DATE,
    videoStatus: entry?.video?.status || "unavailable",
    videoSourceName: entry?.video?.sourceName || "Unavailable - needs manual video review before production use",
    videoLastValidated: entry?.video?.lastValidated || "",
    youtubeEmbedUrl: getVerifiedExerciseVideoUrl(canonicalName),
    estimatedMinutes: estimateExerciseMinutes({ ...exercise, prescriptionType }),
  };
};

const normalizeWorkoutLocation = (location) => {
  const value = String(location || "").toLowerCase();
  if (value.includes("home") && value.includes("gym")) return "both";
  if (value.includes("both")) return "both";
  if (value.includes("home")) return "home";
  return "gym";
};

const isLocationCompatible = (exercise, workoutLocation) => {
  const location = normalizeWorkoutLocation(workoutLocation);
  if (location === "both") return true;
  const exerciseLocation = String(exercise.locationType || "").toLowerCase();
  return exerciseLocation === location || exerciseLocation === "both";
};

const validateExercise = (exercise, workoutLocation = "Both") => {
  const issues = [];
  const normalized = attachExerciseMetadata(exercise);

  if (!normalized.name) issues.push("Exercise is missing a name.");
  if (!Number.isFinite(Number(normalized.sets)) || Number(normalized.sets) < 1 || Number(normalized.sets) > 5) {
    issues.push(`${normalized.name} has an unsafe or unrealistic set count.`);
  }
  if (!normalized.reps) issues.push(`${normalized.name} is missing repetitions or duration.`);
  if (!normalized.rest) issues.push(`${normalized.name} is missing rest guidance.`);
  if (!isLocationCompatible(normalized, workoutLocation)) {
    issues.push(`${normalized.name} does not match the selected workout location.`);
  }
  if (!normalized.youtubeEmbedUrl) {
    issues.push(`${normalized.name} is missing a YouTube tutorial video.`);
  }
  if (normalized.youtubeEmbedUrl && normalized.videoStatus !== "verified") {
    issues.push(`${normalized.name} has an unverified video URL.`);
  }
  if (/each (leg|side)/i.test(normalized.reps) === false && /single|side-lying|lunge|kickback|step-up/i.test(normalized.name)) {
    issues.push(`${normalized.name} should state per-side repetitions.`);
  }
  if (normalized.prescriptionType === "duration" && /per set/i.test(normalized.reps)) {
    issues.push(`${normalized.name} mixes duration with per-set wording.`);
  }

  return { exercise: normalized, issues };
};

const validateWorkoutPlan = (plan) => {
  const issues = [];
  const days = plan.days || plan.planData || [];
  const location = plan.workoutLocation || "Both";

  if (!days.length) issues.push("Workout plan has no training days.");

  for (const day of days) {
    const seen = new Set();
    if (!day.exercises?.length) issues.push(`${day.day || "Workout day"} has no exercises.`);
    for (const rawExercise of day.exercises || []) {
      const { exercise, issues: exerciseIssues } = validateExercise(rawExercise, day.workoutLocation || location);
      exerciseIssues.forEach((issue) => issues.push(issue));
      const duplicateKey = exercise.name.toLowerCase();
      if (seen.has(duplicateKey)) issues.push(`${day.day || "Workout day"} contains duplicate exercise ${exercise.name}.`);
      seen.add(duplicateKey);
    }
  }

  return { valid: issues.length === 0, issues };
};

module.exports = {
  REVIEW_DATE,
  evidenceSources,
  exerciseDatabase,
  normalizeExerciseName,
  getExerciseCatalogEntry,
  getVerifiedExerciseVideoUrl,
  getPrescriptionType,
  estimateExerciseMinutes,
  attachExerciseMetadata,
  validateExercise,
  validateWorkoutPlan,
};
