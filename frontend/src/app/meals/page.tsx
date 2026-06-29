"use client";

import { useEffect, useState } from "react";
import type { ComponentType } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { AIChat } from "@/components/ai/AIChat";
import { Utensils, ChevronRight, Flame, Zap, CheckCircle2, Loader2 } from "lucide-react";
import { api, getToken } from "@/lib/api";
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

type SummaryProps = {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  color: string;
};

export default function MealsPage() {
  const router = useRouter();
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMeals = async () => {
      if (!getToken()) {
        router.push("/login");
        return;
      }

      try {
        const res = await api.get("/api/meals");
        const plans = res.data as MealPlan[];
        setMealPlan(plans.find((plan) => plan.isActive) || plans[0] || null);
      } catch {
        toast.error("Failed to load meals");
      } finally {
        setIsLoading(false);
      }
    };

    loadMeals();
  }, [router]);

  const toggleMeal = async (dayIdx: number, mealIdx: number) => {
    if (!mealPlan) return;
    const usePlanData = !mealPlan.days && Boolean(mealPlan.planData);
    const source = mealPlan.days || mealPlan.planData || [];
    const days = source.map((d, di) =>
      di === dayIdx ? { ...d, meals: d.meals.map((m, mi) => (mi === mealIdx ? { ...m, completed: !m.completed } : m)) } : d
    );
    setMealPlan({ ...mealPlan, ...(usePlanData ? { planData: days } : { days }) });
    if (mealPlan._id) {
      try {
        await api.put(`/api/meals/${mealPlan._id}`, { days });
      } catch {
        toast.error("Marked locally, but couldn't sync to the server.");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <AIChat />

      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Your Meal Plan</h1>
            <p className="text-slate-700 mt-1">Fuel your body with the right nutrition.</p>
          </div>
          <Link href="/meals/generate" className="px-4 py-2 bg-white border border-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-50 transition-all text-sm shadow-sm">
            Regenerate Plan
          </Link>
        </div>

        {!mealPlan ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
            <div className="bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Utensils className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">No Plan Found</h2>
            <p className="text-slate-600 mb-8 max-w-sm mx-auto">You haven&apos;t generated a meal plan yet. Get personalized recommendations today.</p>
            <Link href="/meals/generate" className="inline-flex items-center px-8 py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-100">
              Generate My Plan
              <ChevronRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {(mealPlan.days || mealPlan.planData || []).map((dayPlan, idx) => (
              <div key={idx} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-green-600 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-green-100">
                      {dayPlan.day.substring(0, 2)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{dayPlan.day}</h3>
                      <p className="text-sm text-slate-600 font-medium">Daily Nutrition Target</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <Summary icon={Flame} label="Calories" value={`${dayPlan.totalCalories ?? dayPlan.estimatedCalories ?? 0} kcal`} color="text-orange-500" />
                    <Summary icon={Zap} label="Protein" value={`${dayPlan.totalProtein ?? dayPlan.estimatedProtein ?? 0}g`} color="text-yellow-500" />
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {dayPlan.meals.map((meal, mIdx) => (
                      <div key={mIdx} className="group p-4 rounded-2xl border border-slate-100 hover:border-green-200 hover:bg-green-50/30 transition-all flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-500">
                            <Utensils className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-green-600 mb-0.5">{meal.type}</p>
                            <h4 className={`font-bold transition-colors ${meal.completed ? "text-slate-400 line-through" : "text-slate-900 group-hover:text-green-700"}`}>{meal.name}</h4>
                            <p className="text-xs text-slate-500">{meal.calories} kcal - {meal.protein}g protein</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleMeal(idx, mIdx)}
                          aria-label={meal.completed ? `Mark ${meal.type} not done` : `Mark ${meal.type} done`}
                          aria-pressed={Boolean(meal.completed)}
                          className={`p-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 rounded-lg ${meal.completed ? "text-green-600" : "text-slate-400 hover:text-green-600"}`}
                        >
                          <CheckCircle2 className={`w-6 h-6 ${meal.completed ? "fill-green-100" : ""}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function Summary({ icon: Icon, label, value, color }: SummaryProps) {
  return (
    <div className="flex items-center gap-2">
      <Icon className={`w-5 h-5 ${color}`} />
      <div>
      <p className="text-[10px] uppercase font-bold text-slate-600">{label}</p>
        <p className="text-sm font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}
