"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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
  Sparkles,
  Zap,
  Heart,
  Timer,
  BarChart3,
  Scale,
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
  { short: "Tue", full: "Tuesday", isWorkout: false, label: "Rest & Mobility" },
  { short: "Wed", full: "Wednesday", isWorkout: true, label: "Core & Stability" },
  { short: "Thu", full: "Thursday", isWorkout: false, label: "Active Recovery" },
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
      <div className="min-h-screen bg-[#fbf5f0] flex flex-col">
        <Navbar />
        <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8 animate-pulse">
          <div className="h-96 w-full rounded-3xl bg-slate-200/80" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-44 rounded-3xl bg-slate-200/80" />
            <div className="h-44 rounded-3xl bg-slate-200/80" />
            <div className="h-44 rounded-3xl bg-slate-200/80" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 h-96 rounded-3xl bg-slate-200/80" />
            <div className="h-96 rounded-3xl bg-slate-200/80" />
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
  const totalWorkoutDays = workoutDays.length || 7;

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

  // Overall Daily Readiness / Compliance Score
  const checklistPoints = (checklist.workout ? 40 : 0) + (checklist.protein ? 35 : 0) + (waterCups >= 8 ? 25 : (waterCups / 8) * 25);
  const readinessScore = Math.min(Math.round(checklistPoints), 100);

  // User initials for athletic profile badge
  const nameParts = (dashboard.userName || "Josephine Santander").trim().split(" ");
  const initials = nameParts.length > 1 ? `${nameParts[0][0]}${nameParts[1][0]}` : nameParts[0].slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-[#fbf5f0] text-slate-900 flex flex-col selection:bg-blue-500 selection:text-white">
      <Navbar />
      <AIChat />

      <main className="flex-grow py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
        {/* ─── 1. Athlete Header & Status Pill ─── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200/70">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-stone-900 to-stone-800 text-white flex items-center justify-center font-black text-sm tracking-wider shadow-md shadow-stone-900/10 border border-stone-700/50">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-widest text-blue-600">
                  Athlete Hub
                </span>
                <span className="text-stone-300">&bull;</span>
                <span className="text-xs font-semibold text-stone-500">
                  {todayFormatted}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-stone-900">
                Welcome back, {nameParts[0]}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={openAIChat}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white hover:bg-stone-50 text-stone-800 border border-stone-200 text-xs font-black shadow-xs transition-all active:scale-95"
            >
              <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
              <span>Ask Coach Strive</span>
            </button>
            <Link
              href="/workouts/generate"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-black transition-all active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>AI Plan Builder</span>
            </Link>
          </div>
        </div>

        {/* ─── 2. CINEMATIC HERO: Today's Featured Workout (Nike Training Club / Apple Fitness+ Style) ─── */}
        <div className="relative rounded-3xl overflow-hidden shadow-xl border border-stone-900/10 min-h-[380px] sm:min-h-[420px] flex items-end">
          {/* Background Photography with Depth Overlays */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/workout_hero.jpg"
              alt="Athlete workout hero"
              fill
              priority
              className="object-cover object-center transform hover:scale-105 transition-transform duration-700 ease-out"
              sizes="(max-width: 1280px) 100vw, 1280px"
            />
            {/* Multi-stop cinematic gradient to ensure perfect editorial text legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/25" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
          </div>

          {/* Hero Content Overlay */}
          <div className="relative z-10 p-6 sm:p-10 w-full max-w-3xl space-y-4">
            {/* Top Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-black tracking-wider uppercase shadow-md shadow-blue-500/30">
                <Flame className="w-3.5 h-3.5 fill-white" />
                Featured Session &bull; Day {workoutDayNumber}
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-bold border border-white/20">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                {profile.workoutExperience || "Intermediate"} Intensity
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-bold border border-white/20">
                <Target className="w-3.5 h-3.5 text-blue-300" />
                {profile.targetBodyFocus || "Core & Balance"}
              </span>
            </div>

            {/* Title & Description */}
            <div>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                {activeWorkoutDay?.focus ? `${activeWorkoutDay.focus} Protocol` : "Core & Dynamic Stability Protocol"}
              </h2>
              <p className="mt-2 text-stone-300 text-sm sm:text-base font-medium max-w-xl leading-relaxed">
                Build core stiffness, rotational endurance, and active hip stability with precision-targeted compound movements.
              </p>
            </div>

            {/* Telemetry Metrics Bar */}
            <div className="flex flex-wrap items-center gap-6 pt-1 text-white">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-black">~{profile.workoutDuration || 45} MIN</span>
                <span className="text-xs text-stone-400">Duration</span>
              </div>
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-black">~340 KCAL</span>
                <span className="text-xs text-stone-400">Est. Burn</span>
              </div>
              <div className="flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-black">{activeWorkoutDay?.exercises?.length || 6} MOVEMENTS</span>
                <span className="text-xs text-stone-400">Prescribed</span>
              </div>
            </div>

            {/* Interactive Hero CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href="/workouts"
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm shadow-lg shadow-blue-600/40 hover:shadow-blue-600/60 transition-all transform active:scale-95"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Start Workout Session</span>
              </Link>
              <Link
                href="/workouts"
                className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold text-sm border border-white/25 transition-all"
              >
                <span>Routine Blueprint</span>
                <ChevronRight className="w-4 h-4 text-stone-300" />
              </Link>
            </div>
          </div>
        </div>

        {/* ─── 3. WEARABLE BIOMETRICS & ACTIVITY RING TELEMETRY HUB ─── */}
        {/* Replaces the standard 4-box AI cliché with an integrated high-performance wearable telemetry strip */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 3A. Concentric Activity Rings Card (Apple Watch / Whoop Style) */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-3xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-stone-100 text-stone-900">
                  <Activity className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-stone-900">
                    Daily Discipline Telemetry
                  </h3>
                  <p className="text-[11px] text-stone-500">Live compliance & habit rings</p>
                </div>
              </div>
              <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {readinessScore}% Score
              </span>
            </div>

            {/* Visual SVG Activity Rings */}
            <div className="py-6 flex items-center justify-around gap-4">
              <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  {/* Outer Ring: Workout Completion (Coral) */}
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#f3ebe4" strokeWidth="8" />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="#ed4f28"
                    strokeWidth="8"
                    strokeDasharray="314"
                    strokeDashoffset={checklist.workout ? "0" : "200"}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                  {/* Middle Ring: Nutrition & Protein (Emerald) */}
                  <circle cx="60" cy="60" r="38" fill="none" stroke="#f3ebe4" strokeWidth="8" />
                  <circle
                    cx="60"
                    cy="60"
                    r="38"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="8"
                    strokeDasharray="238"
                    strokeDashoffset={checklist.protein ? "0" : "120"}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                  {/* Inner Ring: Hydration (Cyan) */}
                  <circle cx="60" cy="60" r="26" fill="none" stroke="#f3ebe4" strokeWidth="8" />
                  <circle
                    cx="60"
                    cy="60"
                    r="26"
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="8"
                    strokeDasharray="163"
                    strokeDashoffset={`${Math.max(163 - (waterCups / 10) * 163, 0)}`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                {/* Center score icon */}
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <Flame className="w-5 h-5 text-blue-600 fill-blue-500 animate-pulse" />
                  <span className="text-xs font-black text-stone-900 mt-0.5">{readinessScore}%</span>
                </div>
              </div>

              {/* Ring Legends */}
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-[#ed4f28] shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-stone-900">Training Session</p>
                    <p className="text-[11px] text-stone-400">
                      {checklist.workout ? "Completed today" : "Ready to start"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-[#10b981] shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-stone-900">Protein Target</p>
                    <p className="text-[11px] text-stone-400">{targetProtein}g daily goal</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-[#06b6d4] shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-stone-900">Hydration Volume</p>
                    <p className="text-[11px] text-stone-400">{(waterCups * 0.25).toFixed(1)}L of 2.5L</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
              <span className="text-stone-500 font-semibold">Streak Discipline</span>
              <span className="font-black text-stone-900 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                {dashboard.workoutStreak} Consecutive Days
              </span>
            </div>
          </div>

          {/* 3B. Periodization Timeline & Biometric Vitality */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-3xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-stone-100 text-stone-900">
                    <Calendar className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-stone-900">
                      Weekly Periodization Schedule
                    </h3>
                    <p className="text-[11px] text-stone-500">
                      {profile.workoutDaysPerWeek || 4} Training days &bull; 3 Recovery days
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-stone-500">Cycle Week 1</span>
              </div>

              {/* Periodization Strip */}
              <div className="grid grid-cols-7 gap-2 pt-1">
                {DAYS_OF_WEEK.map((item, idx) => {
                  const isToday = idx === currentDayOfWeekIdx;
                  return (
                    <div
                      key={item.short}
                      className={`flex flex-col items-center justify-between py-3 px-1 rounded-2xl border text-center transition-all ${
                        isToday
                          ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/30 scale-[1.04]"
                          : "bg-stone-50/80 border-stone-200/80 text-stone-700 hover:bg-stone-100"
                      }`}
                    >
                      <span className={`text-[10px] font-black uppercase tracking-wider ${isToday ? "text-blue-100" : "text-stone-400"}`}>
                        {item.short}
                      </span>
                      <div className="my-2">
                        {item.isWorkout ? (
                          <div
                            className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                              isToday ? "bg-white text-blue-600 shadow-xs" : "bg-blue-50 text-blue-600"
                            }`}
                          >
                            <Dumbbell className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className={`w-2 h-2 rounded-full ${isToday ? "bg-white" : "bg-stone-300"}`} />
                        )}
                      </div>
                      <span className={`text-[9px] font-bold truncate max-w-full px-0.5 ${isToday ? "text-white" : "text-stone-500"}`}>
                        {item.label.split(" ")[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Vitality Telemetry Strip */}
            <div className="grid grid-cols-3 gap-3 pt-5 mt-5 border-t border-stone-100">
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70">
                <span className="text-[10px] font-black uppercase text-stone-400 tracking-wider flex items-center gap-1">
                  <Scale className="w-3 h-3 text-stone-500" /> Body Mass
                </span>
                <p className="text-xl font-black text-stone-900 mt-1">{userWeight} kg</p>
                <span className="text-[10px] font-bold text-emerald-600">BMI 19.5 (Optimal)</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70">
                <span className="text-[10px] font-black uppercase text-stone-400 tracking-wider flex items-center gap-1">
                  <Flame className="w-3 h-3 text-orange-500" /> Daily Target
                </span>
                <p className="text-xl font-black text-stone-900 mt-1">{targetCalories} kcal</p>
                <span className="text-[10px] font-bold text-stone-500">Maintenance & Fuel</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70">
                <span className="text-[10px] font-black uppercase text-stone-400 tracking-wider flex items-center gap-1">
                  <Award className="w-3 h-3 text-purple-500" /> Program Stage
                </span>
                <p className="text-xl font-black text-stone-900 mt-1">{completedWorkoutsCount}/{totalWorkoutDays}</p>
                <span className="text-[10px] font-bold text-blue-600">Phase 1 Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── 4. MAIN WORKOUT BLUEPRINT & FUEL RECIPES GRID ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT 7 COLS: Today's Exercise Blueprint */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
              <div className="p-6 sm:p-7 border-b border-stone-100 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 text-[11px] font-black uppercase tracking-wider border border-blue-200">
                      Day {workoutDayNumber} Sequence
                    </span>
                    <span className="text-xs font-bold text-stone-400">&bull; 6 Exercises</span>
                  </div>
                  <h3 className="text-xl font-black text-stone-900 tracking-tight">
                    {activeWorkoutDay?.focus || "Core & Dynamic Stability"}
                  </h3>
                </div>

                <Link
                  href="/workouts"
                  className="text-xs font-black text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <span>Full Workout Guide</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Movement Cards */}
              <div className="p-6 sm:p-7 space-y-3.5">
                {activeWorkoutDay?.exercises && activeWorkoutDay.exercises.length > 0 ? (
                  activeWorkoutDay.exercises.map((ex, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-stone-50/70 hover:bg-white border border-stone-200/70 hover:border-blue-300 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3.5">
                        <span className="w-8 h-8 rounded-xl bg-white group-hover:bg-blue-600 group-hover:text-white border border-stone-200 text-stone-800 font-mono font-black text-xs flex items-center justify-center shrink-0 shadow-2xs transition-colors">
                          0{idx + 1}
                        </span>
                        <div>
                          <p className="font-extrabold text-stone-900 text-sm group-hover:text-blue-600 transition-colors">
                            {ex.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] font-semibold text-stone-500">
                              {ex.targetMuscle || "Core & Stabilizers"}
                            </span>
                            <span className="text-stone-300">&bull;</span>
                            <span className="text-[10px] font-bold text-stone-400 uppercase">
                              60s Rest
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <span className="px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-xs font-bold text-stone-800 font-mono shadow-2xs">
                          {ex.sets || 3} SETS &times; {ex.reps || "12 REPS"}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center max-w-sm mx-auto">
                    <Dumbbell className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <h4 className="font-black text-stone-900 text-sm">No workout routine loaded</h4>
                    <p className="text-xs text-stone-500 mt-1 mb-4">
                      Create an AI-tailored plan matching your equipment and schedule.
                    </p>
                    <Link
                      href="/workouts/generate"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 text-white text-xs font-black shadow-sm"
                    >
                      <span>Generate Workout</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}

                <div className="pt-3 flex flex-col sm:flex-row items-center gap-3">
                  <Link
                    href="/workouts"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black shadow-md shadow-blue-600/30 transition-all active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Launch Guided Workout</span>
                  </Link>
                  <Link
                    href="/workouts"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-black transition-all"
                  >
                    <span>View Movement Demos</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* ─── EDITORIAL NUTRITION CARD (WITH GOURMET MEAL PHOTO) ─── */}
            <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-12">
                {/* Photo Side */}
                <div className="sm:col-span-5 relative min-h-[220px] sm:min-h-full">
                  <Image
                    src="/images/meal_prep.jpg"
                    alt="Chef curated meal prep bowl"
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 300px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent sm:hidden" />
                  <div className="absolute bottom-3 left-3 right-3 sm:hidden text-white">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-600">
                      Gourmet Fuel
                    </span>
                    <p className="text-sm font-black mt-1">High-Protein Athlete Nutrition</p>
                  </div>
                </div>

                {/* Macro Details Side */}
                <div className="sm:col-span-7 p-6 sm:p-7 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600">
                        Nutritional Blueprint
                      </span>
                      <h4 className="text-lg font-black text-stone-900">Today&apos;s Macro Target</h4>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-stone-100 text-stone-800 text-xs font-black font-mono">
                      {targetCalories} kcal
                    </span>
                  </div>

                  {/* Multi-segment Macro Bar */}
                  <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden flex shadow-inner">
                    <div className="bg-emerald-500 h-full w-[25%]" title="Protein 25%" />
                    <div className="bg-amber-500 h-full w-[45%]" title="Carbs 45%" />
                    <div className="bg-purple-500 h-full w-[30%]" title="Fats 30%" />
                  </div>

                  {/* Macro Numbers */}
                  <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                    <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                      <span className="text-[10px] font-black text-emerald-600 uppercase">Protein</span>
                      <p className="text-sm font-black text-stone-900 mt-0.5">{targetProtein}g</p>
                      <span className="text-[9px] text-stone-400 font-semibold">25% Split</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                      <span className="text-[10px] font-black text-amber-600 uppercase">Carbs</span>
                      <p className="text-sm font-black text-stone-900 mt-0.5">{targetCarbs}g</p>
                      <span className="text-[9px] text-stone-400 font-semibold">45% Split</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                      <span className="text-[10px] font-black text-purple-600 uppercase">Fats</span>
                      <p className="text-sm font-black text-stone-900 mt-0.5">{targetFats}g</p>
                      <span className="text-[9px] text-stone-400 font-semibold">30% Split</span>
                    </div>
                  </div>

                  {/* Action Link */}
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-xs text-stone-500 font-medium">
                      {profile.dietaryPreference || "High-Protein Balanced"} Protocol
                    </span>
                    <Link
                      href={mealPlan ? "/meals" : "/meals/generate"}
                      className="text-xs font-black text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                    >
                      <span>{mealPlan ? "View Recipes" : "Generate Meals"}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT 5 COLS: Coach Strive Accountability, Active Recovery, & Hydration */}
          <div className="lg:col-span-5 space-y-6">
            {/* ─── ACTIVE RECOVERY & MOBILITY CARD (WITH MOBILITY PHOTO) ─── */}
            <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
              <div className="relative h-44 w-full">
                <Image
                  src="/images/recovery_stretch.jpg"
                  alt="Recovery and mobility stretch"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 400px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-stone-800/80 border border-stone-700 backdrop-blur-md">
                    Active Recovery
                  </span>
                  <h4 className="text-base font-black mt-1">Post-Session Mobility Protocol</h4>
                  <p className="text-xs text-stone-300 font-medium">10-Minute hamstring & hip decompression</p>
                </div>
              </div>

              <div className="p-5 space-y-3">
                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-100 flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-orange-50 text-orange-600 mt-0.5">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-xs font-semibold text-stone-700 leading-relaxed">
                    Prioritize 3-second eccentric tempos today on core movements. Exhale fully during contraction to lock abdominal engagement.
                  </p>
                </div>
              </div>
            </div>

            {/* ─── DAILY DISCIPLINE CHECKLIST ─── */}
            <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-stone-100 text-stone-900">
                    <Target className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-stone-900">
                    Daily Discipline Targets
                  </h3>
                </div>
                <span className="text-xs font-bold text-stone-400">
                  {Object.values(checklist).filter(Boolean).length}/3 Cleared
                </span>
              </div>

              <div className="space-y-2 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => toggleChecklistItem("workout")}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
                    checklist.workout
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800 shadow-2xs"
                      : "bg-stone-50/70 border-stone-200/70 text-stone-700 hover:bg-stone-100"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                      checklist.workout
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "border-stone-300 bg-white"
                    }`}
                  >
                    {checklist.workout && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                  </div>
                  <span className={checklist.workout ? "line-through text-stone-400" : ""}>
                    Complete Day {workoutDayNumber} Core Workout
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleChecklistItem("protein")}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
                    checklist.protein
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800 shadow-2xs"
                      : "bg-stone-50/70 border-stone-200/70 text-stone-700 hover:bg-stone-100"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                      checklist.protein
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "border-stone-300 bg-white"
                    }`}
                  >
                    {checklist.protein && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                  </div>
                  <span className={checklist.protein ? "line-through text-stone-400" : ""}>
                    Hit {targetProtein}g Daily Protein Goal
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleChecklistItem("water")}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
                    checklist.water
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800 shadow-2xs"
                      : "bg-stone-50/70 border-stone-200/70 text-stone-700 hover:bg-stone-100"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                      checklist.water
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "border-stone-300 bg-white"
                    }`}
                  >
                    {checklist.water && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                  </div>
                  <span className={checklist.water ? "line-through text-stone-400" : ""}>
                    Log 2.5L Optimal Hydration
                  </span>
                </button>
              </div>
            </div>

            {/* ─── TACTILE HYDRATION MODULE ─── */}
            <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-100">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-stone-900">
                      Hydration Fuel
                    </h4>
                    <p className="text-[11px] text-stone-500">Target: 2.5 Liters</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {waterCups > 0 && (
                    <button
                      type="button"
                      onClick={resetWater}
                      title="Reset water counter"
                      className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={addWater}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-700 text-xs font-black transition-colors active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+250ml</span>
                  </button>
                </div>
              </div>

              {/* 10-Glass Visual Track */}
              <div className="grid grid-cols-10 gap-1.5 py-1">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-5 rounded-md transition-all ${
                      i < waterCups
                        ? "bg-cyan-500 shadow-xs shadow-cyan-500/30"
                        : "bg-stone-100 border border-stone-200/60"
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center justify-between text-xs font-bold text-stone-600">
                <span>{(waterCups * 0.25).toFixed(1)}L logged</span>
                <span className="text-stone-400">{waterCups} / 10 glasses</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
