"use client";

import { useEffect, useState, useRef, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Modal } from "@/components/Modal";
import type { LucideIcon } from "lucide-react";
import {
  Dumbbell,
  ChevronRight,
  Info,
  Clock,
  Target,
  CheckCircle2,
  ShieldAlert,
  TriangleAlert,
  Repeat2,
  PlayCircle,
  RefreshCw,
  Zap,
  Play,
  Pause,
  RotateCcw,
  Check,
  Layers,
  ArrowRight,
  Video,
  Activity,
  CheckCheck,
} from "lucide-react";
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

function getMuscleBadgeColor(muscle?: string): { bg: string; text: string; border: string } {
  const m = (muscle || "").toLowerCase();
  if (m.includes("core") || m.includes("abs") || m.includes("oblique")) {
    return { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" };
  }
  if (m.includes("chest") || m.includes("pec")) {
    return { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" };
  }
  if (m.includes("back") || m.includes("lat") || m.includes("rhom")) {
    return { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" };
  }
  if (m.includes("leg") || m.includes("quad") || m.includes("hamstring") || m.includes("glut")) {
    return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" };
  }
  if (m.includes("shoulder") || m.includes("delt")) {
    return { bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-200" };
  }
  if (m.includes("arm") || m.includes("bicep") || m.includes("tricep")) {
    return { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" };
  }
  return { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" };
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
      <div className="h-72 rounded-3xl bg-stone-200/80" />
      <div className="h-20 rounded-3xl bg-stone-200/80" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-64 rounded-3xl bg-stone-200/80" />
        ))}
      </div>
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
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);

  // Set Tracking State (key: `dayIdx-exIdx-setIdx`)
  const [completedSets, setCompletedSets] = useState<Record<string, boolean>>({});

  // Interactive Rest Timer State
  const [restSeconds, setRestSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

    // Load saved set checkmarks
    try {
      const savedSets = localStorage.getItem("strive_completed_sets");
      if (savedSets) setCompletedSets(JSON.parse(savedSets));
    } catch {
      // ignore
    }
  }, [router]);

  // Rest Timer Effect
  useEffect(() => {
    if (timerActive && restSeconds > 0) {
      timerRef.current = setTimeout(() => {
        setRestSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerActive && restSeconds === 0) {
      setTimerActive(false);
      toast.success("Rest complete! Ready for your next set. 🔥", { icon: "⏱️" });
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timerActive, restSeconds]);

  const startRestTimer = (seconds: number) => {
    setRestSeconds(seconds);
    setTimerActive(true);
    toast(`Rest timer started: ${seconds}s`, { icon: "⏱️" });
  };

  const toggleSet = (dayIdx: number, exIdx: number, setIdx: number) => {
    const key = `${dayIdx}-${exIdx}-${setIdx}`;
    setCompletedSets((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem("strive_completed_sets", JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

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
    toast.success(days[dayIdx].completed ? "Session cleared! High-five on the discipline. 🎉" : "Marked as pending.");

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
    if (value.includes("home") && value.includes("gym")) return "Gym & Home Compatible";
    if (value.includes("home")) return "Home Workout Protocol";
    if (value.includes("gym")) return "Full Gym Protocol";
    return "Flexible Protocol";
  })();

  const allDays = workoutPlan?.days || workoutPlan?.planData || [];
  const completedCount = allDays.filter((d) => d.completed).length;
  const totalCount = allDays.length;

  // Active day to display (supports tab selection)
  const currentDay = allDays[selectedDayIdx] || allDays[0];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fbf5f0] flex flex-col">
        <Navbar />
        <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
          <WorkoutSkeleton />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbf5f0] text-slate-900 flex flex-col selection:bg-blue-500 selection:text-white">
      <Navbar />
      <AIChat currentExercise={selectedExercise?.exercise.name} />

      <main className="flex-grow py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full space-y-8">

        {/* ─── 1. EDITORIAL PROGRAM HERO BANNER ─── */}
        <div className="relative rounded-3xl overflow-hidden shadow-xl border border-stone-900/10 min-h-[320px] sm:min-h-[360px] flex items-end">
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/workout_program_cover.jpg"
              alt="Elite workout gym equipment"
              fill
              priority
              className="object-cover object-center"
              sizes="(max-width: 1280px) 100vw, 1280px"
            />
            {/* Cinematic multi-stop gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/65 to-black/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
          </div>

          <div className="relative z-10 p-6 sm:p-10 w-full max-w-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-blue-600 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-blue-500/30">
                Active Training Program
              </span>
              <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-bold border border-white/20">
                {completedCount}/{totalCount || 1} Sessions Done
              </span>
              <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-bold border border-white/20">
                {workoutLocationLabel}
              </span>
            </div>

            <div>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                Your Training Blueprint
              </h1>
              <p className="mt-2 text-stone-300 text-sm sm:text-base font-medium max-w-xl leading-relaxed">
                Precision-engineered movement selection designed for hypertrophy, core stability, and athletic longevity.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href="/workouts/generate"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-xs font-black border border-white/25 transition-all active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5 text-blue-300" />
                <span>Regenerate Plan</span>
              </Link>
              {currentDay && (
                <button
                  type="button"
                  onClick={() => toggleDayComplete(selectedDayIdx)}
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black shadow-lg transition-all active:scale-95 ${
                    currentDay.completed
                      ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/30"
                      : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{currentDay.completed ? "Session Completed ✓" : "Complete This Session"}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ─── 2. REST INTERVAL TIMER BAR (INTERACTIVE LIVE FITNESS TOOL) ─── */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-stone-900 flex items-center gap-2">
              Live Rest Interval Timer
              {timerActive && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-[10px] font-black animate-pulse">
                  COUNTDOWN
                </span>
              )}
            </h3>
            <p className="text-[11px] text-stone-500">
              Optimize ATP replenishment and muscle recovery between sets
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {timerActive ? (
              <div className="flex items-center gap-3 bg-stone-900 text-white px-5 py-2.5 rounded-2xl shadow-md">
                <span className="font-mono text-lg font-black text-orange-400">
                  {Math.floor(restSeconds / 60)}:{(restSeconds % 60).toString().padStart(2, "0")}
                </span>
                <button
                  type="button"
                  onClick={() => setTimerActive(false)}
                  className="p-1 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-white"
                  title="Pause timer"
                >
                  <Pause className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTimerActive(false);
                    setRestSeconds(0);
                  }}
                  className="p-1 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-white"
                  title="Reset timer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                {[30, 45, 60, 90].map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => startRestTimer(sec)}
                    className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-black transition-colors active:scale-95"
                  >
                    {sec}s
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {!workoutPlan || allDays.length === 0 ? (
          /* ── Empty State ── */
          <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/80 shadow-xs">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100">
              <Dumbbell className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-stone-900 mb-1">No Active Workout Plan</h2>
            <p className="text-stone-500 text-sm mb-6 max-w-sm mx-auto">
              Generate a custom, science-backed workout plan matching your exact training level and available equipment.
            </p>
            <Link
              href="/workouts/generate"
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-black text-xs uppercase tracking-wider rounded-2xl hover:bg-blue-500 shadow-md shadow-blue-600/30 transition-all active:scale-95"
            >
              <span>Build Custom Plan</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* ─── 3. DAY / SESSION SELECTOR TABS ─── */}
            {allDays.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {allDays.map((day, dIdx) => {
                  const isSelected = dIdx === selectedDayIdx;
                  return (
                    <button
                      key={dIdx}
                      type="button"
                      onClick={() => setSelectedDayIdx(dIdx)}
                      className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border text-left whitespace-nowrap transition-all ${
                        isSelected
                          ? "bg-stone-900 text-white border-stone-900 shadow-md"
                          : "bg-white border-stone-200/80 text-stone-700 hover:bg-stone-50"
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-mono font-black ${
                          isSelected
                            ? "bg-blue-600 text-white"
                            : day.completed
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-stone-100 text-stone-700"
                        }`}
                      >
                        {day.completed ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : `0${dIdx + 1}`}
                      </div>
                      <div className="text-left">
                        <p className={`text-xs font-black ${isSelected ? "text-white" : "text-stone-900"}`}>
                          {day.day}
                        </p>
                        <p className={`text-[10px] truncate max-w-[120px] ${isSelected ? "text-stone-300" : "text-stone-400"}`}>
                          {day.focus}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* ─── 4. ACTIVE SESSION CARD ─── */}
            {currentDay && (
              <div
                className={`bg-white rounded-3xl border shadow-xs overflow-hidden transition-all duration-300 ${
                  currentDay.completed ? "border-emerald-200/80 ring-1 ring-emerald-100" : "border-stone-200/80"
                }`}
              >
                {/* Session Header */}
                <div className="p-6 sm:p-7 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-50/50">
                  <div className="flex items-center gap-4">
                    {/* Session Number Badge */}
                    <div
                      className={`w-13 h-13 rounded-2xl flex items-center justify-center font-black text-sm text-white shadow-md shrink-0 ${
                        currentDay.completed
                          ? "bg-emerald-500 shadow-emerald-500/20"
                          : "bg-gradient-to-br from-stone-900 to-stone-800 shadow-stone-900/10"
                      }`}
                      style={{ width: "3.25rem", height: "3.25rem" }}
                    >
                      {currentDay.completed ? (
                        <CheckCircle2 className="w-6 h-6 text-white" />
                      ) : (
                        <span className="font-mono text-sm tracking-wider">#{selectedDayIdx + 1}</span>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-wider text-blue-600">
                          {currentDay.day}
                        </span>
                        <span className="text-stone-300">&bull;</span>
                        <span className="text-xs font-bold text-stone-500">
                          {currentDay.completed ? "Session Completed" : "Active Target"}
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                        {currentDay.focus}
                      </h2>
                    </div>
                  </div>

                  {/* Session Badges & Telemetry */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="inline-flex items-center px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-xs font-bold text-stone-700 shadow-2xs">
                      <span>45–60 min</span>
                    </div>
                    <div className="inline-flex items-center px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-xs font-bold text-stone-700 shadow-2xs">
                      <span>{currentDay.exercises.length} Exercises</span>
                    </div>
                    <div className="inline-flex items-center px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-xs font-bold text-stone-700 shadow-2xs">
                      <span>{currentDay.workoutLocation || workoutLocation}</span>
                    </div>
                  </div>
                </div>

                {/* ─── 5. EXERCISE CARDS GRID ─── */}
                <div className="p-6 sm:p-7 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentDay.exercises.map((ex, exIdx) => {
                      const badge = getMuscleBadgeColor(ex.targetMuscle);
                      const totalSets = ex.sets || 3;

                      return (
                        <div
                          key={exIdx}
                          className="bg-white rounded-3xl border border-stone-200/80 hover:border-stone-300 hover:shadow-md transition-all p-5 space-y-4 flex flex-col justify-between group"
                        >
                          {/* Top: Exercise Name & Muscle Pill */}
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2.5">
                                <span className="w-7 h-7 rounded-xl bg-stone-100 group-hover:bg-blue-600 group-hover:text-white border border-stone-200 text-stone-800 font-mono font-black text-xs flex items-center justify-center shrink-0 transition-colors">
                                  0{exIdx + 1}
                                </span>
                                <h3 className="font-extrabold text-stone-900 text-base group-hover:text-blue-600 transition-colors leading-snug">
                                  {ex.name}
                                </h3>
                              </div>

                              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 shrink-0">
                                {ex.locationType || workoutLocation}
                              </span>
                            </div>

                            {/* Tags */}
                            <div className="mt-2.5 flex flex-wrap gap-1.5">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}>
                                {ex.targetMuscle || "Core & Strength"}
                              </span>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-600 border border-stone-200">
                                {ex.equipment}
                              </span>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-600 border border-stone-200">
                                {ex.difficulty || "Beginner"}
                              </span>
                            </div>
                          </div>

                          {/* Middle: Interactive Set Check-off Telemetry */}
                          <div className="bg-stone-50/80 p-3 rounded-2xl border border-stone-200/70 space-y-2">
                            <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-stone-500">
                              <span>Set Prescription</span>
                              <span className="text-stone-400 font-mono">Rest: {ex.rest || "45s"}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              {[...Array(totalSets)].map((_, sIdx) => {
                                const key = `${selectedDayIdx}-${exIdx}-${sIdx}`;
                                const isDone = Boolean(completedSets[key]);
                                return (
                                  <button
                                    key={sIdx}
                                    type="button"
                                    onClick={() => toggleSet(selectedDayIdx, exIdx, sIdx)}
                                    title={`Set ${sIdx + 1}: ${ex.reps}`}
                                    className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1 transition-all ${
                                      isDone
                                        ? "bg-emerald-500 text-white shadow-xs"
                                        : "bg-white border border-stone-200/80 text-stone-700 hover:border-stone-400"
                                    }`}
                                  >
                                    {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                                    <span>Set {sIdx + 1}</span>
                                  </button>
                                );
                              })}
                            </div>

                            <p className="text-[11px] font-medium text-stone-600 pt-0.5">
                              Target: <strong className="text-stone-900 font-bold">{ex.reps}</strong> per set
                            </p>
                          </div>

                          {/* Coach Tip Snippet */}
                          {(ex.instruction || ex.instructions) && (
                            <div className="text-xs text-stone-500 leading-relaxed bg-stone-50/70 p-2.5 rounded-xl border border-stone-100">
                              <p className="line-clamp-2"><span className="font-bold text-stone-700">Form Cue:</span> {ex.instruction || ex.instructions}</p>
                            </div>
                          )}

                          {/* Card Footer Actions */}
                          <div className="pt-2 flex items-center justify-between gap-2 border-t border-stone-100">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedExercise({ exercise: ex, day: currentDay.day });
                                setDemoAltName(null);
                              }}
                              className="inline-flex items-center gap-1.5 text-xs font-black text-blue-600 hover:text-blue-700 transition-colors"
                            >
                              <PlayCircle className="w-4 h-4" />
                              <span>View Form Video & Tips</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                const seconds = parseInt(ex.rest) || 45;
                                startRestTimer(seconds);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-bold transition-colors"
                              title="Quick Rest Timer"
                            >
                              <span>Rest {ex.rest || "45s"}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Complete Workout CTA */}
                  <div className="mt-8 pt-6 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-black text-stone-900">Finished this routine?</h4>
                      <p className="text-xs text-stone-500">Record session completion to update your streak and readiness score.</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleDayComplete(selectedDayIdx)}
                      className={`w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg transition-all active:scale-95 ${
                        currentDay.completed
                          ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/30"
                          : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30"
                      }`}
                    >
                      <CheckCheck className="w-4 h-4" />
                      <span>{currentDay.completed ? "Session Completed ✓" : "Mark Routine as Finished"}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ─── 6. EXERCISE DETAILS & VIDEO FORM TECHNIQUE MODAL ─── */}
      <Modal
        isOpen={Boolean(selectedExercise)}
        onClose={() => {
          setSelectedExercise(null);
          setDemoAltName(null);
        }}
        title={selectedExercise?.exercise.name || "Exercise details"}
      >
        {selectedExercise && (
          <div className="space-y-6">
            {/* Modal Badges */}
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 text-white px-3 py-1 text-xs font-black">
                {selectedExercise.exercise.locationType || workoutLocation}
              </span>
              <Pill icon={Target} label={selectedExercise.exercise.targetMuscle || "General strength"} />
              <Pill icon={Dumbbell} label={selectedExercise.exercise.equipment} />
              <Pill icon={Repeat2} label={selectedExercise.exercise.difficulty || "Beginner"} />
            </div>

            {/* Prescriptions */}
            <div className="grid grid-cols-3 gap-3">
              <MetricLarge label="Prescribed Sets" value={selectedExercise.exercise.sets} />
              <MetricLarge label="Reps Per Set" value={selectedExercise.exercise.reps} />
              <MetricLarge label="Rest Interval" value={selectedExercise.exercise.rest} />
            </div>

            {/* Video Demonstration */}
            <div className="rounded-2xl overflow-hidden border border-stone-200">
              <div className="p-3 bg-stone-900 text-white flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-blue-400" /> Form Demonstration
                </span>
                <span className="text-[11px] text-stone-400">{selectedExercise.exercise.name}</span>
              </div>
              <div className="p-4 bg-white">
                <WorkoutDemo
                  exerciseName={selectedExercise.exercise.name}
                  youtubeEmbedUrl={selectedExercise.exercise.youtubeEmbedUrl}
                />
              </div>
            </div>

            {/* Step-by-Step Instructions */}
            <Section title="Movement Execution" icon={Dumbbell} variant="blue">
              <ol className="space-y-2 list-decimal list-inside text-stone-700 text-sm">
                {(selectedExercise.exercise.steps?.length
                  ? selectedExercise.exercise.steps
                  : [selectedExercise.exercise.instruction || selectedExercise.exercise.instructions || "Follow the movement slowly and keep your form controlled."]
                ).map((step, index) => (
                  <li key={index} className="leading-relaxed">{step}</li>
                ))}
              </ol>
            </Section>

            {/* Setup & Safety Tips */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Section title="Safety Precautions" icon={ShieldAlert} variant="amber">
                <ul className="space-y-2 text-stone-700 text-xs">
                  {(selectedExercise.exercise.safetyTips?.length
                    ? selectedExercise.exercise.safetyTips
                    : ["Maintain core tension throughout.", "Stop immediately if sharp joint pain occurs."]
                  ).map((tip, index) => (
                    <li key={index} className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </Section>

              <Section title="Common Form Mistakes" icon={TriangleAlert} variant="rose">
                <ul className="space-y-2 text-stone-700 text-xs">
                  {(selectedExercise.exercise.commonMistakes?.length
                    ? selectedExercise.exercise.commonMistakes
                    : ["Rushing the eccentric tempo.", "Arching the lumbar spine."]
                  ).map((mistake, index) => (
                    <li key={index} className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" />
                      <span>{mistake}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            </div>

            {/* Alternative Workouts */}
            <Section title="Equipment Alternative Swapper" icon={Repeat2} variant="slate">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-stone-500">Filter by equipment:</span>
                {EQUIPMENT_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setEquipment(opt.key)}
                    className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
                      equipment === opt.key
                        ? "bg-blue-600 text-white shadow-xs"
                        : "border border-stone-200 bg-white text-stone-600 hover:border-stone-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {alternatives.length === 0 ? (
                <p className="text-sm text-stone-500 italic">No alternative movements needed for current setup.</p>
              ) : (
                <div className="space-y-3">
                  {alternatives.map((alt) => (
                    <div key={alt.name} className="rounded-2xl border border-stone-200 bg-white p-4 hover:border-stone-300 transition-colors">
                      <p className="font-extrabold text-stone-900 text-sm">{alt.name}</p>
                      <p className="mt-0.5 text-xs text-stone-400 font-medium">
                        {alt.equipment} &bull; {alt.locationType}
                      </p>
                      <p className="mt-2 text-xs text-stone-600">{alt.reason}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleUseAlternative(alt)}
                          className="rounded-full bg-blue-600 px-4 py-1.5 text-xs font-black text-white hover:bg-blue-500 transition-colors shadow-xs"
                        >
                          Use This Alternative
                        </button>
                        <button
                          type="button"
                          onClick={() => setDemoAltName(demoAltName === alt.name ? null : alt.name)}
                          className="rounded-full border border-stone-200 bg-white px-4 py-1.5 text-xs font-bold text-stone-700 hover:bg-stone-50 transition-colors"
                        >
                          {demoAltName === alt.name ? "Hide Demo" : "▶ View Demo"}
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

function MetricLarge({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/80 text-center">
      <p className="text-[10px] uppercase tracking-widest font-black text-stone-400 mb-1">{label}</p>
      <p className="text-xl font-black text-stone-900 font-mono">{value}</p>
    </div>
  );
}

function Pill({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-bold text-stone-700">
      <Icon className="h-3.5 w-3.5 text-blue-600" />
      <span>{label}</span>
    </div>
  );
}

const sectionVariants = {
  blue:  { border: "border-blue-200",  bg: "bg-blue-50/40",  icon: "text-blue-600",  title: "text-blue-900"  },
  amber: { border: "border-amber-200", bg: "bg-amber-50/40", icon: "text-amber-600", title: "text-amber-900" },
  rose:  { border: "border-rose-200",  bg: "bg-rose-50/40",  icon: "text-rose-600",  title: "text-rose-900"  },
  slate: { border: "border-stone-200", bg: "bg-stone-50",    icon: "text-stone-700",  title: "text-stone-900" },
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
    <section className={`rounded-2xl border ${v.border} ${v.bg} p-4`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`h-4 w-4 ${v.icon}`} />
        <h3 className={`text-xs font-black uppercase tracking-wider ${v.title}`}>{title}</h3>
      </div>
      {children}
    </section>
  );
}
