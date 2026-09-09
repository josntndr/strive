"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { AIChat } from "@/components/ai/AIChat";
import {
  Dumbbell,
  Utensils,
  TrendingUp,
  CheckCircle2,
  Calendar,
  Award,
  Flame,
  ArrowRight,
  ChevronRight,
  Clock,
  Target,
  Activity,
  Check,
  Droplets,
  Plus,
  Play,
  RotateCcw,
  MessageSquare,
} from "lucide-react";
import { api, clearAuth, getCurrentUser, getToken, isUnauthorizedError } from "@/lib/api";
import { toast } from "react-hot-toast";

type FitnessProfile = {
  weight?: number;
  height?: number;
  age?: number;
  workoutExperience?: string;
  workoutLocation?: string;
  workoutDaysPerWeek?: number;
  workoutDuration?: number;
  targetBodyFocus?: string;
  dietaryPreference?: string;
  fitnessGoal?: string;
};

type Exercise = {
  name: string;
  sets?: number;
  reps?: string;
  targetMuscle?: string;
};

type PlanDay = {
  day?: string;
  focus?: string;
  exercises?: Exercise[];
  completed?: boolean;
  breakfast?: string;
  lunch?: string;
  dinner?: string;
  estimatedCalories?: number;
  estimatedProtein?: number;
};

type Plan = {
  planName?: string;
  days?: PlanDay[];
};

type DashboardData = {
  userName: string;
  currentFitnessGoal: string | null;
  latestWorkoutPlan?: Plan | null;
  latestMealPlan?: Plan | null;
  totalCompletedWorkouts: number;
  workoutStreak: number;
  mealCompletionCount: number;
  progressSummary: string;
  motivationalMessage: string;
  profile: FitnessProfile;
};

