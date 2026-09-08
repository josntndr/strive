"use client";

import { useEffect, useState } from "react";
import type { ComponentType } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { AIChat } from "@/components/ai/AIChat";
import {
  Dumbbell,
  Utensils,
  TrendingUp,
  Plus,
  CheckCircle2,
  Calendar,
  Award,
  Loader2,
} from "lucide-react";
import { api, clearAuth, getCurrentUser, getToken, isUnauthorizedError } from "@/lib/api";
import { toast } from "react-hot-toast";

type FitnessProfile = {
  weight?: number;
  workoutExperience?: string;
};

type PlanDay = {
  focus?: string;
  breakfast?: string;
};

type Plan = {
  days?: PlanDay[];
};

type DashboardData = {
  userName: string;
  currentFitnessGoal: string | null;
  latestWorkoutPlan?: Plan | null;
  latestMealPlan?: Plan | null;
  totalCompletedWorkouts: number;
  workoutStreak: number;
  progressSummary: string;
  motivationalMessage: string;
  profile: FitnessProfile;
};

type PlanPreviewProps = {
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  color: "blue" | "green";
  title: string;
  href: string;
  generateHref: string;
  emptyTitle: string;
  emptyText: string;
  hasPlan: boolean;
  summary?: string;
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!dashboard) return null;

  const profile = dashboard.profile;
  const workoutPlan = dashboard.latestWorkoutPlan;
  const mealPlan = dashboard.latestMealPlan;

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col selection:bg-blue-500 selection:text-white">
      <Navbar />
      <AIChat />

      <main className="flex-grow py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Welcome Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2 border border-blue-100">
              Personalized Dashboard
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome back, {dashboard.userName}! 👋</h1>
            <p className="text-slate-600 font-medium mt-1">{dashboard.motivationalMessage}</p>
          </div>
          <div className="bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200/80 flex items-center gap-3 self-start md:self-auto">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-sm shadow-green-500/50" />
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Goal</p>
              <span className="text-xs font-bold text-slate-800">{dashboard.currentFitnessGoal}</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: "Workout Streak", value: `${dashboard.workoutStreak} days`, icon: Calendar, color: "text-orange-600", bg: "bg-orange-50/80 border-orange-100" },
            { label: "Total Completed", value: dashboard.totalCompletedWorkouts, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50/80 border-green-100" },
            { label: "Current Weight", value: `${profile.weight || "-"} kg`, icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50/80 border-blue-100" },
            { label: "Fitness Level", value: profile.workoutExperience || "-", icon: Award, color: "text-purple-600", bg: "bg-purple-50/80 border-purple-100" },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover-lift flex items-center gap-4">
              <div className={`p-3.5 rounded-2xl border ${stat.bg} ${stat.color} shadow-xs`}>
                <stat.icon className="w-6 h-6" strokeWidth={2} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold">{stat.label}</p>
                <p className="text-xl font-extrabold text-slate-900 mt-0.5 tracking-tight">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            <PlanPreview
              icon={Dumbbell}
              color="blue"
              title="Today's Workout"
              href="/workouts"
              generateHref="/workouts/generate"
              emptyTitle="No Workout Plan Generated"
              emptyText="Generate your personalized workout plan based on your fitness profile."
              hasPlan={Boolean(workoutPlan)}
              summary={workoutPlan?.days?.[0]?.focus}
            />
            <PlanPreview
              icon={Utensils}
              color="green"
              title="Today's Meal Plan"
              href="/meals"
              generateHref="/meals/generate"
              emptyTitle="No Meal Plan Generated"
              emptyText="Get healthy and delicious meal recommendations tailored to your goals."
              hasPlan={Boolean(mealPlan)}
              summary={mealPlan?.days?.[0]?.breakfast}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-blue-600 via-blue-600 to-blue-700 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-blue-500/15">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <span className="text-blue-100 text-xs font-extrabold uppercase tracking-wider bg-white/15 px-3 py-1 rounded-full border border-white/20">Progress Summary</span>
              <p className="text-lg font-bold mt-5 leading-relaxed text-white">{dashboard.progressSummary}</p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
              <h3 className="font-extrabold text-slate-900 text-base mb-5">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Workouts", icon: Dumbbell, href: "/workouts", color: "text-blue-600 bg-blue-50/80" },
                  { label: "Meals", icon: Utensils, href: "/meals", color: "text-emerald-600 bg-emerald-50/80" },
                  { label: "Profile", icon: Award, href: "/settings", color: "text-purple-600 bg-purple-50/80" },
                  { label: "Progress", icon: TrendingUp, href: "/progress", color: "text-amber-600 bg-amber-50/80" },
                ].map((action, idx) => (
                  <Link
                    key={idx}
                    href={action.href}
                    className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-slate-50/70 border border-slate-100 hover:bg-white hover:border-blue-200 hover:shadow-md transition-all text-slate-700 group"
                  >
                    <div className={`p-2.5 rounded-xl ${action.color} group-hover:scale-110 transition-transform`}>
                      <action.icon className="w-5 h-5" strokeWidth={2} />
                    </div>
                    <span className="text-xs font-bold group-hover:text-blue-600 transition-colors">{action.label}</span>
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

function PlanPreview({
  icon: Icon,
  color,
  title,
  href,
  generateHref,
  emptyTitle,
  emptyText,
  hasPlan,
  summary,
}: PlanPreviewProps) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden hover-lift">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${color === "green" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-blue-50 text-blue-600 border border-blue-100"}`}>
            <Icon className="w-5 h-5" strokeWidth={2} />
          </div>
          <h2 className="font-extrabold text-slate-900 text-base">{title}</h2>
        </div>
        <Link href={href} className={`text-xs font-bold ${color === "green" ? "text-emerald-700 hover:text-emerald-800" : "text-blue-700 hover:text-blue-800"} transition-colors`}>
          View Plan &rarr;
        </Link>
      </div>
      <div className="p-10 text-center">
        {hasPlan ? (
          <>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{summary}</h3>
            <p className="text-slate-500 text-sm mb-6 font-medium">Your latest plan is active and ready to follow.</p>
            <Link href={href} className={`inline-flex items-center px-7 py-3 text-white text-sm font-bold rounded-full transition-all shadow-md active:scale-95 ${color === "green" ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20" : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"}`}>
              Open Plan
            </Link>
          </>
        ) : (
          <>
            <div className="bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <Plus className="w-7 h-7 text-slate-400" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">{emptyTitle}</h3>
            <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto font-medium">{emptyText}</p>
            <Link href={generateHref} className={`inline-flex items-center px-7 py-3 text-white text-sm font-bold rounded-full transition-all shadow-md active:scale-95 ${color === "green" ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20" : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"}`}>
              Generate Plan
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
