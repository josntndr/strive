"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Modal } from "@/components/Modal";
import type { LucideIcon } from "lucide-react";
import { Dumbbell, ChevronRight, Info, Clock, Target, CheckCircle2, Loader2, Home, Building2, ShieldAlert, TriangleAlert, Repeat2, PlayCircle, RefreshCw, Flame, Zap, Trophy } from "lucide-react";
import { api, clearAuth, getToken, isUnauthorizedError } from "@/lib/api";
import { toast } from "react-hot-toast";
import { resolveWorkoutVideo } from "@/lib/workoutDemoMap";
import { normalizeExerciseName } from "@/lib/normalizeExerciseName";
import { WorkoutDemo } from "@/components/workouts/WorkoutDemo";
import { AIChat } from "@/components/ai/AIChat";
import { getAlternatives, EQUIPMENT_OPTIONS, type EquipmentKey, type WorkoutAlternative } from "@/lib/alternativeWorkoutMap";

type Exercise = {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  equipment: string;
  locationType?: "Gym" | "Home" | "Both";
  targetMuscle?: string;
  difficulty?: string;
  instruction?: string;
  instructions?: string;
  steps?: string[];
  machineSetupTips?: string[];
  safetyTips?: string[];
  commonMistakes?: string[];
  completed?: boolean;
  notes?: string;
  visualDemo?: string;
  youtubeEmbedUrl?: string;
  alternativeExercise?: {
    name?: string;
    equipment?: string;
    locationType?: "Gym" | "Home" | "Both";
    summary?: string;
    youtubeEmbedUrl?: string;
  };
  alternativeExercises?: WorkoutAlternative[];
};

type WorkoutDay = {
  day: string;
  focus: string;
  workoutLocation?: string;
  exercises: Exercise[];
  completed?: boolean;
};

type WorkoutPlan = {
  _id?: string;
  isActive?: boolean;
  workoutLocation?: string;
  days?: WorkoutDay[];
  planData?: WorkoutDay[];
};

/** Pick a colored left-border stripe based on the muscle group */
function muscleBorderColor(muscle?: string): string {
  const m = (muscle || "").toLowerCase();
  if (m.includes("core") || m.includes("abs") || m.includes("oblique")) return "border-l-blue-500";
  if (m.includes("chest") || m.includes("pec")) return "border-l-rose-400";
  if (m.includes("back") || m.includes("lat") || m.includes("rhom")) return "border-l-violet-400";
  if (m.includes("leg") || m.includes("quad") || m.includes("hamstring") || m.includes("glut")) return "border-l-amber-400";
  if (m.includes("shoulder") || m.includes("delt")) return "border-l-cyan-400";
  if (m.includes("arm") || m.includes("bicep") || m.includes("tricep")) return "border-l-pink-400";
  if (m.includes("cardio") || m.includes("cardiovascular") || m.includes("treadmill")) return "border-l-orange-400";
  return "border-l-blue-400";
}

function enhanceExercise(exercise: Exercise): Exercise {
  const name = normalizeExerciseName(exercise.name);
  const youtubeEmbedUrl = resolveWorkoutVideo(name, exercise.youtubeEmbedUrl);

  const alternative = exercise.alternativeExercise;
  const alternativeUrl = alternative
    ? resolveWorkoutVideo(normalizeExerciseName(alternative.name || ""), alternative.youtubeEmbedUrl)
    : "";

  return {
    ...exercise,
    name,
    youtubeEmbedUrl,
    alternativeExercise: alternative
      ? { ...alternative, name: alternative.name ? normalizeExerciseName(alternative.name) : alternative.name, youtubeEmbedUrl: alternativeUrl }
      : alternative,
  };
}

function enhanceWorkoutPlan(plan: WorkoutPlan | null): WorkoutPlan | null {
  if (!plan) return null;

  const enhanceDay = (day: WorkoutDay): WorkoutDay => ({
    ...day,
    exercises: (day.exercises || []).map(enhanceExercise),
  });

  return {
    ...plan,
    days: plan.days?.map(enhanceDay),
    planData: plan.planData?.map(enhanceDay),
  };
}

