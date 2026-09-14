"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { AIChat } from "@/components/ai/AIChat";
import {
  Utensils,
  ChevronRight,
  Flame,
  Zap,
  CheckCircle2,
  RefreshCw,
  Clock,
  Heart,
  Target,
  ArrowRight,
  Check,
  CheckCheck,
  Apple,
  Salad,
  Coffee,
  Sun,
  Moon,
  Info,
  Layers,
  Activity,
  Droplets,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { api, clearAuth, getLocalCache, getToken, isUnauthorizedError, setLocalCache } from "@/lib/api";
import { toast } from "react-hot-toast";

type Meal = {
  type: string;
  name: string;
  calories: number;
  protein: number;
  completed?: boolean;
};

type MealDay = {
  day: string;
  meals: Meal[];
  totalCalories?: number;
  estimatedCalories?: number;
  totalProtein?: number;
  estimatedProtein?: number;
};

type MealPlan = {
  _id?: string;
  isActive?: boolean;
  days?: MealDay[];
  planData?: MealDay[];
};

type FitnessProfile = {
  weight?: number;
  height?: number;
  fitnessGoal?: string;
  dietaryPreference?: string;
};

function getMealTypeIcon(type: string) {
  const t = (type || "").toLowerCase();
  if (t.includes("break")) return Coffee;
  if (t.includes("lunch")) return Sun;
  if (t.includes("din")) return Moon;
  if (t.includes("snack")) return Apple;
  return Salad;
}

function getMealTypeStyles(type: string) {
  const t = (type || "").toLowerCase();
  if (t.includes("break")) {
    return { badgeBg: "bg-amber-50", badgeText: "text-amber-700", badgeBorder: "border-amber-200", iconColor: "text-amber-600" };
  }
  if (t.includes("lunch")) {
    return { badgeBg: "bg-emerald-50", badgeText: "text-emerald-700", badgeBorder: "border-emerald-200", iconColor: "text-emerald-600" };
  }
  if (t.includes("din")) {
    return { badgeBg: "bg-purple-50", badgeText: "text-purple-700", badgeBorder: "border-purple-200", iconColor: "text-purple-600" };
  }
  return { badgeBg: "bg-blue-50", badgeText: "text-blue-700", badgeBorder: "border-blue-200", iconColor: "text-blue-600" };
}

function getMealTiming(type: string) {
  const t = (type || "").toLowerCase();
  if (t.includes("break")) return "7:00 – 9:00 AM";
  if (t.includes("lunch")) return "12:00 – 2:00 PM";
  if (t.includes("din")) return "6:30 – 8:30 PM";
  if (t.includes("snack")) return "3:30 – 4:30 PM";
  return "Flexible Fuel";
}

export default function MealsPage() {
  const router = useRouter();
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(() => {
    const cached = getLocalCache<MealPlan[]>("strive_cached_meals");
    if (cached && Array.isArray(cached) && cached.length > 0) {
      return cached.find((p) => p.isActive) || cached[0] || null;
    }
    return null;
  });
  const [profile, setProfile] = useState<FitnessProfile | null>(() => {
    const dash = getLocalCache<{ profile?: FitnessProfile }>("strive_cached_dashboard");
    return dash?.profile || null;
  });
  const [isLoading, setIsLoading] = useState(() => !getLocalCache("strive_cached_meals"));
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);

  useEffect(() => {
    let isActive = true;

    const loadData = async () => {
      if (!getToken()) {
        router.replace("/login");
        if (isActive) setIsLoading(false);
        return;
      }

      try {
        // Load meals and user profile in parallel
        const [mealsRes, dashRes] = await Promise.allSettled([
          api.get("/api/meals"),
          api.get("/api/dashboard"),
        ]);

        if (mealsRes.status === "fulfilled") {
          const plans = mealsRes.value.data as MealPlan[];
          setLocalCache("strive_cached_meals", plans);
          const active = plans.find((p) => p.isActive) || plans[0] || null;
          if (isActive) setMealPlan(active);
        }

        if (dashRes.status === "fulfilled" && dashRes.value.data?.profile) {
          if (isActive) setProfile(dashRes.value.data.profile);
        }
      } catch (error: unknown) {
        if (isUnauthorizedError(error)) {
          clearAuth();
          router.replace("/login");
          return;
        }
        if (!getLocalCache("strive_cached_meals")) {
          toast.error("Failed to load nutrition data");
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    loadData();

    return () => {
      isActive = false;
    };
  }, [router]);

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    try {
      await api.post("/api/meals/generate");
      toast.success("Fresh nutrition blueprint generated! 🥗");
      // Reload meals
      const res = await api.get("/api/meals");
      const plans = res.data as MealPlan[];
      const active = plans.find((p) => p.isActive) || plans[0] || null;
      setMealPlan(active);
      setSelectedDayIdx(0);
    } catch {
      toast.error("Failed to generate meal plan. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleMeal = async (dayIdx: number, mealIdx: number) => {
    if (!mealPlan) return;
    const usePlanData = !mealPlan.days && Boolean(mealPlan.planData);
    const source = mealPlan.days || mealPlan.planData || [];
    const days = source.map((d, di) =>
      di === dayIdx
        ? {
            ...d,
            meals: d.meals.map((m, mi) =>
              mi === mealIdx ? { ...m, completed: !m.completed } : m
            ),
          }
        : d
    );
    const updated = { ...mealPlan, ...(usePlanData ? { planData: days } : { days }) };
    setMealPlan(updated);

    const isNowDone = days[dayIdx].meals[mealIdx].completed;
    toast.success(isNowDone ? "Meal logged as enjoyed! 🍽️" : "Meal marked pending");

    if (mealPlan._id) {
      try {
        await api.put(`/api/meals/${mealPlan._id}`, { days });
      } catch {
        toast.error("Marked locally, but couldn't sync to the server.");
      }
    }
  };

  const userWeight = profile?.weight || 48;
  const targetCalories = Math.round(userWeight * 33);
  const targetProtein = Math.round(userWeight * 2.0);
  const targetCarbs = Math.round(userWeight * 3.5);
  const targetFats = Math.round(userWeight * 0.9);

  const allDays = mealPlan?.days || mealPlan?.planData || [];
  const currentDay = allDays[selectedDayIdx] || allDays[0];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fbf5f0] flex flex-col">
        <Navbar />
        <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full space-y-8 animate-pulse">
          <div className="h-72 rounded-3xl bg-stone-200/80" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-32 rounded-3xl bg-stone-200/80" />
            <div className="h-32 rounded-3xl bg-stone-200/80" />
            <div className="h-32 rounded-3xl bg-stone-200/80" />
          </div>
          <div className="h-96 rounded-3xl bg-stone-200/80" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbf5f0] text-slate-900 flex flex-col selection:bg-[#ed4f28] selection:text-white">
      <Navbar />
      <AIChat />

      <main className="flex-grow py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full space-y-8">
        {/* ─── 1. EDITORIAL CULINARY HERO BANNER ─── */}
        <div className="relative rounded-3xl overflow-hidden shadow-xl border border-stone-900/10 min-h-[320px] sm:min-h-[360px] flex items-end">
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/meal_prep.jpg"
              alt="Gourmet high protein athlete meal prep"
              fill
              priority
              className="object-cover object-center"
              sizes="(max-width: 1280px) 100vw, 1280px"
            />
            {/* Multi-stop cinematic gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
          </div>

          <div className="relative z-10 p-6 sm:p-10 w-full max-w-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-[#ed4f28] text-white text-xs font-black uppercase tracking-wider shadow-md shadow-[#ed4f28]/30">
                Athlete Nutrition Engine
              </span>
              <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-bold border border-white/20">
                {profile?.dietaryPreference || "High-Protein Balanced"}
              </span>
              <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-bold border border-white/20">
                {targetCalories} kcal Daily Calibrated
              </span>
            </div>

            <div>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                Fuel & Macro Blueprint
              </h1>
              <p className="mt-2 text-stone-300 text-sm sm:text-base font-medium max-w-xl leading-relaxed">
                Personalized, macro-calibrated daily nutrition designed to fuel your training sessions, hit your protein goals, and accelerate recovery.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleGeneratePlan}
                disabled={isGenerating}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#ed4f28] hover:bg-[#d9421c] disabled:opacity-70 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-[#ed4f28]/30 transition-all active:scale-95 cursor-pointer"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                <span>{mealPlan ? "Regenerate Meal Plan" : "Generate My Plan"}</span>
              </button>

              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-xs font-bold border border-white/25 transition-all"
              >
                <span>Back to Dashboard</span>
                <ChevronRight className="w-3.5 h-3.5 text-stone-300" />
              </Link>
            </div>
          </div>
        </div>

        {/* ─── 2. MACRO TELEMETRY & BODY COMPOSITION BAR ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-stone-200/80 shadow-xs space-y-1">
            <span className="text-[10px] font-black uppercase text-stone-400 tracking-wider block">
              Daily Caloric Target
            </span>
            <p className="text-2xl font-black text-stone-900">{targetCalories} <span className="text-xs font-bold text-stone-400">kcal/day</span></p>
            <p className="text-[11px] text-stone-500 font-medium">Maintenance & Lean Fuel for {userWeight}kg</p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-stone-200/80 shadow-xs space-y-1">
            <span className="text-[10px] font-black uppercase text-stone-400 tracking-wider block">
              Protein Target (25%)
            </span>
            <p className="text-2xl font-black text-stone-900">{targetProtein} <span className="text-xs font-bold text-stone-400">grams</span></p>
            <p className="text-[11px] text-emerald-600 font-bold">2.0g per kg body mass (Optimal MPS)</p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-stone-200/80 shadow-xs space-y-1">
            <span className="text-[10px] font-black uppercase text-stone-400 tracking-wider block">
              Macro Proportions
            </span>
            {/* Visual multi-segment proportional bar */}
            <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden flex shadow-inner my-2">
              <div className="bg-emerald-500 h-full w-[25%]" title="Protein 25%" />
              <div className="bg-amber-500 h-full w-[45%]" title="Carbs 45%" />
              <div className="bg-purple-500 h-full w-[30%]" title="Fats 30%" />
            </div>
            <div className="flex items-center justify-between text-[10px] font-bold text-stone-600">
              <span className="text-emerald-700 font-black">{targetProtein}g P (25%)</span>
              <span className="text-amber-700 font-black">{targetCarbs}g C (45%)</span>
              <span className="text-purple-700 font-black">{targetFats}g F (30%)</span>
            </div>
          </div>
        </div>

        {/* ─── 3. MAIN SECTION: ACTIVE PLAN VS. INSPIRING BLUEPRINT PREVIEW ─── */}
        {!mealPlan || allDays.length === 0 ? (
          /* ── When No Plan Found: Inspiring Interactive Showcase ── */
          <div className="space-y-6">
            {/* Generator Callout Box */}
            <div className="p-8 sm:p-10 rounded-3xl bg-white border border-stone-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black border border-emerald-200">
                  Ready to Activate Nutrition Engine
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                  No Active Meal Plan Yet
                </h2>
                <p className="text-stone-600 text-sm leading-relaxed">
                  Generate your personalized 7-day culinary schedule tailored to your body weight ({userWeight} kg) and {profile?.dietaryPreference || "budget-friendly"} dietary focus.
                </p>
              </div>

              <button
                type="button"
                onClick={handleGeneratePlan}
                disabled={isGenerating}
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-600/30 active:scale-95 transition-all whitespace-nowrap"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Curating Ingredients...</span>
                  </>
                ) : (
                  <>
                    <span>Generate My Meal Plan</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Preview of Chef Recipes */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <div>
                  <h3 className="text-lg font-black text-stone-900 tracking-tight">
                    Preview Sample Menu Recipes
                  </h3>
                  <p className="text-xs text-stone-500">
                    High-protein recipes calibrated to your daily {targetCalories} kcal goal
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-600">Sample Preview</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Sample 1: Breakfast */}
                <div className="bg-white rounded-3xl border border-stone-200/80 p-5 shadow-xs space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        Breakfast Fuel
                      </span>
                      <span className="text-xs font-mono font-bold text-stone-400">~380 kcal</span>
                    </div>
                    <h4 className="font-extrabold text-stone-900 text-base">
                      Protein Rolled Oats & Berry Parfait
                    </h4>
                    <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                      Organic rolled oats, vanilla whey isolate, chia seeds, fresh blueberries, and crushed almonds.
                    </p>
                  </div>
                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-600">28g Protein</span>
                    <span className="text-stone-400">Prep: 5 min</span>
                  </div>
                </div>

                {/* Sample 2: Lunch */}
                <div className="bg-white rounded-3xl border border-stone-200/80 p-5 shadow-xs space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Athlete Lunch
                      </span>
                      <span className="text-xs font-mono font-bold text-stone-400">~580 kcal</span>
                    </div>
                    <h4 className="font-extrabold text-stone-900 text-base">
                      Flame-Seared Salmon & Quinoa Bowl
                    </h4>
                    <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                      Wild salmon fillet, fluffy lemon quinoa, ripe sliced avocado, steamed edamame, and roasted sweet potatoes.
                    </p>
                  </div>
                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-600">44g Protein</span>
                    <span className="text-stone-400">Prep: 15 min</span>
                  </div>
                </div>

                {/* Sample 3: Dinner */}
                <div className="bg-white rounded-3xl border border-stone-200/80 p-5 shadow-xs space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                        Recovery Dinner
                      </span>
                      <span className="text-xs font-mono font-bold text-stone-400">~520 kcal</span>
                    </div>
                    <h4 className="font-extrabold text-stone-900 text-base">
                      Herb-Roasted Chicken Breast & Greens
                    </h4>
                    <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                      Marinated chicken breast, garlic-roasted asparagus spears, brown rice medley, and extra virgin olive oil drizzle.
                    </p>
                  </div>
                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-600">48g Protein</span>
                    <span className="text-stone-400">Prep: 20 min</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ── When Plan Exists: Active Multi-Day Nutritional Menu ── */
          <div className="space-y-6">
            {/* Day Selector Tabs */}
            {allDays.length > 1 && (
              <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
                {allDays.map((day, dIdx) => {
                  const isSelected = dIdx === selectedDayIdx;
                  const completedCount = day.meals.filter((m) => m.completed).length;
                  const allDone = day.meals.length > 0 && completedCount === day.meals.length;
                  return (
                    <button
                      key={dIdx}
                      type="button"
                      onClick={() => setSelectedDayIdx(dIdx)}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border text-left whitespace-nowrap transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#ed4f28] text-white border-[#ed4f28] shadow-md shadow-[#ed4f28]/25"
                          : "bg-white border-slate-200/90 text-slate-700 hover:border-slate-300 hover:bg-slate-50 shadow-2xs"
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                          isSelected
                            ? "bg-white/20 text-white"
                            : allDone
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {allDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : `D${dIdx + 1}`}
                      </div>
                      <div>
                        <p className={`text-xs font-black ${isSelected ? "text-white" : "text-slate-900"}`}>
                          {day.day}
                        </p>
                        <p className={`text-[10px] font-medium ${isSelected ? "text-orange-100" : "text-slate-400"}`}>
                          {allDone ? "All Eaten ✓" : `${completedCount}/${day.meals.length} Eaten`}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Active Day Menu Card */}
            {currentDay && (() => {
              const completedMealsCount = currentDay.meals.filter((m) => m.completed).length;
              const totalMealsCount = currentDay.meals.length;
              const allDone = totalMealsCount > 0 && completedMealsCount === totalMealsCount;
              const progressPercent = totalMealsCount > 0 ? Math.round((completedMealsCount / totalMealsCount) * 100) : 0;
              const eatenCalories = currentDay.meals.filter((m) => m.completed).reduce((sum, m) => sum + m.calories, 0);
              const eatenProtein = currentDay.meals.filter((m) => m.completed).reduce((sum, m) => sum + m.protein, 0);
              const dayTargetCalories = currentDay.totalCalories ?? currentDay.estimatedCalories ?? targetCalories;
              const dayTargetProtein = currentDay.totalProtein ?? currentDay.estimatedProtein ?? targetProtein;

              return (
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
                  {/* Header */}
                  <div className="p-6 sm:p-7 border-b border-slate-100 bg-slate-50/60">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-orange-50 border border-orange-200 text-[#ed4f28] flex items-center justify-center font-black text-sm shadow-2xs shrink-0">
                          D{selectedDayIdx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                              {currentDay.day} Meal Plan
                            </h2>
                            {allDone && (
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                                ✓ Complete
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">
                            Daily target: {dayTargetCalories} kcal &bull; {dayTargetProtein}g protein
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 shadow-2xs">
                          <Flame className="w-3.5 h-3.5 text-[#ed4f28]" />
                          <span>{eatenCalories} / {dayTargetCalories} kcal</span>
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 shadow-2xs">
                          <Zap className="w-3.5 h-3.5 text-amber-500" />
                          <span>{eatenProtein} / {dayTargetProtein}g Protein</span>
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{completedMealsCount} of {totalMealsCount} Logged</span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1.5">
                        <span>Daily Nutrition Progress</span>
                        <span className="font-bold text-slate-800">{progressPercent}% Logged</span>
                      </div>
                      <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-[#ed4f28] to-emerald-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Meals Grid */}
                  <div className="p-6 sm:p-7 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                      {currentDay.meals.map((meal, mIdx) => {
                        const Icon = getMealTypeIcon(meal.type);
                        const styles = getMealTypeStyles(meal.type);
                        const timing = getMealTiming(meal.type);
                        const estCarbs = Math.max(12, Math.round(((meal.calories - meal.protein * 4) * 0.65) / 4));
                        const estFats = Math.max(4, Math.round(((meal.calories - meal.protein * 4) * 0.35) / 9));

                        return (
                          <div
                            key={mIdx}
                            className={`p-5 sm:p-6 rounded-3xl border transition-all flex flex-col justify-between gap-5 group ${
                              meal.completed
                                ? "bg-emerald-50/50 border-emerald-200/90 shadow-2xs"
                                : "bg-white border-slate-200/90 hover:border-orange-300 hover:shadow-md"
                            }`}
                          >
                            <div className="space-y-3">
                              {/* Top meta row */}
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${styles.badgeBg} ${styles.badgeText} ${styles.badgeBorder}`}>
                                    <Icon className={`w-3 h-3 ${styles.iconColor}`} />
                                    {meal.type}
                                  </span>
                                  <span className="text-[11px] font-medium text-slate-400">
                                    {timing}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200/70">
                                    {meal.calories} kcal
                                  </span>
                                  <span className="text-xs font-mono font-bold text-[#ed4f28] bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200/70">
                                    {meal.protein}g protein
                                  </span>
                                </div>
                              </div>

                              {/* Meal Name */}
                              <div>
                                <h4
                                  className={`text-base sm:text-lg font-black tracking-tight leading-snug transition-colors ${
                                    meal.completed ? "line-through text-slate-400" : "text-slate-950 group-hover:text-[#ed4f28]"
                                  }`}
                                >
                                  {meal.name}
                                </h4>
                              </div>

                              {/* Macro breakdown tags */}
                              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-orange-50/80 border border-orange-100 text-[#ed4f28]">
                                  Protein: {meal.protein}g
                                </span>
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50/80 border border-amber-100 text-amber-700">
                                  Carbs: ~{estCarbs}g
                                </span>
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50/80 border border-emerald-100 text-emerald-700">
                                  Fats: ~{estFats}g
                                </span>
                              </div>
                            </div>

                            {/* Action Row */}
                            <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between gap-3">
                              <span className="text-xs font-semibold">
                                {meal.completed ? (
                                  <span className="text-emerald-700 font-bold inline-flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    Logged & Eaten
                                  </span>
                                ) : (
                                  <span className="text-slate-400 inline-flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                    Ready to enjoy
                                  </span>
                                )}
                              </span>

                              <button
                                type="button"
                                onClick={() => toggleMeal(selectedDayIdx, mIdx)}
                                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                                  meal.completed
                                    ? "bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-100 shadow-2xs"
                                    : "bg-[#ed4f28] hover:bg-[#d9421c] text-white shadow-sm shadow-[#ed4f28]/25"
                                }`}
                              >
                                {meal.completed ? (
                                  <>
                                    <span>✓ Eaten</span>
                                    <RotateCcw className="w-3 h-3 text-emerald-600" />
                                  </>
                                ) : (
                                  <>
                                    <span>Mark as Eaten</span>
                                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </main>
    </div>
  );
}
