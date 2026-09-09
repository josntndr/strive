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

// Days of week for weekly tracker
const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function DashboardPage() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [waterCups, setWaterCups] = useState(4); // 4 x 250ml = 1L default

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

    // Load local water tracking state
    try {
      const savedWater = localStorage.getItem("strive_daily_water");
      if (savedWater) setWaterCups(Number(savedWater));
    } catch {
      // ignore
    }

    return () => {
      isActive = false;
    };
  }, [router]);

  const addWater = () => {
    setWaterCups((prev) => {
      const next = Math.min(prev + 1, 12);
      try {
        localStorage.setItem("strive_daily_water", String(next));
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

  // Day of week index (0 = Sun, 1 = Mon, ..., 6 = Sat)
  const rawDayIndex = todayDate.getDay();
  // Map to 0 = Mon, 6 = Sun
  const currentDayOfWeekIdx = rawDayIndex === 0 ? 6 : rawDayIndex - 1;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50/70 flex flex-col">
        <Navbar />
        <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          {/* Skeleton Hero */}
          <div className="skeleton h-44 w-full rounded-3xl mb-8" />

          {/* Skeleton Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-32 rounded-3xl" />
            ))}
          </div>

          {/* Skeleton 2-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="skeleton h-72 rounded-3xl" />
              <div className="skeleton h-72 rounded-3xl" />
            </div>
            <div className="space-y-8">
              <div className="skeleton h-56 rounded-3xl" />
              <div className="skeleton h-64 rounded-3xl" />
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

  // Split goals into clean individual chips
  const rawGoals = dashboard.currentFitnessGoal
    ? dashboard.currentFitnessGoal
        .split(",")
        .map((g) => g.trim())
        .filter(Boolean)
    : ["Improve overall fitness"];

  // Deduplicate and shorten goal tags
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
  const userWeight = profile.weight || 50;
  const targetCalories = Math.round(userWeight * 33);
  const targetProtein = Math.round(userWeight * 2.0);
  const targetCarbs = Math.round(userWeight * 3.5);
  const targetFats = Math.round(userWeight * 0.9);

  return (
    <div className="min-h-screen bg-[#faf6f2] flex flex-col selection:bg-blue-500 selection:text-white">
      <Navbar />
      <AIChat />

      <main className="flex-grow py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* ─── Athlete Header & Training Status ─── */}
        <div className="relative mb-8 overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
          {/* Subtle warm decorative background light */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-orange-100/40 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 left-1/3 h-40 w-40 rounded-full bg-blue-50/50 blur-2xl" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              {/* Top metadata badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold tracking-wide">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  Active Program
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 text-slate-600 text-xs font-semibold border border-slate-200/80">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  {todayFormatted}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200/60">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Week 1 On Track
                </span>
              </div>

              {/* Personal Greeting */}
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                  Welcome back, {dashboard.userName}
                </h1>
                <p className="text-slate-600 font-medium text-sm sm:text-base mt-1">
                  Ready for today&apos;s session? Stay consistent and build momentum.
                </p>
              </div>

              {/* Clean Goal Tags */}
              <div className="pt-1 flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Targets:</span>
                {goalsList.map((goal, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-50 text-slate-800 border border-slate-200/80 hover:bg-white transition-colors"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    {goal}
                  </span>
                ))}
              </div>
            </div>

            {/* Weekly Training Rhythm Pill */}
            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 sm:p-5 flex flex-col gap-3 min-w-[260px] self-start lg:self-auto">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500">Weekly Schedule</span>
                <span className="text-xs font-bold text-blue-600">
                  {profile.workoutDaysPerWeek || 3} Days Planned
                </span>
              </div>

              {/* 7-day mini calendar tracker */}
              <div className="grid grid-cols-7 gap-1.5 pt-1">
                {DAYS_OF_WEEK.map((day, idx) => {
                  const isToday = idx === currentDayOfWeekIdx;
                  // Workout days typically Mon(0), Wed(2), Fri(4) for 3-day split
                  const isWorkoutDay = idx === 0 || idx === 2 || idx === 4;
                  return (
                    <div
                      key={day}
                      className={`flex flex-col items-center py-2 rounded-xl text-center transition-all ${
                        isToday
                          ? "bg-blue-600 text-white shadow-sm scale-105 font-black"
                          : "bg-white text-slate-600 border border-slate-100 font-bold"
                      }`}
                    >
                      <span className={`text-[10px] uppercase ${isToday ? "text-blue-100" : "text-slate-400"}`}>
                        {day}
                      </span>
                      <div className="mt-1 flex items-center justify-center">
                        {isWorkoutDay ? (
                          <div className={`w-2 h-2 rounded-full ${isToday ? "bg-white" : "bg-blue-500"}`} />
                        ) : (
                          <div className={`w-1 h-1 rounded-full ${isToday ? "bg-blue-200" : "bg-slate-300"}`} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium pt-0.5">
                <span>Focus: <strong className="text-slate-800">{profile.targetBodyFocus || "Full Body"}</strong></span>
                <span>{profile.workoutLocation || "Gym & Home"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── 4 Metric Stat Cards ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {/* 1. Workout Streak */}
          <div className="stat-card bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:border-orange-300 transition-all">
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-2xl bg-orange-50 text-orange-600 border border-orange-100">
                <Flame className="w-5 h-5" strokeWidth={2.2} />
              </div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-700">
                {dashboard.workoutStreak > 0 ? "Active" : "Ready"}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Workout Streak</p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-3xl font-black text-slate-900 tracking-tight">{dashboard.workoutStreak}</span>
                <span className="text-sm font-bold text-slate-500">days</span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                {dashboard.workoutStreak > 0 ? "Consecutive training days" : "Complete today to start streak"}
              </p>
            </div>
          </div>

          {/* 2. Completed Workouts */}
          <div className="stat-card bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-all">
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                <CheckCircle2 className="w-5 h-5" strokeWidth={2.2} />
              </div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                Logged
              </span>
            </div>
            <div className="mt-4">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Completed Sessions</p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-3xl font-black text-slate-900 tracking-tight">{dashboard.totalCompletedWorkouts}</span>
                <span className="text-sm font-bold text-slate-500">workouts</span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                {dashboard.totalCompletedWorkouts > 0 ? "Total lifetime sessions logged" : "First workout ready"}
              </p>
            </div>
          </div>

          {/* 3. Current Weight */}
          <div className="stat-card bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:border-blue-300 transition-all">
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
                <TrendingUp className="w-5 h-5" strokeWidth={2.2} />
              </div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700">
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
              <p className="text-xs text-slate-500 font-medium mt-1">
                Body weight on profile record
              </p>
            </div>
          </div>

          {/* 4. Training Experience */}
          <div className="stat-card bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:border-purple-300 transition-all">
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100">
                <Award className="w-5 h-5" strokeWidth={2.2} />
              </div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700">
                Tier
              </span>
            </div>
            <div className="mt-4">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Fitness Level</p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight capitalize">
                  {profile.workoutExperience || "Beginner"}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                {profile.workoutDuration ? `Target ${profile.workoutDuration}m sessions` : "Adaptive intensity"}
              </p>
            </div>
          </div>
        </div>

        {/* ─── Main Content Grid ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (2 cols) */}
          <div className="lg:col-span-2 space-y-8">
            {/* ─── 1. Today's Workout Card ─── */}
            <div className="dashboard-card rounded-3xl overflow-hidden shadow-xs">
              {/* Header */}
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-xs">
                    <Dumbbell className="w-5 h-5" strokeWidth={2.2} />
                  </div>
                  <div>
                    <h2 className="font-black text-slate-900 text-base sm:text-lg tracking-tight">Today&apos;s Workout</h2>
                    <p className="text-xs text-slate-500 font-medium">Daily training session</p>
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
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-black text-xs uppercase tracking-wider border border-blue-200/70">
                            Day {workoutDayNumber} of {totalWorkoutDays}
                          </span>
                          {activeWorkoutDay.completed ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Completed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-orange-50 text-orange-700 font-bold text-xs border border-orange-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                              Scheduled for Today
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-2">
                          {activeWorkoutDay.focus || "Core & Strength"}
                        </h3>
                      </div>

                      {/* Stat pills */}
                      <div className="flex items-center gap-2 self-start sm:self-center">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold">
                          <Activity className="w-4 h-4 text-blue-600" />
                          <span>{activeWorkoutDay.exercises?.length || 4} Exercises</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span>~{profile.workoutDuration || 45} mins</span>
                        </div>
                      </div>
                    </div>

                    {/* Featured Exercises List */}
                    {activeWorkoutDay.exercises && activeWorkoutDay.exercises.length > 0 && (
                      <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Exercise Routine
                          </span>
                          <span className="text-xs font-semibold text-slate-500">
                            Sets & Target Reps
                          </span>
                        </div>
                        <div className="space-y-2">
                          {activeWorkoutDay.exercises.slice(0, 4).map((ex, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/70 text-xs font-semibold"
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-700 font-black text-[11px] flex items-center justify-center">
                                  {idx + 1}
                                </span>
                                <span className="font-extrabold text-slate-900">{ex.name}</span>
                              </div>
                              <span className="text-slate-500 font-bold">
                                {ex.sets || 3} sets × {ex.reps || "12 reps"}
                              </span>
                            </div>
                          ))}
                          {activeWorkoutDay.exercises.length > 4 && (
                            <p className="text-center text-xs font-semibold text-slate-500 pt-1">
                              +{activeWorkoutDay.exercises.length - 4} more exercises in full routine
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* CTA Actions */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                      <Link
                        href="/workouts"
                        className="complete-btn w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 text-white text-sm font-black rounded-2xl shadow-md active:scale-95"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        <span>{activeWorkoutDay.completed ? "Review Completed Workout" : `Start Day ${workoutDayNumber} Workout`}</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>

                      <Link
                        href="/workouts"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-6 py-3.5 text-slate-700 text-sm font-bold rounded-2xl bg-slate-100 hover:bg-slate-200 transition-colors"
                      >
                        Full Workout Schedule ({completedWorkoutsCount}/{totalWorkoutDays} done)
                      </Link>
                    </div>
                  </div>
                ) : (
                  /* Empty state */
                  <div className="py-6 text-center max-w-md mx-auto">
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

            {/* ─── 2. Today's Nutrition & Fuel Plan ─── */}
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
              <div className="p-6 sm:p-8">
                {/* Macro Target Strip */}
                <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                      Target Macros ({profile.dietaryPreference || "Balanced"} Diet)
                    </span>
                    <span className="text-xs font-bold text-slate-600">Based on {userWeight}kg body weight</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                      <span className="text-[11px] font-bold text-slate-400 uppercase">Calories</span>
                      <p className="text-lg font-black text-slate-900 mt-0.5">{targetCalories}</p>
                      <span className="text-[10px] text-slate-500 font-semibold">kcal / day</span>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                      <span className="text-[11px] font-bold text-emerald-600 uppercase">Protein</span>
                      <p className="text-lg font-black text-slate-900 mt-0.5">{targetProtein}g</p>
                      <span className="text-[10px] text-slate-500 font-semibold">2.0g per kg</span>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                      <span className="text-[11px] font-bold text-amber-600 uppercase">Carbs</span>
                      <p className="text-lg font-black text-slate-900 mt-0.5">{targetCarbs}g</p>
                      <span className="text-[10px] text-slate-500 font-semibold">clean energy</span>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                      <span className="text-[11px] font-bold text-purple-600 uppercase">Healthy Fats</span>
                      <p className="text-lg font-black text-slate-900 mt-0.5">{targetFats}g</p>
                      <span className="text-[10px] text-slate-500 font-semibold">vital balance</span>
                    </div>
                  </div>
                </div>

                {mealPlan && activeMealDay ? (
                  <div className="space-y-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Day {mealDayNumber} Meal Schedule
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {activeMealDay.breakfast && (
                        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                          <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Breakfast</p>
                          <p className="text-xs font-extrabold text-slate-800 mt-1 line-clamp-2">{activeMealDay.breakfast}</p>
                        </div>
                      )}
                      {activeMealDay.lunch && (
                        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                          <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Lunch</p>
                          <p className="text-xs font-extrabold text-slate-800 mt-1 line-clamp-2">{activeMealDay.lunch}</p>
                        </div>
                      )}
                      {activeMealDay.dinner && (
                        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                          <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Dinner</p>
                          <p className="text-xs font-extrabold text-slate-800 mt-1 line-clamp-2">{activeMealDay.dinner}</p>
                        </div>
                      )}
                    </div>

                    <div className="pt-2">
                      <Link
                        href="/meals"
                        className="emerald-btn inline-flex items-center gap-2 px-7 py-3 text-white text-sm font-black rounded-2xl shadow-md active:scale-95"
                      >
                        <Utensils className="w-4 h-4" />
                        <span>Open Nutrition Plan</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ) : (
                  /* When meal plan is not generated */
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">Custom Meal Recipes</h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Get breakfast, lunch, and dinner recipes calibrated to your {targetCalories} kcal goal.
                      </p>
                    </div>
                    <Link
                      href="/meals/generate"
                      className="emerald-btn whitespace-nowrap inline-flex items-center gap-2 px-6 py-3 text-white text-xs font-black rounded-xl shadow-md active:scale-95"
                    >
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
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-black">
                      <Target className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-black text-slate-900 tracking-tight">Coach Insights</h3>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Daily Tip
                  </span>
                </div>

                {/* Structured coaching note */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Focus Technique</p>
                  <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                    Prioritize strict form on your core movements today. Maintain slow 3-second negatives and keep core braced throughout every rep.
                  </p>
                </div>

                {/* Daily checklist */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today&apos;s Checklist</p>
                  <div className="space-y-1.5 text-xs font-semibold text-slate-700">
                    <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-slate-200/70">
                      <div className="w-4 h-4 rounded-md border border-slate-300 flex items-center justify-center text-blue-600">
                        {workoutPlan?.days?.[0]?.completed ? <Check className="w-3 h-3" /> : null}
                      </div>
                      <span>Day 1 Core Workout</span>
                    </div>
                    <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-slate-200/70">
                      <div className="w-4 h-4 rounded-md border border-slate-300 flex items-center justify-center text-blue-600" />
                      <span>Hit {targetProtein}g Daily Protein</span>
                    </div>
                    <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-slate-200/70">
                      <div className="w-4 h-4 rounded-md border border-slate-300 flex items-center justify-center text-blue-600">
                        {waterCups >= 8 ? <Check className="w-3 h-3" /> : null}
                      </div>
                      <span>Hydrate 2.5L Water</span>
                    </div>
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
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-100">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-sm tracking-tight">Daily Hydration</h3>
                    <p className="text-[11px] text-slate-500">Goal: 2.5 Liters</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={addWater}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-700 text-xs font-black transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+250ml</span>
                </button>
              </div>

              {/* Water progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5">
                <div
                  className="bg-cyan-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((waterCups / 10) * 100, 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs font-bold text-slate-600 mt-2">
                <span>{(waterCups * 0.25).toFixed(1)}L logged</span>
                <span className="text-slate-400">{waterCups} / 10 glasses</span>
              </div>
            </div>

            {/* ─── 3. Quick Actions ─── */}
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