/* ─── Shimmer Skeleton ──────────────────────────────────────────────────────── */
function WorkoutSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {[0, 1].map((i) => (
        <div key={i} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          {/* card header skeleton */}
          <div className="p-6 flex items-center gap-4">
            <div className="skeleton w-12 h-12 rounded-2xl" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-5 w-40 rounded" />
              <div className="skeleton h-3 w-24 rounded" />
            </div>
          </div>
          {/* progress bar skeleton */}
          <div className="px-6 pb-0">
            <div className="skeleton h-0.5 w-full rounded" />
          </div>
          {/* exercise grid skeleton */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {[0, 1, 2, 3].map((j) => (
              <div key={j} className="rounded-2xl border border-slate-100 p-4 space-y-3">
                <div className="skeleton h-4 w-36 rounded" />
                <div className="flex gap-2">
                  <div className="skeleton h-5 w-20 rounded-full" />
                  <div className="skeleton h-5 w-16 rounded-full" />
                  <div className="skeleton h-5 w-14 rounded-full" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="skeleton h-12 rounded-lg" />
                  <div className="skeleton h-12 rounded-lg" />
                  <div className="skeleton h-12 rounded-lg" />
                </div>
                <div className="skeleton h-3 w-full rounded" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function WorkoutsPage() {
  const router = useRouter();
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState<{ exercise: Exercise; day: string } | null>(null);
  const [equipment, setEquipment] = useState<EquipmentKey>("none");
  const [demoAltName, setDemoAltName] = useState<string | null>(null);

  useEffect(() => {
    const loadWorkouts = async () => {
      if (!getToken()) {
        router.replace("/login");
        setIsLoading(false);
        return;
      }

      try {
        const res = await api.get("/api/workouts");
        const plans = res.data as WorkoutPlan[];
        const activePlan = plans.find((plan) => plan.isActive) || plans[0] || null;
        setWorkoutPlan(enhanceWorkoutPlan(activePlan));
      } catch (error: unknown) {
        if (isUnauthorizedError(error)) {
          clearAuth();
          router.replace("/login");
          return;
        }

        toast.error("Failed to load workouts");
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkouts();
  }, [router]);

  const workoutLocation = workoutPlan?.workoutLocation || workoutPlan?.days?.[0]?.workoutLocation || "Both";

  const alternatives = selectedExercise ? getAlternatives(selectedExercise.exercise, equipment) : [];

  const handleUseAlternative = async (alt: WorkoutAlternative) => {
    if (!selectedExercise || !workoutPlan) return;
    const { exercise: current, day } = selectedExercise;

    const replacement: Exercise = {
      ...current,
      name: alt.name,
      equipment: alt.equipment,
      locationType: alt.locationType,
      instruction: alt.instruction || current.instruction,
      instructions: alt.instruction || current.instructions,
      steps: alt.instruction ? [alt.instruction] : current.steps,
      youtubeEmbedUrl: alt.youtubeEmbedUrl,
      alternativeExercise: {
        name: current.name,
        equipment: current.equipment,
        locationType: current.locationType,
        summary: `Switch back to ${current.name} when you have the equipment.`,
        youtubeEmbedUrl: current.youtubeEmbedUrl,
      },
    };

    const replaceInDays = (days?: WorkoutDay[]) =>
      days?.map((d) =>
        d.day === day ? { ...d, exercises: d.exercises.map((e) => (e.name === current.name ? replacement : e)) } : d
      );

    const updated: WorkoutPlan = {
      ...workoutPlan,
      days: replaceInDays(workoutPlan.days),
      planData: replaceInDays(workoutPlan.planData),
    };

    setWorkoutPlan(updated);
    setSelectedExercise({ exercise: replacement, day });
    setDemoAltName(null);
    toast.success(`Switched to ${alt.name}`);

    if (workoutPlan._id) {
      try {
        await api.put(`/api/workouts/${workoutPlan._id}`, { days: updated.days || updated.planData });
      } catch {
        toast.error("Switched locally, but couldn't sync to the server.");
      }
    }
  };

  const toggleDayComplete = async (dayIdx: number) => {
    if (!workoutPlan) return;
    const usePlanData = !workoutPlan.days && Boolean(workoutPlan.planData);
    const source = workoutPlan.days || workoutPlan.planData || [];
    const days = source.map((d, di) =>
      di === dayIdx
        ? { ...d, completed: !d.completed, exercises: d.exercises.map((e) => ({ ...e, completed: !d.completed })) }
        : d
    );
    const updated: WorkoutPlan = { ...workoutPlan, ...(usePlanData ? { planData: days } : { days }) };
    setWorkoutPlan(updated);
    toast.success(days[dayIdx].completed ? "Workout completed! Great job. 🎉" : "Marked as not done.");

    if (workoutPlan._id) {
      try {
        await api.put(`/api/workouts/${workoutPlan._id}`, { days: updated.days || updated.planData });
      } catch {
        toast.error("Marked locally, but couldn't sync to the server.");
      }
    }
  };

  const workoutLocationLabel = (() => {
    const value = workoutLocation.toLowerCase();
    if (value.includes("home") && value.includes("gym")) return "Flexible";
    if (value.includes("home")) return "Home-based";
    if (value.includes("gym")) return "Gym-based";
    return "Flexible";
  })();

  const allDays = workoutPlan?.days || workoutPlan?.planData || [];
  const completedCount = allDays.filter((d) => d.completed).length;
  const totalCount = allDays.length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
          {/* Header skeleton */}
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-3">
              <div className="skeleton h-8 w-64 rounded-lg" />
              <div className="skeleton h-4 w-48 rounded" />
              <div className="skeleton h-7 w-28 rounded-full" />
            </div>
            <div className="skeleton h-9 w-36 rounded-lg" />
          </div>
          <WorkoutSkeleton />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <AIChat currentExercise={selectedExercise?.exercise.name} />

      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">

        {/* ── Page Header ────────────────────────────────────────────────────── */}
        <div className="flex items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Your Workout Plan</h1>
            <p className="text-slate-500 mt-1 font-medium">Consistency is the key to transformation.</p>

            {/* Location + progress pills */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm">
                {workoutLocation.toLowerCase().includes("home") && !workoutLocation.toLowerCase().includes("gym") ? (
                  <Home className="h-4 w-4 text-blue-600" />
                ) : (
                  <Building2 className="h-4 w-4 text-blue-600" />
                )}
                <span>{workoutLocationLabel}</span>
              </div>

              {totalCount > 0 && (
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-100 px-3 py-1.5 text-sm font-bold text-blue-700 shadow-sm">
                  <Trophy className="h-3.5 w-3.5 text-blue-600" />
                  <span>{completedCount}/{totalCount} days done</span>
                </div>
              )}
            </div>
          </div>

          <Link
            href="/workouts/generate"
            className="flex-shrink-0 group flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/50 transition-all text-sm shadow-sm"
          >
            <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
            Regenerate Plan
          </Link>
        </div>

        {/* ── Thin global progress bar ─────────────────────────────────────── */}
        {totalCount > 0 && (
          <div className="progress-bar-track mb-8">
            <div
              className="progress-bar-fill"
              style={{ width: `${(completedCount / totalCount) * 100}%` }}
            />
          </div>
        )}

        {!workoutPlan ? (
          /* ── Empty State ─────────────────────────────────────────────────── */
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full bg-blue-100 animate-ping opacity-30" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                <Dumbbell className="w-9 h-9 text-blue-600 animate-floaty" />
              </div>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">No Plan Yet</h2>
            <p className="text-slate-500 mb-2 max-w-sm mx-auto">
              You haven&apos;t generated a workout plan yet.
            </p>
            <p className="text-slate-400 text-sm mb-8 max-w-sm mx-auto">
              Let&apos;s build something tailored to your goals, equipment, and schedule.
            </p>
            <Link
              href="/workouts/generate"
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-extrabold rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 hover:-translate-y-0.5 active:scale-95"
            >
              <Zap className="w-5 h-5" />
              Generate My Plan
              <ChevronRight className="ml-1 w-5 h-5" />
            </Link>
          </div>
        ) : (
          /* ── Day Cards ───────────────────────────────────────────────────── */
          <div className="space-y-8">
            {allDays.map((dayPlan, idx) => {
              const completedExercises = dayPlan.exercises.filter((e) => e.completed).length;
              const exerciseProgress = dayPlan.exercises.length > 0
                ? completedExercises / dayPlan.exercises.length
                : 0;

              return (
                <div
                  key={idx}
                  className={`bg-white rounded-3xl border shadow-sm overflow-hidden transition-all duration-300 ${
                    dayPlan.completed
                      ? "border-green-200 shadow-green-100/60"
                      : "border-slate-100"
                  }`}
                >
                  {/* Card Header */}
                  <div className={`p-6 flex items-center justify-between ${
                    dayPlan.completed ? "bg-gradient-to-r from-green-50/80 to-white" : "bg-white"
                  }`}>
                    <div className="flex items-center gap-4">
                      {/* Animated day badge */}
                      <div className="relative flex-shrink-0">
                        <div className={`relative pulse-ring w-13 h-13 rounded-2xl flex items-center justify-center font-black text-lg text-white shadow-lg ${
                          dayPlan.completed
                            ? "bg-gradient-to-br from-green-500 to-green-600 shadow-green-200"
                            : "bg-gradient-to-br from-blue-500 to-blue-700 shadow-blue-200"
                        }`}
                          style={{ width: "3.25rem", height: "3.25rem" }}
                        >
                          {dayPlan.completed ? (
                            <CheckCircle2 className="w-6 h-6" />
                          ) : (
                            dayPlan.day.substring(0, 2)
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl font-extrabold text-slate-900">{dayPlan.day}</h3>
                        <p className="text-sm font-semibold text-blue-600 mt-0.5">{dayPlan.focus}</p>
                        <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-slate-600">
                          {dayPlan.workoutLocation?.toLowerCase().includes("home") && !dayPlan.workoutLocation?.toLowerCase().includes("gym") ? (
                            <Home className="h-3 w-3" />
                          ) : (
                            <Building2 className="h-3 w-3" />
                          )}
                          <span>{dayPlan.workoutLocation || workoutLocation}</span>
                        </div>
                      </div>
                    </div>

                    {/* Session meta */}
                    <div className="hidden sm:flex items-center gap-3">
                      <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-full px-3 py-1.5 text-slate-600 text-xs font-bold">
                        <Clock className="w-3.5 h-3.5 text-blue-500" />
                        <span>45–60 min</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-full px-3 py-1.5 text-slate-600 text-xs font-bold">
                        <Flame className="w-3.5 h-3.5 text-orange-500" />
                        <span>{dayPlan.exercises.length} Exercises</span>
                      </div>
                    </div>
                  </div>

                  {/* Exercise progress bar */}
                  <div className="px-6">
                    <div className="progress-bar-track">
                      <div
                        className="progress-bar-fill"
                        style={{ width: dayPlan.completed ? "100%" : `${exerciseProgress * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Exercise Grid */}
                  <div className="p-6 border-t border-slate-50/80">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {dayPlan.exercises.map((ex, exIdx) => (
                        <button
                          key={exIdx}
                          type="button"
                          onClick={() => {
                            setSelectedExercise({ exercise: ex, day: dayPlan.day });
                            setDemoAltName(null);
                          }}
                          className={`exercise-card group text-left p-4 rounded-2xl border-l-4 border border-slate-100 bg-white hover:border-l-4 focus:outline-none focus:ring-2 focus:ring-blue-400/50 ${muscleBorderColor(ex.targetMuscle)}`}
                        >
                          {/* Exercise name row */}
                          <div className="flex items-start justify-between mb-2.5">
                            <h4 className="font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors leading-snug pr-2">
                              {ex.name}
                            </h4>
                            <span className="flex-shrink-0 text-[10px] font-extrabold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full capitalize">
                              {ex.locationType || workoutLocation}
                            </span>
                          </div>

                          {/* Tags */}
                          <div className="mb-3 flex flex-wrap gap-1.5">
                            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600">
                              {ex.targetMuscle || "General strength"}
                            </span>
                            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600">
                              {ex.equipment}
                            </span>
                            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600">
                              {ex.difficulty || "Beginner"}
                            </span>
                          </div>

                          {/* Metrics */}
                          <div className="grid grid-cols-3 gap-2 mb-3">
                            <Metric label="Sets" value={ex.sets} />
                            <Metric label="Reps" value={ex.reps} />
                            <Metric label="Rest" value={ex.rest} />
                          </div>

                          {/* Instruction + play hint */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-1.5 text-xs text-slate-500 leading-relaxed flex-1">
                              <Info className="w-3.5 h-3.5 mt-0.5 text-blue-400 shrink-0" />
                              <p className="line-clamp-2">{ex.instruction || ex.instructions}</p>
                            </div>
                            <span className="play-hint flex-shrink-0 inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-1 rounded-full">
                              <PlayCircle className="w-3 h-3" />
                              View
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Complete Workout Button */}
                    <div className="mt-8 flex justify-center">
                      <button
                        type="button"
                        onClick={() => toggleDayComplete(idx)}
                        className={`flex items-center gap-2.5 px-8 py-3.5 font-extrabold rounded-2xl text-white tracking-wide shadow-lg active:scale-95 transition-transform ${
                          dayPlan.completed ? "complete-btn-done" : "complete-btn"
                        }`}
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        {dayPlan.completed ? "✓ Completed!" : "Complete Workout"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Modal
        isOpen={Boolean(selectedExercise)}
        onClose={() => {
          setSelectedExercise(null);
          setDemoAltName(null);
        }}
        title={selectedExercise?.exercise.name || "Exercise details"}
      >
        {selectedExercise && (
          <div className="space-y-5">
            {(() => {
              const loc = (selectedExercise.exercise.locationType || workoutLocation).toLowerCase();
              const home = loc.includes("home") && !loc.includes("gym");
              const both = loc.includes("both") || (loc.includes("home") && loc.includes("gym"));
              const label = both ? "Home & Gym Workout" : home ? "Home Workout" : "Gym Workout";
              const BadgeIcon = home ? Home : Building2;
              return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 px-3.5 py-1.5 text-xs font-extrabold text-white shadow-md shadow-blue-100">
                  <BadgeIcon className="h-3.5 w-3.5" />
                  {label}
                </span>
              );
            })()}

            <div className="flex flex-wrap gap-2">
              <Pill icon={selectedExercise.exercise.locationType?.toLowerCase().includes("home") && !selectedExercise.exercise.locationType?.toLowerCase().includes("gym") ? Home : Building2} label={selectedExercise.exercise.locationType || workoutLocation} />
              <Pill icon={Target} label={selectedExercise.exercise.targetMuscle || "General strength"} />
              <Pill icon={Dumbbell} label={selectedExercise.exercise.equipment} />
              <Pill icon={Repeat2} label={selectedExercise.exercise.difficulty || "Beginner"} />
            </div>

            {/* Metrics summary strip */}
            <div className="grid grid-cols-3 gap-3">
              <MetricLarge label="Sets" value={selectedExercise.exercise.sets} />
              <MetricLarge label="Reps" value={selectedExercise.exercise.reps} />
              <MetricLarge label="Rest" value={selectedExercise.exercise.rest} />
            </div>

            <Section title="How to do it" icon={Dumbbell} variant="blue">
              <ol className="space-y-2 list-decimal list-inside text-slate-700">
                {(selectedExercise.exercise.steps?.length
                  ? selectedExercise.exercise.steps
                  : [selectedExercise.exercise.instruction || selectedExercise.exercise.instructions || "Follow the movement slowly and keep your form controlled."]
                ).map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </Section>

            {(() => {
              const loc = (selectedExercise.exercise.locationType || workoutLocation).toLowerCase();
              const home = loc.includes("home") && !loc.includes("gym");
              const tips = selectedExercise.exercise.machineSetupTips?.length
                ? selectedExercise.exercise.machineSetupTips
                : home
                  ? ["Clear a small space and use a mat if you have one.", "Use a sturdy chair, wall, or step where the move needs support."]
                  : ["Adjust the seat and pads so the movement lines up with your joints.", "Start with a light weight to learn the full range of motion."];
              return (
                <Section title={home ? "Home Setup Tips" : "Machine Setup Tips"} icon={Info} variant="slate">
                  <ul className="space-y-2 text-slate-700">
                    {tips.map((tip, index) => (
                      <li key={index} className="flex gap-2">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </Section>
              );
            })()}

            <div className="grid gap-3 sm:grid-cols-2">
              <Section title="Safety tips" icon={ShieldAlert} variant="amber">
                <ul className="space-y-2 text-slate-700">
                  {(selectedExercise.exercise.safetyTips?.length
                    ? selectedExercise.exercise.safetyTips
                    : ["Use a controlled pace.", "Stop if your form breaks down."]
                  ).map((tip, index) => (
                    <li key={index} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </Section>

              <Section title="Common mistakes" icon={TriangleAlert} variant="rose">
                <ul className="space-y-2 text-slate-700">
                  {(selectedExercise.exercise.commonMistakes?.length
                    ? selectedExercise.exercise.commonMistakes
                    : ["Rushing the rep.", "Letting posture collapse."]
                  ).map((mistake, index) => (
                    <li key={index} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" />
                      <span>{mistake}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            </div>

            <Section title="Workout Demo" icon={PlayCircle} variant="blue">
              <WorkoutDemo
                exerciseName={selectedExercise.exercise.name}
                youtubeEmbedUrl={selectedExercise.exercise.youtubeEmbedUrl}
              />
            </Section>

            <Section title="Alternative Workouts" icon={Repeat2} variant="slate">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Equipment you have:</span>
                {EQUIPMENT_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setEquipment(opt.key)}
                    className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
                      equipment === opt.key
                        ? "bg-blue-600 text-white shadow-md shadow-blue-100"
                        : "border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-600"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {alternatives.length === 0 ? (
                <p className="text-sm text-slate-500 italic">No alternatives available for this exercise yet.</p>
              ) : (
                <div className="space-y-3">
                  {alternatives.map((alt) => (
                    <div key={alt.name} className="rounded-2xl border border-slate-200 bg-white p-4 hover:border-blue-200 transition-colors">
                      <p className="font-extrabold text-slate-900">{alt.name}</p>
                      <p className="mt-0.5 text-xs text-slate-400 font-medium">
                        {alt.equipment} · {alt.locationType}
                      </p>
                      <p className="mt-2 text-sm text-slate-600">{alt.reason}</p>
                      {alt.instruction && <p className="mt-1 text-sm text-slate-700">{alt.instruction}</p>}
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleUseAlternative(alt)}
                          className="rounded-full bg-blue-600 px-4 py-1.5 text-xs font-extrabold text-white hover:bg-blue-700 transition-colors shadow-sm"
                        >
                          Use this alternative
                        </button>
                        <button
                          type="button"
                          onClick={() => setDemoAltName(demoAltName === alt.name ? null : alt.name)}
                          className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-bold text-slate-700 hover:border-blue-200 hover:text-blue-600 transition-colors"
                        >
                          {demoAltName === alt.name ? "Hide demo" : "▶ View demo"}
                        </button>
                      </div>
                      {demoAltName === alt.name && (
                        <div className="mt-4">
                          <WorkoutDemo
                            exerciseName={alt.name}
                            youtubeEmbedUrl={alt.youtubeEmbedUrl}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Section>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ─── Sub-components ────────────────────────────────────────────────────────── */

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-gradient-to-b from-slate-50 to-white p-2.5 rounded-xl border border-slate-100 text-center shadow-sm">
      <p className="text-[9px] uppercase tracking-widest font-extrabold text-slate-400 mb-0.5">{label}</p>
      <p className="text-sm font-extrabold text-slate-900">{value}</p>
    </div>
  );
}

function MetricLarge({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-gradient-to-b from-blue-50/60 to-white p-4 rounded-2xl border border-blue-100/60 text-center shadow-sm">
      <p className="text-[10px] uppercase tracking-widest font-extrabold text-blue-400 mb-1">{label}</p>
      <p className="text-xl font-black text-slate-900">{value}</p>
    </div>
  );
}

function Pill({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm hover:border-blue-200 hover:bg-blue-50/40 transition-colors">
      <Icon className="h-3.5 w-3.5 text-blue-500" />
      <span>{label}</span>
    </div>
  );
}

const sectionVariants = {
  blue:  { border: "border-blue-200",  bg: "bg-blue-50/40",  icon: "text-blue-600",  title: "text-blue-900"  },
  amber: { border: "border-amber-200", bg: "bg-amber-50/40", icon: "text-amber-600", title: "text-amber-900" },
  rose:  { border: "border-rose-200",  bg: "bg-rose-50/40",  icon: "text-rose-600",  title: "text-rose-900"  },
  slate: { border: "border-slate-200", bg: "bg-slate-50",    icon: "text-blue-600",  title: "text-slate-900" },
};

function Section({
  title,
  icon: Icon,
  children,
  variant = "slate",
}: {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
  variant?: keyof typeof sectionVariants;
}) {
  const v = sectionVariants[variant];
  return (
    <section className={`rounded-2xl border-l-4 border ${v.border} ${v.bg} p-4`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`h-4 w-4 ${v.icon}`} />
        <h3 className={`text-sm font-extrabold ${v.title}`}>{title}</h3>
      </div>
      {children}
    </section>
  );
}

// Satisfy unused import (Loader2 kept for future use)
void Loader2;
