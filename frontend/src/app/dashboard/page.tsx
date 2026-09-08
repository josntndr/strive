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
  Sparkles,
  ArrowRight,
  ChevronRight,
  Clock,
  Target,
  MessageSquare,
  Activity,
  Check,
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

export default function DashboardPage() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

    return () => {
      isActive = false;
    };
  }, [router]);

  const openAIChat = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-ai-chat"));
    }
  };

  // Formatted date string for header
  const todayFormatted = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(new Date());

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

  // Split goals if comma-separated
  const goalsList = dashboard.currentFitnessGoal
    ? dashboard.currentFitnessGoal
        .split(",")
        .map((g) => g.trim())
        .filter(Boolean)
    : [];

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

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col selection:bg-blue-500 selection:text-white">
      <Navbar />
      <AIChat />

      <main className="flex-grow py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* ─── Hero Welcome Banner ─── */}
        <div className="relative mb-8 overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 p-6 sm:p-8 backdrop-blur-xl shadow-xs">
          {/* Subtle warm decorative background glows */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-gradient-to-br from-blue-100/60 to-orange-100/40 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 left-1/3 h-48 w-48 rounded-full bg-blue-50/50 blur-2xl" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              {/* Top metadata row */}
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-black uppercase tracking-wider border border-blue-200/70 shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                  Personalized AI Dashboard
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  {todayFormatted}
                </span>
                {dashboard.workoutStreak > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-700 text-xs font-extrabold border border-orange-200">
                    <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                    {dashboard.workoutStreak} Day Streak
                  </span>
                )}
              </div>

              {/* Greeting */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                Welcome back, {dashboard.userName}! <span className="inline-block animate-wave">👋</span>
              </h1>

              {/* Motivational Quote */}
              <p className="text-slate-600 font-medium text-sm sm:text-base flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span>&ldquo;{dashboard.motivationalMessage}&rdquo;</span>
              </p>

              {/* Goal Badges Rack */}
              {goalsList.length > 0 && (
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Goals:</span>
                  {goalsList.map((goal, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white text-slate-800 border border-slate-200/90 shadow-2xs hover:border-blue-300 transition-colors"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                      {goal}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Status Pill Card (Right) */}
            <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-4 sm:p-5 flex flex-col gap-2 min-w-[240px] self-start lg:self-auto shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Profile Status</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active Plan
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-black">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold">Primary Focus</p>
                  <p className="text-sm font-extrabold text-slate-900 leading-tight">
                    {profile.targetBodyFocus || goalsList[0] || "Overall Fitness"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── 4 Elevated Stats Cards ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {/* 1. Streak */}
          <div className="stat-card bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:border-orange-200 relative overflow-hidden group">
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
                <Flame className="w-6 h-6" strokeWidth={2.2} />
              </div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-100">
                {dashboard.workoutStreak > 0 ? "🔥 Hot Streak" : "Daily Habit"}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Workout Streak</p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-3xl font-black text-slate-900 tracking-tight">{dashboard.workoutStreak}</span>
                <span className="text-sm font-extrabold text-slate-500">days</span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                {dashboard.workoutStreak > 0 ? "Great discipline! Keep it going." : "Start your streak today."}
              </p>
            </div>
          </div>

          {/* 2. Total Completed */}
          <div className="stat-card bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:border-emerald-200 relative overflow-hidden group">
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <CheckCircle2 className="w-6 h-6" strokeWidth={2.2} />
              </div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                Logged
              </span>
            </div>
            <div className="mt-4">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Completed</p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-3xl font-black text-slate-900 tracking-tight">{dashboard.totalCompletedWorkouts}</span>
                <span className="text-sm font-extrabold text-slate-500">sessions</span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                {dashboard.totalCompletedWorkouts > 0 ? "Every rep builds strength." : "Complete day 1 to log your first."}
              </p>
            </div>
          </div>

          {/* 3. Current Weight */}
          <div className="stat-card bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:border-blue-200 relative overflow-hidden group">
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-2xl bg-gradient-to-tr from-blue-600 to-blue-500 text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <TrendingUp className="w-6 h-6" strokeWidth={2.2} />
              </div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                {profile.height ? `${profile.height} cm` : "Body Metric"}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Current Weight</p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-3xl font-black text-slate-900 tracking-tight">
                  {profile.weight ? profile.weight : "--"}
                </span>
                <span className="text-sm font-extrabold text-slate-500">kg</span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                {profile.targetBodyFocus ? `Focus: ${profile.targetBodyFocus}` : "Track progress weekly."}
              </p>
            </div>
          </div>

          {/* 4. Fitness Level */}
          <div className="stat-card bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:border-purple-200 relative overflow-hidden group">
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
                <Award className="w-6 h-6" strokeWidth={2.2} />
              </div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                {profile.workoutDaysPerWeek ? `${profile.workoutDaysPerWeek}x / week` : "Custom"}
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
                {profile.workoutDuration ? `${profile.workoutDuration} min targets` : "Adaptive difficulty"}
              </p>
            </div>
          </div>
        </div>

        {/* ─── Main Content Grid ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left / Center Column (2 cols) */}
          <div className="lg:col-span-2 space-y-8">
            {/* ─── Today's Workout Card ─── */}
            <div className="dashboard-card rounded-3xl overflow-hidden shadow-xs">
              {/* Card Header */}
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shadow-2xs">
                    <Dumbbell className="w-5 h-5" strokeWidth={2.2} />
                  </div>
                  <div>
                    <h2 className="font-black text-slate-900 text-base sm:text-lg tracking-tight">Today&apos;s Workout Plan</h2>
                    <p className="text-xs text-slate-500 font-medium">Personalized exercise routine</p>
                  </div>
                </div>

                {workoutPlan ? (
                  <div className="flex items-center gap-3">
                    <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-extrabold">
                      <Check className="w-3.5 h-3.5 text-blue-600" />
                      {completedWorkoutsCount} / {totalWorkoutDays} Completed
                    </span>
                    <Link
                      href="/workouts"
                      className="text-xs font-black text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                    >
                      <span>Full Schedule</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                ) : (
                  <Link
                    href="/workouts/generate"
                    className="text-xs font-black text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                  >
                    <span>Create Plan</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
              </div>

              {/* Card Body */}
              <div className="p-6 sm:p-8">
                {workoutPlan && activeWorkoutDay ? (
                  <div className="space-y-6">
                    {/* Top Day Badge & Focus */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-black text-xs uppercase tracking-wider border border-blue-200/60">
                            Day {workoutDayNumber}
                          </span>
                          {activeWorkoutDay.completed ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Completed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-orange-50 text-orange-700 font-bold text-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                              Ready to Start
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-2">
                          {activeWorkoutDay.focus || "Core & Strength"}
                        </h3>
                      </div>

                      {/* Pill info strip */}
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

                    {/* Exercises Preview Tags */}
                    {activeWorkoutDay.exercises && activeWorkoutDay.exercises.length > 0 && (
                      <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                          Featured Exercises
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {activeWorkoutDay.exercises.slice(0, 4).map((ex, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white text-slate-800 text-xs font-bold border border-slate-200/80 shadow-2xs"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                              {ex.name}
                            </span>
                          ))}
                          {activeWorkoutDay.exercises.length > 4 && (
                            <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold text-slate-500">
                              +{activeWorkoutDay.exercises.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action button */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                      <Link
                        href="/workouts"
                        className="complete-btn w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 text-white text-sm font-black rounded-2xl shadow-md active:scale-95"
                      >
                        <Dumbbell className="w-4.5 h-4.5" />
                        <span>{activeWorkoutDay.completed ? "View Completed Workout" : `Start Day ${workoutDayNumber} Workout`}</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>

                      <Link
                        href="/workouts"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-6 py-3.5 text-slate-700 text-sm font-bold rounded-2xl bg-slate-100 hover:bg-slate-200 transition-colors"
                      >
                        All {totalWorkoutDays} Days
                      </Link>
                    </div>
                  </div>
                ) : (
                  /* Empty state when no workout plan */
                  <div className="py-6 text-center max-w-md mx-auto">
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <Dumbbell className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 mb-1.5 tracking-tight">No Workout Plan Generated Yet</h3>
                    <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                      Let Strive AI design an optimized workout program tailored to your goals, equipment, and weekly schedule.
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 mb-6 text-xs text-slate-600 font-semibold">
                      <span className="px-3 py-1 rounded-full bg-slate-100">✨ Smart Progression</span>
                      <span className="px-3 py-1 rounded-full bg-slate-100">🎥 Video Demos</span>
                      <span className="px-3 py-1 rounded-full bg-slate-100">⏱️ Rest Timers</span>
                    </div>
                    <Link
                      href="/workouts/generate"
                      className="complete-btn inline-flex items-center gap-2 px-8 py-3.5 text-white text-sm font-black rounded-2xl shadow-md active:scale-95"
                    >
                      <Sparkles className="w-4.5 h-4.5" />
                      <span>Generate Workout Plan</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* ─── Today's Meal Plan Card ─── */}
            <div className="dashboard-card rounded-3xl overflow-hidden shadow-xs">
              {/* Card Header */}
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-2xs">
                    <Utensils className="w-5 h-5" strokeWidth={2.2} />
                  </div>
                  <div>
                    <h2 className="font-black text-slate-900 text-base sm:text-lg tracking-tight">Today&apos;s Meal Plan</h2>
                    <p className="text-xs text-slate-500 font-medium">Nutritional fuel & macro balance</p>
                  </div>
                </div>

                <Link
                  href={mealPlan ? "/meals" : "/meals/generate"}
                  className="text-xs font-black text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition-colors"
                >
                  <span>{mealPlan ? "View Meal Plan" : "Create Plan"}</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Card Body */}
              <div className="p-6 sm:p-8">
                {mealPlan && activeMealDay ? (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 font-black text-xs uppercase tracking-wider border border-emerald-200/60">
                          Day {mealDayNumber} Nutrition
                        </span>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight mt-2">
                          {profile.dietaryPreference || "Balanced"} Fuel Plan
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        {activeMealDay.estimatedCalories && (
                          <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold">
                            🔥 {activeMealDay.estimatedCalories} kcal
                          </span>
                        )}
                        {activeMealDay.estimatedProtein && (
                          <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold">
                            🥩 {activeMealDay.estimatedProtein}g Protein
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Meal previews */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {activeMealDay.breakfast && (
                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Breakfast</p>
                          <p className="text-sm font-extrabold text-slate-800 mt-1 line-clamp-2">{activeMealDay.breakfast}</p>
                        </div>
                      )}
                      {activeMealDay.lunch && (
                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Lunch</p>
                          <p className="text-sm font-extrabold text-slate-800 mt-1 line-clamp-2">{activeMealDay.lunch}</p>
                        </div>
                      )}
                      {activeMealDay.dinner && (
                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Dinner</p>
                          <p className="text-sm font-extrabold text-slate-800 mt-1 line-clamp-2">{activeMealDay.dinner}</p>
                        </div>
                      )}
                    </div>

                    <div className="pt-2">
                      <Link
                        href="/meals"
                        className="emerald-btn inline-flex items-center gap-2 px-8 py-3.5 text-white text-sm font-black rounded-2xl shadow-md active:scale-95"
                      >
                        <Utensils className="w-4.5 h-4.5" />
                        <span>Open Nutrition Plan</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ) : (
                  /* Empty state when no meal plan */
                  <div className="py-6 text-center max-w-md mx-auto">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <Utensils className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 mb-1.5 tracking-tight">Personalized AI Nutrition Plan</h3>
                    <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                      Fuel your workouts with delicious, chef-curated meals calibrated to your body metrics and dietary preferences.
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 mb-6 text-xs text-slate-600 font-semibold">
                      <span className="px-3 py-1 rounded-full bg-slate-100">🥗 Macro-Balanced</span>
                      <span className="px-3 py-1 rounded-full bg-slate-100">🥑 {profile.dietaryPreference || "Balanced Diet"}</span>
                      <span className="px-3 py-1 rounded-full bg-slate-100">⚡ Calorie-Matched</span>
                    </div>
                    <Link
                      href="/meals/generate"
                      className="emerald-btn inline-flex items-center gap-2 px-8 py-3.5 text-white text-sm font-black rounded-2xl shadow-md active:scale-95"
                    >
                      <Sparkles className="w-4.5 h-4.5" />
                      <span>Generate Meal Plan</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ─── Right Column: Sidebar ─── */}
          <div className="space-y-8">
            {/* 1. Strive AI Coach Briefing Card (High-end Dark Twilight Glass) */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 p-7 text-white border border-slate-800/90 shadow-xl">
              {/* Warm decorative aura */}
              <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-gradient-to-br from-[#e0512c]/30 to-orange-500/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-blue-500/15 blur-2xl" />

              <div className="relative z-10 space-y-5">
                {/* Header row */}
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-black uppercase tracking-wider border border-white/15 backdrop-blur-md">
                    <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                    Strive AI Coach
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Active Briefing
                  </span>
                </div>

                {/* Coach message */}
                <div className="border-l-2 border-orange-500/80 pl-3.5 py-0.5">
                  <p className="text-sm sm:text-base font-semibold text-slate-100 leading-relaxed">
                    &ldquo;{dashboard.progressSummary}&rdquo;
                  </p>
                </div>

                {/* Profile Highlights Mini Grid */}
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Target Focus</p>
                    <p className="text-xs font-extrabold text-white mt-0.5 truncate">
                      {profile.targetBodyFocus || "Full Body"}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Diet Style</p>
                    <p className="text-xs font-extrabold text-white mt-0.5 truncate">
                      {profile.dietaryPreference || "Balanced"}
                    </p>
                  </div>
                </div>

                {/* Interactive trigger for Strive Assistant */}
                <button
                  type="button"
                  onClick={openAIChat}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-xs font-black text-white transition-all active:scale-98 shadow-sm group"
                >
                  <MessageSquare className="w-4 h-4 text-orange-400 group-hover:scale-110 transition-transform" />
                  <span>Ask Strive Assistant for advice</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>

            {/* 2. Quick Actions Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-black text-slate-900 text-base tracking-tight">Quick Actions</h3>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Navigation</span>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
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
                    label: "Meals",
                    subtitle: "Nutrition plan",
                    icon: Utensils,
                    href: "/meals",
                    iconBg: "bg-emerald-50 text-emerald-600 border border-emerald-100",
                    hoverBorder: "hover:border-emerald-200",
                  },
                  {
                    label: "Progress",
                    subtitle: "Track stats",
                    icon: TrendingUp,
                    href: "/progress",
                    iconBg: "bg-amber-50 text-amber-600 border border-amber-100",
                    hoverBorder: "hover:border-amber-200",
                  },
                  {
                    label: "Settings",
                    subtitle: "Profile & goals",
                    icon: Award,
                    href: "/settings",
                    iconBg: "bg-purple-50 text-purple-600 border border-purple-100",
                    hoverBorder: "hover:border-purple-200",
                  },
                ].map((action, idx) => (
                  <Link
                    key={idx}
                    href={action.href}
                    className={`flex flex-col p-4 rounded-2xl bg-slate-50/70 border border-slate-100 ${action.hoverBorder} hover:bg-white hover:shadow-sm transition-all text-left group`}
                  >
                    <div className="flex items-center justify-between w-full mb-3">
                      <div className={`p-2.5 rounded-xl ${action.iconBg} group-hover:scale-110 transition-transform`}>
                        <action.icon className="w-4.5 h-4.5" strokeWidth={2.2} />
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <span className="text-xs font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                      {action.label}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 mt-0.5">
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
