"use client";

import { getYouTubeEmbedUrl } from "@/lib/youtube";

type WorkoutDemoProps = {
  exerciseName: string;
  youtubeEmbedUrl?: string;
};

/**
 * Renders the workout demo as a YouTube tutorial video only. If no valid embed
 * URL is available, shows a clean message — never an animation or broken iframe.
 */
export function WorkoutDemo({ exerciseName, youtubeEmbedUrl }: WorkoutDemoProps) {
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

  return (
    <div className="mx-auto flex min-h-[220px] w-full max-w-3xl items-center justify-center rounded-xl border border-slate-200 bg-slate-100 p-4 text-center text-slate-700">
      Workout demo video is not available yet. Please add a valid YouTube tutorial link for this exercise.
    </div>
  );
}
