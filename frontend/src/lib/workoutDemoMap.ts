import { getYouTubeEmbedUrl } from "@/lib/youtube";
import { normalizeExerciseName } from "@/lib/normalizeExerciseName";

// Only manually reviewed videos belong here. Keyword-matched or inherited
// YouTube URLs are intentionally not trusted for production playback.
export const workoutDemoMap: Record<string, string> = {
};

// Ordered keyword fallback for names not directly in the map (most specific
// first). Each rule points to a standardized name that exists in the map, so a
// niche variant still resolves to a relevant, correct tutorial video.
const keywordRules: ReadonlyArray<readonly [RegExp, string]> = [];

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

// Resolve the best embed URL for an exercise. Existing URLs are accepted only
// when they match the reviewed catalog entry for that exercise.
export const resolveWorkoutVideo = (name?: string, existingUrl?: string): string =>
  getYouTubeEmbedUrl(existingUrl) && getYouTubeEmbedUrl(existingUrl) === getWorkoutVideo(name)
    ? getYouTubeEmbedUrl(existingUrl)
    : getWorkoutVideo(name);
