"use client";

import { Activity, Building2, Dumbbell, Footprints, Home } from "lucide-react";

type WorkoutAnimationProps = {
  exerciseName: string;
  locationType?: string;
  animationKey?: string;
  className?: string;
};

// Render a category icon for the placeholder based on the movement.
function renderMovementIcon(exerciseName: string, animationKey?: string) {
  const value = `${animationKey || ""} ${exerciseName || ""}`.toLowerCase();
  const className = "h-9 w-9 text-blue-600";
  if (/(walk|treadmill|jump|jack|cardio|march|bike|run|step\s*touch)/.test(value)) return <Footprints className={className} />;
  if (/(plank|crunch|core|climber|bicycle|woodchop|dead\s*bug)/.test(value)) return <Activity className={className} />;
  return <Dumbbell className={className} />;
}

/**
 * Shown in the Workout Demo section when no video is available. A clean,
 * intentional placeholder (category icon + exercise name) rather than a
 * procedural figure, so the area never looks empty or unpolished.
 */
export function WorkoutAnimation({ exerciseName, locationType, animationKey, className = "" }: WorkoutAnimationProps) {
  const location = locationType || "Both";
  const isHome = location.toLowerCase().includes("home") && !location.toLowerCase().includes("gym");

  return (
    <div className={`overflow-hidden rounded-xl border border-slate-200 bg-white ${className}`}>
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3">
        <span className="text-sm font-semibold text-slate-900">Movement guide</span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
          {isHome ? <Home className="h-3.5 w-3.5 text-blue-600" /> : <Building2 className="h-3.5 w-3.5 text-blue-600" />}
          {location}
        </span>
      </div>

      <div className="flex flex-col items-center justify-center gap-4 px-6 py-12">
        <span className="relative flex h-20 w-20 items-center justify-center">
          <span className="absolute inset-0 rounded-full bg-blue-50 animate-pulse" />
          <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 ring-1 ring-blue-100">
            {renderMovementIcon(exerciseName, animationKey)}
          </span>
        </span>
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-900">{exerciseName}</p>
          <p className="mt-1 text-xs text-slate-500">Video demo coming soon. Follow the step-by-step instructions above.</p>
        </div>
      </div>
    </div>
  );
}
