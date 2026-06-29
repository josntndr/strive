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
  icon: ComponentType<{ className?: string }>;
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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <AIChat />

      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Welcome back, {dashboard.userName}!</h1>
            <p className="text-slate-700 mt-1">{dashboard.motivationalMessage}</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-slate-800">{dashboard.currentFitnessGoal}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: "Workout Streak", value: `${dashboard.workoutStreak} days`, icon: Calendar, color: "text-orange-600", bg: "bg-orange-50" },
            { label: "Total Completed", value: dashboard.totalCompletedWorkouts, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
            { label: "Current Weight", value: `${profile.weight || "-"} kg`, icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Fitness Level", value: profile.workoutExperience || "-", icon: Award, color: "text-purple-600", bg: "bg-purple-50" },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-600 font-medium">{stat.label}</p>
                <p className="text-xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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

          <div className="space-y-8">
            <div className="bg-blue-600 rounded-3xl p-8 text-white relative overflow-hidden">
              <span className="text-blue-50 text-xs font-bold uppercase tracking-wider">Progress Summary</span>
              <p className="text-xl font-bold mt-4 leading-relaxed text-white">{dashboard.progressSummary}</p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
              <h3 className="font-bold text-slate-900 mb-6">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Workouts", icon: Dumbbell, href: "/workouts" },
                  { label: "Meals", icon: Utensils, href: "/meals" },
                  { label: "Profile", icon: Award, href: "/settings" },
                  { label: "Progress", icon: TrendingUp, href: "/progress" },
                ].map((action, idx) => (
                  <Link
                    key={idx}
                    href={action.href}
                    className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-slate-50 hover:bg-blue-50 hover:text-blue-600 transition-all text-slate-700"
                  >
                    <action.icon className="w-6 h-6" />
                    <span className="text-xs font-bold">{action.label}</span>
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
  const colorClasses =
    color === "green"
      ? "text-green-600 bg-green-50 bg-green-600 hover:bg-green-700 shadow-green-100"
      : "text-blue-600 bg-blue-50 bg-blue-600 hover:bg-blue-700 shadow-blue-100";

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${color === "green" ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"}`}>
            <Icon className="w-5 h-5" />
          </div>
          <h2 className="font-bold text-slate-900">{title}</h2>
        </div>
        <Link href={href} className={`text-sm font-semibold ${color === "green" ? "text-green-700" : "text-blue-700"}`}>
          View Plan
        </Link>
      </div>
      <div className="p-12 text-center">
        {hasPlan ? (
          <>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{summary}</h3>
            <p className="text-slate-600 mb-6">Your latest plan is ready.</p>
            <Link href={href} className={`inline-flex items-center px-6 py-3 text-white font-bold rounded-xl transition-all shadow-lg ${colorClasses.split(" ").slice(2).join(" ")}`}>
              Open Plan
            </Link>
          </>
        ) : (
          <>
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{emptyTitle}</h3>
            <p className="text-slate-600 mb-6 max-w-sm mx-auto">{emptyText}</p>
            <Link href={generateHref} className={`inline-flex items-center px-6 py-3 text-white font-bold rounded-xl transition-all shadow-lg ${colorClasses.split(" ").slice(2).join(" ")}`}>
              Generate Plan
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
