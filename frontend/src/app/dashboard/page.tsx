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
  Sparkles,
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

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function DashboardPage() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [waterCups, setWaterCups] = useState(4); // 4 x 250ml = 1.0L default
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
          <div className="skeleton h-56 w-full rounded-3xl mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-32 rounded-3xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="skeleton h-80 rounded-3xl" />
              <div className="skeleton h-80 rounded-3xl" />
            </div>
            <div className="space-y-8">
              <div className="skeleton h-60 rounded-3xl" />
              <div className="skeleton h-60 rounded-3xl" />
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

  // Split targets and take top 4 distinct tags to avoid run-on sentence
  const rawGoals = dashboard.currentFitnessGoal
    ? dashboard.currentFitnessGoal
        .split(",")
        .map((g) => g.trim())
        .filter(Boolean)
    : ["Improve overall fitness"];
  const goalsList = Array.from(new Set(rawGoals));

  // Active workout day computation
  const workoutDays = workoutPlan?.days || [];
  const uncompletedWorkoutIndex = workoutDays.findIndex((d) => !d.completed);
  const activeWorkoutIndex = uncompletedWorkoutIndex !== -1 ? uncompletedWorkoutIndex : 0;
  const activeWorkoutDay = workoutDays[activeWorkoutIndex] || null;
  const workoutDayNumber = activeWorkoutIndex + 1;
  const completedWorkoutsCount = workoutDays.filter((d) => d.completed).length;
  const totalWorkoutDays = workoutDays.length;

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
    <div className="min-h-screen bg-slate-50/70 flex flex-col selection:bg-blue-500 selection:text-white">
      <Navbar />
      <AIChat />

      <main className="flex-grow py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* ─── 1. Athlete Command Center Banner (Dark Luxury Contrast) ─── */}
        <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 sm:p-8 text-white border border-slate-800 shadow-xl">
          {/* Subtle warm radial aura */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-gradient-to-br from-[#e0512c]/25 to-amber-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 left-1/4 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              {/* Header tags */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-black uppercase tracking-wider border border-white/15 backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                  Active Program
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 text-slate-300 text-xs font-semibold border border-white/10">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {todayFormatted}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Week 1 on Track
                </span>
              </div>

              {/* Greeting */}
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                  Welcome back, {dashboard.userName}
                </h1>
                <p className="text-slate-300 font-medium text-sm sm:text-base mt-1">
                  Ready for today&apos;s session? Stay consistent and build momentum.
                </p>
              </div>

              {/* Clean Goal Tags */}
              <div className="pt-1 flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Targets:</span>
                {goalsList.slice(0, 4).map((goal, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white border border-white/15"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                    {goal}
                  </span>
                ))}
                {goalsList.length > 4 && (
                  <span className="text-xs font-semibold text-slate-400 self-center">
                    +{goalsList.length - 4} more
                  </span>
                )}
              </div>
            </div>

            {/* Weekly Schedule Strip */}
            <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 flex flex-col gap-3 min-w-[270px] self-start lg:self-auto">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-300">Weekly Schedule</span>
                <span className="text-xs font-extrabold text-orange-400">
                  {profile.workoutDaysPerWeek || 3} Days Planned
                </span>
              </div>

              {/* 7-day calendar row */}
              <div className="grid grid-cols-7 gap-1.5 pt-1">
                {DAYS_OF_WEEK.map((day, idx) => {
                  const isToday = idx === currentDayOfWeekIdx;
                  const isWorkoutDay = idx === 0 || idx === 2 || idx === 4;
                  return (
                    <div
                      key={day}
                      className={`flex flex-col items-center py-2 rounded-xl text-center transition-all ${
                        isToday
                          ? "bg-gradient-to-t from-[#e0512c] to-orange-500 text-white shadow-md font-black ring-2 ring-white/30"
                          : "bg-white/5 text-slate-300 border border-white/5 font-bold"
                      }`}
                    >
                      <span className={`text-[10px] uppercase ${isToday ? "text-white" : "text-slate-400"}`}>
                        {day}
                      </span>
                      <div className="mt-1 flex items-center justify-center">
                        {isWorkoutDay ? (
                          <div className={`w-2 h-2 rounded-full ${isToday ? "bg-white" : "bg-orange-400"}`} />
                        ) : (
                          <div className={`w-1 h-1 rounded-full ${isToday ? "bg-white/60" : "bg-white/20"}`} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium pt-0.5 border-t border-white/10">
                <span>Focus: <strong className="text-white">{profile.targetBodyFocus || "Full body"}</strong></span>
                <span>{profile.workoutLocation || "Gym & Home"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── 2. 4 Elevated Bento Metric Cards ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {/* Card 1: Workout Streak */}
          <div className="stat-card bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:border-orange-300 transition-all group">
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-2xl bg-orange-50 text-orange-600 border border-orange-100 group-hover:scale-105 transition-transform">
                <Flame className="w-5 h-5" strokeWidth={2.2} />
              </div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-100">
                {dashboard.workoutStreak > 0 ? "Active Streak" : "Day 1 Ready"}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Workout Streak</p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-3xl font-black text-slate-900 tracking-tight">{dashboard.workoutStreak}</span>
                <span className="text-sm font-bold text-slate-500">days</span>
              </div>
              <div className="mt-2 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-orange-500 h-full rounded-full transition-all"
                  style={{ width: `${Math.min((dashboard.workoutStreak / 7) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1.5">
                {dashboard.workoutStreak > 0 ? "Great habit! Keep the momentum." : "Complete today to start your streak."}
              </p>
            </div>
          </div>

          {/* Card 2: Completed Workouts */}
          <div className="stat-card bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-all group">
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 group-hover:scale-105 transition-transform">
                <CheckCircle2 className="w-5 h-5" strokeWidth={2.2} />
              </div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                Sessions
              </span>
            </div>
            <div className="mt-4">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Completed Workouts</p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-3xl font-black text-slate-900 tracking-tight">{dashboard.totalCompletedWorkouts}</span>
                <span className="text-sm font-bold text-slate-500">total</span>
              </div>
              <div className="mt-2 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all"
                  style={{ width: totalWorkoutDays > 0 ? `${(completedWorkoutsCount / totalWorkoutDays) * 100}%` : "0%" }}
                />
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1.5">
                {completedWorkoutsCount} of {totalWorkoutDays} in active plan
              </p>
            </div>
          </div>

          {/* Card 3: Current Weight */}
          <div className="stat-card bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:border-blue-300 transition-all group">
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 group-hover:scale-105 transition-transform">
                <TrendingUp className="w-5 h-5" strokeWidth={2.2} />
              </div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                {profile.height ? `${profile.height} cm` : "Metric"}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Current Weight</p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-3xl font-black text-slate-900 tracking-tight">
                  {profile.weight ? profile.weight : "--"}
                </span>
                <span className="text-sm font-bold text-slate-500">kg</span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-2">
                BMI 19.5 • Healthy range
              </p>
            </div>
          </div>

          {/* Card 4: Fitness Level */}
          <div className="stat-card bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:border-purple-300 transition-all group">
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 group-hover:scale-105 transition-transform">
                <Award className="w-5 h-5" strokeWidth={2.2} />
              </div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                Level
              </span>
            </div>
            <div className="mt-4">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Fitness Level</p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight capitalize">
                  {profile.workoutExperience || "Beginner"}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-2">
                {profile.workoutDuration ? `Target ${profile.workoutDuration}m sessions` : "Paced intensity"}
              </p>
            </div>
          </div>
        </div>

        {/* ─── 3. Main Content Grid ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (2 cols) */}
          <div className="lg:col-span-2 space-y-8">
            {/* ─── Today's Workout Card ─── */}
            <div className="dashboard-card rounded-3xl overflow-hidden shadow-xs">
              {/* Header */}
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-xs">
                    <Dumbbell className="w-5 h-5" strokeWidth={2.2} />
                  </div>
                  <div>
                    <h2 className="font-black text-slate-900 text-base sm:text-lg tracking-tight">Today&apos;s Workout</h2>
                    <p className="text-xs text-slate-500 font-medium">Daily training routine</p>
                  </div>
                </div>

                <Link
                  href="/workouts"
                  className="text-xs font-black text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                >
                  <span>View Full Program</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Body */}
              <div className="p-6 sm:p-8">
                {workoutPlan && activeWorkoutDay ? (
                  <div className="space-y-6">
                    {/* Session Focus Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-50 to-orange-50/40 border border-slate-200/70">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-black text-xs uppercase tracking-wider border border-blue-200/70">
                            Day {workoutDayNumber} of {totalWorkoutDays}
                          </span>
                          {activeWorkoutDay.completed ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Completed Today
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-orange-50 text-orange-700 font-bold text-xs border border-orange-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                              Ready to Start
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-2">
                          {activeWorkoutDay.focus ? `${activeWorkoutDay.focus} Routine` : "Core & Strength"}
                        </h3>
                      </div>

                      {/* Stat pills */}
                      <div className="flex items-center gap-2 self-start sm:self-center">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200/80 text-slate-700 text-xs font-bold shadow-2xs">
                          <Activity className="w-4 h-4 text-blue-600" />
                          <span>{activeWorkoutDay.exercises?.length || 6} Movements</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200/80 text-slate-700 text-xs font-bold shadow-2xs">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span>~{profile.workoutDuration || 45} mins</span>
                        </div>
                      </div>
                    </div>

                    {/* Featured Exercises List */}
                    {activeWorkoutDay.exercises && activeWorkoutDay.exercises.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Exercise Routine Breakdown
                          </span>
                          <span className="text-xs font-semibold text-slate-500">
                            Target Sets & Reps
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {activeWorkoutDay.exercises.slice(0, 4).map((ex, idx) => (
                            <div
                              key={idx}
                              className="p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-200 hover:shadow-xs transition-all flex items-start justify-between gap-3"
                            >
                              <div className="flex items-start gap-2.5">
                                <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-700 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                                  {idx + 1}
                                </span>
                                <div>
                                  <p className="font-black text-slate-900 text-sm leading-snug">{ex.name}</p>
                                  <span className="inline-block text-[11px] font-semibold text-slate-400 mt-0.5">
                                    {ex.targetMuscle || "Core / Stability"}
                                  </span>
                                </div>
                              </div>
                              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-extrabold text-xs whitespace-nowrap">
                                {ex.sets || 3} × {ex.reps || "12"}
                              </span>
                            </div>
                          ))}
                        </div>

                        {activeWorkoutDay.exercises.length > 4 && (
                          <div className="text-center py-1">
                            <span className="text-xs font-semibold text-slate-500">
                              +{activeWorkoutDay.exercises.length - 4} more exercises in full sequence
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* CTA Actions */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                      <Link
                        href="/workouts"
                        className="complete-btn w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 text-white text-sm font-black rounded-2xl shadow-md active:scale-95"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        <span>{activeWorkoutDay.completed ? "Review Completed Session" : `Start Day ${workoutDayNumber} Workout`}</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>

                      <Link
                        href="/workouts"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-6 py-3.5 text-slate-700 text-sm font-bold rounded-2xl bg-slate-100 hover:bg-slate-200 transition-colors"
                      >
                        Full Program ({completedWorkoutsCount}/{totalWorkoutDays} done)
                      </Link>
                    </div>
                  </div>
                ) : (
                  /* Empty state */
                  <div className="py-8 text-center max-w-md mx-auto">
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <Dumbbell className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 mb-1.5 tracking-tight">Your Workout Program</h3>
                    <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                      Generate a personalized training split based on your fitness level and weekly schedule.
                    </p>
                    <Link
                      href="/workouts/generate"
                      className="complete-btn inline-flex items-center gap-2 px-8 py-3.5 text-white text-sm font-black rounded-2xl shadow-md active:scale-95"
                    >
                      <span>Create Workout Routine</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* ─── Today's Fuel & Nutrition Card ─── */}
            <div className="dashboard-card rounded-3xl overflow-hidden shadow-xs">
              {/* Header */}
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-xs">
                    <Utensils className="w-5 h-5" strokeWidth={2.2} />
                  </div>
                  <div>
                    <h2 className="font-black text-slate-900 text-base sm:text-lg tracking-tight">Today&apos;s Nutrition & Fuel</h2>
                    <p className="text-xs text-slate-500 font-medium">Daily calorie & macro targets</p>
                  </div>
                </div>

                <Link
                  href={mealPlan ? "/meals" : "/meals/generate"}
                  className="text-xs font-black text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition-colors"
                >
                  <span>{mealPlan ? "View Meal Plan" : "Generate Plan"}</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Body */}
              <div className="p-6 sm:p-8 space-y-6">
                {/* Macro Split Breakdown */}
                <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                        Target Macros ({profile.dietaryPreference || "Budget Friendly"} Diet)
                      </span>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">Calibrated for {userWeight}kg body weight</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-white text-slate-800 text-xs font-black border border-slate-200 shadow-2xs">
                      {targetCalories} kcal / day
                    </span>
                  </div>

                  {/* Visual multi-segment macro bar */}
                  <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden flex">
                    <div className="bg-emerald-500 h-full w-[25%]" title="Protein 25%" />
                    <div className="bg-amber-500 h-full w-[45%]" title="Carbs 45%" />
                    <div className="bg-purple-500 h-full w-[30%]" title="Fats 30%" />
                  </div>

                  {/* 4 Macro Metric Badges */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200/80">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Calories</span>
                      <p className="text-lg font-black text-slate-900 mt-0.5">{targetCalories}</p>
                      <span className="text-[10px] text-slate-500 font-semibold">kcal daily goal</span>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200/80">
                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Protein (25%)</span>
                      <p className="text-lg font-black text-slate-900 mt-0.5">{targetProtein}g</p>
                      <span className="text-[10px] text-slate-500 font-semibold">2.0g per kg</span>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200/80">
                      <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Carbs (45%)</span>
                      <p className="text-lg font-black text-slate-900 mt-0.5">{targetCarbs}g</p>
                      <span className="text-[10px] text-slate-500 font-semibold">clean energy</span>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200/80">
                      <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Fats (30%)</span>
                      <p className="text-lg font-black text-slate-900 mt-0.5">{targetFats}g</p>
                      <span className="text-[10px] text-slate-500 font-semibold">vital balance</span>
                    </div>
                  </div>
                </div>

                {mealPlan && activeMealDay ? (
                  <div className="space-y-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Day {mealDayNumber} Meals
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {activeMealDay.breakfast && (
                        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                          <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Breakfast</p>
                          <p className="text-xs font-extrabold text-slate-800 mt-1 line-clamp-2">{activeMealDay.breakfast}</p>
                        </div>
                      )}
                      {activeMealDay.lunch && (
                        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                          <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Lunch</p>
                          <p className="text-xs font-extrabold text-slate-800 mt-1 line-clamp-2">{activeMealDay.lunch}</p>
                        </div>
                      )}
                      {activeMealDay.dinner && (
                        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                          <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Dinner</p>
                          <p className="text-xs font-extrabold text-slate-800 mt-1 line-clamp-2">{activeMealDay.dinner}</p>
                        </div>
                      )}
                    </div>

                    <div className="pt-2">
                      <Link
                        href="/meals"
                        className="emerald-btn inline-flex items-center gap-2 px-7 py-3.5 text-white text-sm font-black rounded-2xl shadow-md active:scale-95"
                      >
                        <Utensils className="w-4 h-4" />
                        <span>Open Nutrition Plan</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ) : (
                  /* When meal plan is not generated */
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">Custom Meal Recipes</h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Get chef-crafted breakfast, lunch, and dinner recipes matched to your {targetCalories} kcal goal.
                      </p>
                    </div>
                    <Link
                      href="/meals/generate"
                      className="emerald-btn whitespace-nowrap inline-flex items-center gap-2 px-6 py-3 text-white text-xs font-black rounded-xl shadow-md active:scale-95"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Generate Recipes</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Sidebar */}
          <div className="space-y-8">
            {/* ─── 1. Daily Coach Briefing ─── */}
            <div className="relative overflow-hidden rounded-3xl bg-white p-6 sm:p-7 border border-slate-200/80 shadow-xs">
              <div className="space-y-4">
                {/* Header row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 font-black">
                      <Target className="w-4.5 h-4.5" />
                    </div>
                    <h3 className="text-base font-black text-slate-900 tracking-tight">Coach Insights</h3>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Daily Tip
                  </span>
                </div>

                {/* Structured coaching note */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Focus Technique</p>
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">
                    Prioritize strict form on your core movements today. Maintain slow 3-second negatives and keep core braced throughout every rep.
                  </p>
                </div>

                {/* Interactive Daily checklist */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today&apos;s Checklist</p>
                  <div className="space-y-1.5 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => toggleChecklistItem("workout")}
                      className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                        checklist.workout
                          ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                          checklist.workout ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300"
                        }`}
                      >
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
                        checklist.protein
                          ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                          checklist.protein ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300"
                        }`}
                      >
                        {checklist.protein && <Check className="w-3 h-3" strokeWidth={3} />}
                      </div>
                      <span className={checklist.protein ? "line-through text-slate-400" : ""}>
                        Hit {targetProtein}g Daily Protein
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleChecklistItem("water")}
                      className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                        checklist.water
                          ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                          checklist.water ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300"
                        }`}
                      >
                        {checklist.water && <Check className="w-3 h-3" strokeWidth={3} />}
                      </div>
                      <span className={checklist.water ? "line-through text-slate-400" : ""}>
                        Hydrate 2.5L Water
                      </span>
                    </button>
                  </div>
                </div>

                {/* Ask Assistant trigger */}
                <button
                  type="button"
                  onClick={openAIChat}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-black text-white transition-all active:scale-98 shadow-sm group"
                >
                  <MessageSquare className="w-4 h-4 text-orange-400 group-hover:scale-110 transition-transform" />
                  <span>Ask Coach a question</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>

            {/* ─── 2. Interactive Daily Hydration Tracker ─── */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-100">
                    <Droplets className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-sm tracking-tight">Daily Hydration</h3>
                    <p className="text-[11px] text-slate-500">Goal: 2.5 Liters</p>
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
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-700 text-xs font-black transition-colors active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+250ml</span>
                  </button>
                </div>
              </div>

              {/* 10-glass visual dots */}
              <div className="grid grid-cols-10 gap-1.5 py-2">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-6 rounded-md transition-all ${
                      i < waterCups
                        ? "bg-cyan-500 shadow-xs shadow-cyan-500/30"
                        : "bg-slate-100 border border-slate-200/60"
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center justify-between text-xs font-bold text-slate-600 mt-2">
                <span>{(waterCups * 0.25).toFixed(1)}L logged</span>
                <span className="text-slate-400">{waterCups} / 10 glasses</span>
              </div>
            </div>

            {/* ─── 3. Quick Shortcuts ─── */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-slate-900 text-sm tracking-tight">Quick Shortcuts</h3>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Navigation</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    label: "Workouts",
                    subtitle: "Daily routines",
                    icon: Dumbbell,
                    href: "/workouts",
                    iconBg: "bg-blue-50 text-blue-600 border border-blue-100",
                    hoverBorder: "hover:border-blue-200",
                  },
                  {
                    label: "Meal Plan",
                    subtitle: "Daily recipes",
                    icon: Utensils,
                    href: "/meals",
                    iconBg: "bg-emerald-50 text-emerald-600 border border-emerald-100",
                    hoverBorder: "hover:border-emerald-200",
                  },
                  {
                    label: "Progress",
                    subtitle: "Weight tracking",
                    icon: TrendingUp,
                    href: "/progress",
                    iconBg: "bg-amber-50 text-amber-600 border border-amber-100",
                    hoverBorder: "hover:border-amber-200",
                  },
                  {
                    label: "Settings",
                    subtitle: "Targets & profile",
                    icon: Award,
                    href: "/settings",
                    iconBg: "bg-purple-50 text-purple-600 border border-purple-100",
                    hoverBorder: "hover:border-purple-200",
                  },
                ].map((action, idx) => (
                  <Link
                    key={idx}
                    href={action.href}
                    className={`flex flex-col p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 ${action.hoverBorder} hover:bg-white hover:shadow-xs transition-all text-left group`}
                  >
                    <div className="flex items-center justify-between w-full mb-2.5">
                      <div className={`p-2 rounded-xl ${action.iconBg} group-hover:scale-105 transition-transform`}>
                        <action.icon className="w-4 h-4" strokeWidth={2.2} />
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <span className="text-xs font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                      {action.label}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 mt-0.5">
                      {action.subtitle}
                    </span>
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