const DAYS_OF_WEEK = [
  { short: "Mon", full: "Monday", isWorkout: true, label: "Full Body" },
  { short: "Tue", full: "Tuesday", isWorkout: false, label: "Rest & Recovery" },
  { short: "Wed", full: "Wednesday", isWorkout: true, label: "Core & Stability" },
  { short: "Thu", full: "Thursday", isWorkout: false, label: "Active Rest" },
  { short: "Fri", full: "Friday", isWorkout: true, label: "Lower Body" },
  { short: "Sat", full: "Saturday", isWorkout: true, label: "Upper & Cardio" },
  { short: "Sun", full: "Sunday", isWorkout: false, label: "Rest" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [waterCups, setWaterCups] = useState(4); // 4 x 250ml = 1.0L
  const [checklist, setChecklist] = useState<{ workout: boolean; protein: boolean; water: boolean }>({
    workout: false,
    protein: false,
    water: false,
  });

  useEffect(() => {
    let isActive = true;

    const loadDashboard = async () => {
      if (!getToken()) {
        router.replace("/login");
        if (isActive) setIsLoading(false);
        return;
      }

      try {
        await getCurrentUser();
        const res = await api.get("/api/dashboard");
        if (!res.data.profile) {
          router.replace("/profile-setup");
          return;
        }
        if (isActive) setDashboard(res.data);
      } catch (error: unknown) {
        if (isUnauthorizedError(error)) {
          clearAuth();
          router.replace("/login");
          return;
        }

        toast.error("Failed to load dashboard");
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    loadDashboard();

    // Load local storage states
    try {
      const savedWater = localStorage.getItem("strive_daily_water");
      if (savedWater) setWaterCups(Number(savedWater));

      const savedChecklist = localStorage.getItem("strive_daily_checklist");
      if (savedChecklist) setChecklist(JSON.parse(savedChecklist));
    } catch {
      // ignore
    }

    return () => {
      isActive = false;
    };
  }, [router]);

  const addWater = () => {
    setWaterCups((prev) => {
      const next = Math.min(prev + 1, 10);
      try {
        localStorage.setItem("strive_daily_water", String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const resetWater = () => {
    setWaterCups(0);
    try {
      localStorage.setItem("strive_daily_water", "0");
    } catch {
      // ignore
    }
  };

  const toggleChecklistItem = (key: "workout" | "protein" | "water") => {
    setChecklist((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem("strive_daily_checklist", JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const openAIChat = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-ai-chat"));
    }
  };

  // Formatted date string
  const todayDate = new Date();
  const todayFormatted = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(todayDate);

  // Day of week index (0 = Mon, ..., 6 = Sun)
  const rawDayIndex = todayDate.getDay();
  const currentDayOfWeekIdx = rawDayIndex === 0 ? 6 : rawDayIndex - 1;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50/70 flex flex-col">
        <Navbar />
        <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="skeleton h-44 w-full rounded-2xl mb-6" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-28 rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="skeleton h-80 rounded-2xl" />
              <div className="skeleton h-72 rounded-2xl" />
            </div>
            <div className="space-y-6">
              <div className="skeleton h-56 rounded-2xl" />
              <div className="skeleton h-56 rounded-2xl" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!dashboard) return null;

  const profile = dashboard.profile || {};
  const workoutPlan = dashboard.latestWorkoutPlan;
  const mealPlan = dashboard.latestMealPlan;

  // Active workout day computation
  const workoutDays = workoutPlan?.days || [];
  const uncompletedWorkoutIndex = workoutDays.findIndex((d) => !d.completed);
  const activeWorkoutIndex = uncompletedWorkoutIndex !== -1 ? uncompletedWorkoutIndex : 0;
  const activeWorkoutDay = workoutDays[activeWorkoutIndex] || null;
  const workoutDayNumber = activeWorkoutIndex + 1;
  const completedWorkoutsCount = workoutDays.filter((d) => d.completed).length;
  const totalWorkoutDays = workoutDays.length || 1;

  // Active meal day computation
  const mealDays = mealPlan?.days || [];
  const uncompletedMealIndex = mealDays.findIndex((d) => !d.completed);
  const activeMealIndex = uncompletedMealIndex !== -1 ? uncompletedMealIndex : 0;
  const activeMealDay = mealDays[activeMealIndex] || null;
  const mealDayNumber = activeMealIndex + 1;

  // Estimated daily targets based on body weight
  const userWeight = profile.weight || 48;
  const targetCalories = Math.round(userWeight * 33);
  const targetProtein = Math.round(userWeight * 2.0);
  const targetCarbs = Math.round(userWeight * 3.5);
  const targetFats = Math.round(userWeight * 0.9);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col selection:bg-blue-500 selection:text-white">
      <Navbar />
      <AIChat />

      <main className="flex-grow py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* ─── 1. Executive Athlete Header Bar ─── */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200/80">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Active Training Cycle • {todayFormatted}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
              Welcome back, {dashboard.userName.split(" ")[0]}
            </h1>
            <p className="text-slate-600 text-sm font-medium mt-1">
              Week 1 &mdash; Scheduled focus: <strong className="text-slate-900">{activeWorkoutDay?.focus || "Core & Stability"}</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/workouts"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-black shadow-md shadow-blue-500/20 active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Session</span>
            </Link>
            <button
              type="button"
              onClick={openAIChat}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 text-sm font-bold shadow-2xs transition-all"
            >
              <MessageSquare className="w-4 h-4 text-slate-500" />
              <span>Ask Coach</span>
            </button>
          </div>
        </div>

        {/* ─── 2. Weekly Training Schedule Timeline Strip ─── */}
        <div className="mb-8 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                Weekly Rhythm
              </span>
            </div>
            <span className="text-xs font-bold text-slate-500">
              {profile.workoutDaysPerWeek || 4} Sessions Planned This Week
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {DAYS_OF_WEEK.map((item, idx) => {
              const isToday = idx === currentDayOfWeekIdx;
              return (
                <div
                  key={item.short}
                  className={`flex flex-col items-center justify-between py-3 px-1.5 rounded-xl border text-center transition-all ${
                    isToday
                      ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20 scale-[1.03]"
                      : "bg-slate-50/70 border-slate-200/70 text-slate-700 hover:bg-white"
                  }`}
                >
                  <span className={`text-[11px] font-black uppercase tracking-wider ${isToday ? "text-blue-100" : "text-slate-400"}`}>
                    {item.short}
                  </span>

                  <div className="my-1.5">
                    {item.isWorkout ? (
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          isToday ? "bg-white text-blue-600 font-black text-xs" : "bg-blue-50 text-blue-600 border border-blue-100"
                        }`}
                      >
                        <Dumbbell className="w-3.5 h-3.5" />
                      </div>
                    ) : (
                      <div className={`w-2 h-2 rounded-full ${isToday ? "bg-white/70" : "bg-slate-300"}`} />
                    )}
                  </div>

                  <span className={`text-[10px] font-bold truncate max-w-full px-1 ${isToday ? "text-white" : "text-slate-500"}`}>
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── 3. High-Density Performance Metric Ribbon ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Metric 1: Streak */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-blue-200 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Streak</span>
              <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">{dashboard.workoutStreak}</span>
              <span className="text-xs font-bold text-slate-500">days</span>
            </div>
            <p className="text-[11px] font-semibold text-slate-500 mt-1">
              {dashboard.workoutStreak > 0 ? "Daily discipline active" : "Day 1 ready to start"}
            </p>
          </div>

          {/* Metric 2: Completed Workouts */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-emerald-200 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Completed</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">{dashboard.totalCompletedWorkouts}</span>
              <span className="text-xs font-bold text-slate-500">of {totalWorkoutDays} in plan</span>
            </div>
            <div className="mt-1.5 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{ width: `${(completedWorkoutsCount / totalWorkoutDays) * 100}%` }}
              />
            </div>
          </div>

          {/* Metric 3: Weight */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-blue-200 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Weight</span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">{profile.weight || 48}</span>
              <span className="text-xs font-bold text-slate-500">kg</span>
            </div>
            <p className="text-[11px] font-semibold text-slate-500 mt-1">
              Height: {profile.height || 157} cm &bull; BMI 19.5
            </p>
          </div>

          {/* Metric 4: Pace */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-purple-200 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fitness Level</span>
              <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 capitalize">
                {profile.workoutExperience || "Intermediate"}
              </span>
            </div>
            <p className="text-[11px] font-semibold text-slate-500 mt-1">
              Target ~{profile.workoutDuration || 60}m sessions
            </p>
          </div>
        </div>

        {/* ─── 4. Main Two-Column Hub ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left / Center (2 cols) */}
          <div className="lg:col-span-2 space-y-8">
            {/* ─── Today's Workout Session Player ─── */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-black uppercase tracking-wider border border-blue-200/70">
                      Day {workoutDayNumber} of {totalWorkoutDays}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      &bull; {activeWorkoutDay?.completed ? "Completed" : "Scheduled Today"}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    {activeWorkoutDay?.focus || "Core & Stability Routine"}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-blue-600" />
                    <span>{activeWorkoutDay?.exercises?.length || 6} Movements</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>~{profile.workoutDuration || 45}m</span>
                  </div>
                </div>
              </div>

              {/* Workout Routine Timeline */}
              <div className="p-6">
                {activeWorkoutDay?.exercises && activeWorkoutDay.exercises.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                      <span>Movement Sequence</span>
                      <span>Target Work</span>
                    </div>

                    <div className="space-y-2">
                      {activeWorkoutDay.exercises.map((ex, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-slate-50/70 hover:bg-white border border-slate-200/60 hover:border-blue-200 hover:shadow-2xs transition-all flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-md bg-white border border-slate-200 text-slate-700 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                              {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                            </span>
                            <div>
                              <p className="font-bold text-slate-900 text-sm">{ex.name}</p>
                              <span className="text-[11px] font-semibold text-slate-500">
                                {ex.targetMuscle || "Core & Stabilizers"}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200/80 text-xs font-bold text-slate-800 font-mono">
                              {ex.sets || 3} sets &times; {ex.reps || "12 reps"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
                      <Link
                        href="/workouts"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-black shadow-md shadow-blue-500/25 active:scale-95 transition-all"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        <span>Start Workout Session</span>
                      </Link>
                      <Link
                        href="/workouts"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition-all"
                      >
                        <span>View Exercise Demos</span>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center max-w-sm mx-auto">
                    <Dumbbell className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <h3 className="font-black text-slate-900 text-base">No active workout plan</h3>
                    <p className="text-xs text-slate-500 mt-1 mb-4">
                      Create your personalized training program tailored to your goals.
                    </p>
                    <Link
                      href="/workouts/generate"
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-black shadow-sm"
                    >
                      <span>Generate Workout Plan</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* ─── Nutrition & Fuel Engine ─── */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                    <Utensils className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900 tracking-tight">Today&apos;s Nutrition & Macro Targets</h2>
                    <p className="text-xs text-slate-500 font-medium">Daily nutritional fuel for {userWeight}kg body weight</p>
                  </div>
                </div>

                <Link
                  href={mealPlan ? "/meals" : "/meals/generate"}
                  className="text-xs font-black text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                >
                  <span>{mealPlan ? "Open Plan" : "Generate Plan"}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="p-6 space-y-6">
                {/* Visual Macro Bar & Targets */}
                <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                      Macro Split ({profile.dietaryPreference || "Budget Friendly"} Diet)
                    </span>
                    <span className="text-xs font-black text-slate-900">{targetCalories} kcal Target</span>
                  </div>

                  {/* Multi-segment proportional bar */}
                  <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden flex">
                    <div className="bg-emerald-500 h-full w-[25%]" title="Protein 25%" />
                    <div className="bg-amber-500 h-full w-[45%]" title="Carbs 45%" />
                    <div className="bg-purple-500 h-full w-[30%]" title="Healthy Fats 30%" />
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-1">
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200/80">
                      <span className="text-[10px] font-black uppercase text-emerald-700">Protein (25%)</span>
                      <p className="text-base font-black text-slate-900 mt-0.5">{targetProtein}g</p>
                      <span className="text-[10px] text-slate-400 font-medium">2.0g per kg</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200/80">
                      <span className="text-[10px] font-black uppercase text-amber-700">Carbs (45%)</span>
                      <p className="text-base font-black text-slate-900 mt-0.5">{targetCarbs}g</p>
                      <span className="text-[10px] text-slate-400 font-medium">clean fuel</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200/80">
                      <span className="text-[10px] font-black uppercase text-purple-700">Fats (30%)</span>
                      <p className="text-base font-black text-slate-900 mt-0.5">{targetFats}g</p>
                      <span className="text-[10px] text-slate-400 font-medium">vital balance</span>
                    </div>
                  </div>
                </div>

                {/* Meals timeline or generate card */}
                {mealPlan && activeMealDay ? (
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Day {mealDayNumber} Meals
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {activeMealDay.breakfast && (
                        <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                          <span className="text-[11px] font-black text-emerald-700 uppercase">Breakfast</span>
                          <p className="text-xs font-bold text-slate-800 mt-1 line-clamp-2">{activeMealDay.breakfast}</p>
                        </div>
                      )}
                      {activeMealDay.lunch && (
                        <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                          <span className="text-[11px] font-black text-emerald-700 uppercase">Lunch</span>
                          <p className="text-xs font-bold text-slate-800 mt-1 line-clamp-2">{activeMealDay.lunch}</p>
                        </div>
                      )}
                      {activeMealDay.dinner && (
                        <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                          <span className="text-[11px] font-black text-emerald-700 uppercase">Dinner</span>
                          <p className="text-xs font-bold text-slate-800 mt-1 line-clamp-2">{activeMealDay.dinner}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">Custom Meal Recipes</h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Get chef-crafted breakfast, lunch, and dinner recipes matched to your {targetCalories} kcal goal.
                      </p>
                    </div>
                    <Link
                      href="/meals/generate"
                      className="whitespace-nowrap inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-sm"
                    >
                      <span>Generate Recipes</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column (Sidebar) */}
          <div className="space-y-6">
            {/* ─── Daily Coach Briefing ─── */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                    <Target className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Coach Note</h3>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Daily Tip
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                  Focus on strict pelvic stability and a 3-second eccentric tempo on core movements today. Keep breathing steady through every repetition.
                </p>
              </div>

              {/* Interactive Daily Checklist */}
              <div className="space-y-2">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Today&apos;s Targets</p>
                <div className="space-y-1.5 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => toggleChecklistItem("workout")}
                    className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                      checklist.workout ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${checklist.workout ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300"}`}>
                      {checklist.workout && <Check className="w-3 h-3" strokeWidth={3} />}
                    </div>
                    <span className={checklist.workout ? "line-through text-slate-400" : ""}>
                      Day 1 Core Workout
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleChecklistItem("protein")}
                    className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                      checklist.protein ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${checklist.protein ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300"}`}>
                      {checklist.protein && <Check className="w-3 h-3" strokeWidth={3} />}
                    </div>
                    <span className={checklist.protein ? "line-through text-slate-400" : ""}>
                      Hit {targetProtein}g Protein Goal
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleChecklistItem("water")}
                    className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                      checklist.water ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${checklist.water ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300"}`}>
                      {checklist.water && <Check className="w-3 h-3" strokeWidth={3} />}
                    </div>
                    <span className={checklist.water ? "line-through text-slate-400" : ""}>
                      Hydrate 2.5L Water
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* ─── Daily Hydration Module ─── */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Hydration Log</h3>
                    <p className="text-[11px] text-slate-500">Target: 2.5 Liters</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {waterCups > 0 && (
                    <button
                      type="button"
                      onClick={resetWater}
                      title="Reset water counter"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={addWater}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-700 text-xs font-black transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+250ml</span>
                  </button>
                </div>
              </div>

              {/* 10-glass visual bar */}
              <div className="grid grid-cols-10 gap-1.5 py-1">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-5 rounded-md transition-all ${
                      i < waterCups
                        ? "bg-cyan-500 shadow-xs shadow-cyan-500/30"
                        : "bg-slate-100 border border-slate-200/60"
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                <span>{(waterCups * 0.25).toFixed(1)}L logged</span>
                <span className="text-slate-400">{waterCups} / 10 glasses</span>
              </div>
            </div>

            {/* ─── Quick Navigation Launcher ─── */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 px-1">
                Shortcuts
              </h3>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { label: "Workouts", href: "/workouts", icon: Dumbbell, color: "text-blue-600 bg-blue-50" },
                  { label: "Meal Plan", href: "/meals", icon: Utensils, color: "text-emerald-600 bg-emerald-50" },
                  { label: "Progress", href: "/progress", icon: TrendingUp, color: "text-amber-600 bg-amber-50" },
                  { label: "Settings", href: "/settings", icon: Award, color: "text-purple-600 bg-purple-50" },
                ].map((action, idx) => (
                  <Link
                    key={idx}
                    href={action.href}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50/70 hover:bg-white border border-slate-200/60 hover:border-slate-300 hover:shadow-2xs transition-all text-xs font-bold text-slate-800 group"
                  >
                    <div className={`p-1.5 rounded-lg ${action.color} group-hover:scale-105 transition-transform`}>
                      <action.icon className="w-4 h-4" />
                    </div>
                    <span>{action.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
