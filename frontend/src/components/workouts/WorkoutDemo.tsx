"use client";

import { PlayCircle } from "lucide-react";
import { getYouTubeEmbedUrl } from "@/lib/youtube";
import { WorkoutAnimation } from "@/components/workouts/WorkoutAnimation";

type WorkoutDemoProps = {
  exerciseName: string;
  youtubeEmbedUrl?: string;
  animationKey?: string;
  locationType?: "Gym" | "Home" | "Both";
};

/**
 * Renders the workout sample guide for an exercise.
 *
 * Priority:
 *   1. YouTube embed (responsive, no autoplay) when a valid embed URL exists.
 *   2. Simple CSS/SVG animation fallback when there is an animation key.
 *   3. A clean "not available yet" message when neither is available.
 *
 * It never renders an empty iframe.
 */
export function WorkoutDemo({ exerciseName, youtubeEmbedUrl, animationKey, locationType }: WorkoutDemoProps) {
  const embedUrl = getYouTubeEmbedUrl(youtubeEmbedUrl);

  if (embedUrl) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <div className="aspect-video w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
          <iframe
            className="h-full w-full"
            src={embedUrl}
            title={`${exerciseName} workout demo video`}
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  if (animationKey) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <WorkoutAnimation exerciseName={exerciseName} locationType={locationType} animationKey={animationKey} />
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[220px] w-full max-w-3xl flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-100 p-6 text-center text-slate-700">
      <PlayCircle className="mb-3 h-8 w-8 text-slate-400" />
      <p className="text-sm font-semibold">Workout demo is not available yet.</p>
    </div>
  );
}
