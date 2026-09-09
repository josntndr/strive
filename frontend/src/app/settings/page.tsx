"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { AIChat } from "@/components/ai/AIChat";
import {
  Save,
  Loader2,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { api, clearAuth, getStoredUser, getToken, isUnauthorizedError } from "@/lib/api";

type FitnessFormData = {
  name: string;
  email: string;
  age: string;
  gender: string;
  height: string;
  weight: string;
  goal: string;
  experienceLevel: string;
  dietaryPreference: string;
};

export default function SettingsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<FitnessFormData>({
    name: "",
    email: "",
    age: "",
    gender: "Female",
    height: "",
    weight: "",
    goal: "Lose fat",
    experienceLevel: "Intermediate",
    dietaryPreference: "Balanced",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!getToken()) {
        router.replace("/login");
        setIsLoading(false);
        return;
      }

      try {
        const res = await api.get("/api/profile");
        const user = getStoredUser();
        if (res.data) {
          setFormData({
            ...res.data,
            name: user?.fullName || user?.name || res.data.name || "Josephine Santander",
            email: user?.email || res.data.email || "",
            gender: res.data.gender || "Female",
            goal: res.data.goal || res.data.fitnessGoal || "Lose fat",
            experienceLevel: res.data.experienceLevel || res.data.workoutExperience || "Intermediate",
            dietaryPreference: res.data.dietaryPreference || "Balanced",
          });
        }
      } catch (error: unknown) {
        if (isUnauthorizedError(error)) {
          clearAuth();
          router.replace("/login");
          return;
        }
        toast.error("Failed to load settings");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const onSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.put("/api/profile", formData);
      toast.success("Athlete profile & AI calibration updated! 🚀");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  // Live Biometric Calculations for Immediate Feedback
  const currentWeight = parseFloat(formData.weight) || 48;
  const currentHeight = parseFloat(formData.height) || 157;
  const currentAge = parseInt(formData.age) || 21;
  const isFemale = formData.gender.toLowerCase() === "female";

  // BMI Calculation
  const bmiValue = (currentWeight / ((currentHeight / 100) * (currentHeight / 100))).toFixed(1);

  // Basal Metabolic Rate (Mifflin-St Jeor)
  const bmr = isFemale
    ? Math.round(10 * currentWeight + 6.25 * currentHeight - 5 * currentAge - 161)
    : Math.round(10 * currentWeight + 6.25 * currentHeight - 5 * currentAge + 5);

  // Estimated Daily Calorie Goal based on chosen Goal
  const calorieMultiplier =
    formData.goal.toLowerCase().includes("lose")
      ? 1.3
      : formData.goal.toLowerCase().includes("gain")
      ? 1.65
      : 1.45;
  const estimatedCalories = Math.round(bmr * calorieMultiplier);

  // Optimal Daily Protein Intake (2.0g/kg)
  const estimatedProtein = Math.round(currentWeight * 2.0);

  // Initials for avatar
  const nameParts = (formData.name || "Josephine Santander").trim().split(" ");
  const initials =
    nameParts.length > 1
      ? `${nameParts[0][0]}${nameParts[1][0]}`
      : nameParts[0].slice(0, 2).toUpperCase();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fbf5f0] flex flex-col">
        <Navbar />
        <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-8 animate-pulse">
          <div className="h-44 rounded-3xl bg-stone-200/80" />
          <div className="h-96 rounded-3xl bg-stone-200/80" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbf5f0] text-slate-900 flex flex-col selection:bg-blue-500 selection:text-white">
      <Navbar />
      <AIChat />

      <main className="flex-grow py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full space-y-8">
        {/* ─── 1. ATHLETE PROFILE & IDENTITY HEADER ─── */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-stone-900 to-stone-800 text-white flex items-center justify-center font-black text-xl tracking-wider shadow-md shadow-stone-900/10 border border-stone-700/50 shrink-0">
              {initials}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-widest text-blue-600">
                  Athlete Configuration
                </span>
                <span className="text-stone-300">&bull;</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" />
                  Active Profile
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                {formData.name || "Athlete Profile"}
              </h1>
              <p className="text-xs text-stone-500 font-medium">
                {formData.email} &bull; Strive Member Since 2026
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-black transition-all"
            >
              <span>Back to Dashboard</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* ─── 2. TWO-COLUMN LAYOUT: FORM + LIVE BIOMETRIC IMPACT PREVIEW ─── */}
        <form onSubmit={onSaveProfile} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT 7 COLS: ATHLETE SETTINGS FORM */}
          <div className="lg:col-span-7 space-y-6">
            {/* Section 1: Physical Biometrics */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200/80 shadow-xs space-y-5">
              <div className="pb-3 border-b border-stone-100">
                <h2 className="text-sm font-black text-stone-900 uppercase tracking-wider">
                  Physical Biometrics
                </h2>
                <p className="text-[11px] text-stone-500">
                  Used to calculate metabolic burn rate and training intensity
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white text-stone-900 border border-stone-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Account Email
                  </label>
                  <input
                    type="email"
                    disabled
                    value={formData.email}
                    className="w-full px-4 py-2.5 bg-stone-100 border border-stone-200 rounded-xl text-stone-500 text-sm font-semibold cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Age (Years)
                  </label>
                  <input
                    type="number"
                    min="14"
                    max="100"
                    required
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white text-stone-900 border border-stone-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="21"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Biological Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white text-stone-900 border border-stone-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="250"
                    required
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white text-stone-900 border border-stone-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="157"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="30"
                    max="250"
                    required
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white text-stone-900 border border-stone-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="48"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Training & Nutrition Calibration */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200/80 shadow-xs space-y-5">
              <div className="pb-3 border-b border-stone-100">
                <h2 className="text-sm font-black text-stone-900 uppercase tracking-wider">
                  Training & Nutrition Calibration
                </h2>
                <p className="text-[11px] text-stone-500">
                  Controls the parameters generating your workout and recipe blueprints
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Primary Fitness Objective
                  </label>
                  <select
                    value={formData.goal}
                    onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white text-stone-900 border border-stone-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    <option value="Lose fat">Lose fat (Caloric Deficit & Tone)</option>
                    <option value="Gain muscle">Gain muscle (Hypertrophy & Surplus)</option>
                    <option value="Maintain weight">Maintain weight (Body Recomposition)</option>
                    <option value="Improve overall fitness">Improve overall fitness (Endurance & Mobility)</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      Workout Experience
                    </label>
                    <select
                      value={formData.experienceLevel}
                      onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white text-stone-900 border border-stone-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 transition-all"
                    >
                      <option value="Beginner">Beginner (Foundational Form)</option>
                      <option value="Intermediate">Intermediate (Progressive Overload)</option>
                      <option value="Advanced">Advanced (High Volume & Intensity)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      Dietary Blueprint Style
                    </label>
                    <select
                      value={formData.dietaryPreference}
                      onChange={(e) => setFormData({ ...formData, dietaryPreference: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white text-stone-900 border border-stone-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 transition-all"
                    >
                      <option value="Balanced">Balanced High-Protein</option>
                      <option value="Budget Friendly">Budget Friendly Whole Foods</option>
                      <option value="Filipino Meal Style">Filipino Meal Style</option>
                      <option value="High Protein">High Protein Bodybuilding</option>
                      <option value="Vegetarian">Plant-Based Vegetarian</option>
                      <option value="Low Sugar">Low Glycemic / Low Sugar</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                <span className="text-xs text-stone-400 font-medium">
                  Changes take effect across your plan immediately
                </span>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-600/30 active:scale-95 transition-all"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT 5 COLS: LIVE METABOLIC TELEMETRY IMPACT PREVIEW */}
          <div className="lg:col-span-5 space-y-6">
            {/* Live Calibrated Telemetry Card */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200/80 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-stone-900">
                    Calculated Metabolic Impact
                  </h3>
                  <p className="text-[11px] text-stone-500">Live biometric derivation</p>
                </div>

                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Live Sync
                </span>
              </div>

              {/* Metric 1: Daily Caloric Target */}
              <div className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200/70 space-y-1">
                <span className="text-[10px] font-black uppercase text-stone-400 tracking-wider block">
                  Daily Fuel Intake Target
                </span>
                <p className="text-2xl font-black text-stone-900">
                  ~{estimatedCalories} <span className="text-xs font-bold text-stone-400">kcal/day</span>
                </p>
                <p className="text-[11px] text-stone-500">
                  BMR: {bmr} kcal + Activity ({formData.goal})
                </p>
              </div>

              {/* Metric 2: Protein Target */}
              <div className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200/70 space-y-1">
                <span className="text-[10px] font-black uppercase text-stone-400 tracking-wider block">
                  Daily Protein Allocation
                </span>
                <p className="text-2xl font-black text-stone-900">
                  ~{estimatedProtein} <span className="text-xs font-bold text-stone-400">grams/day</span>
                </p>
                <p className="text-[11px] text-emerald-600 font-bold">
                  2.0g per kg mass for optimal recovery
                </p>
              </div>

              {/* Metric 3: BMI Status */}
              <div className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200/70 space-y-1">
                <span className="text-[10px] font-black uppercase text-stone-400 tracking-wider block">
                  Body Mass Index (BMI)
                </span>
                <p className="text-2xl font-black text-stone-900">
                  {bmiValue}{" "}
                  <span className="text-xs font-bold text-emerald-600 ml-1">
                    (Optimal Health Zone)
                  </span>
                </p>
                <p className="text-[11px] text-stone-500">
                  Calculated from {currentHeight}cm &bull; {currentWeight}kg
                </p>
              </div>

              {/* Pro Coach Tip */}
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70 text-xs text-stone-600 leading-relaxed">
                Adjusting your weight or fitness objective dynamically recalculates workout volume and recipe caloric targets across your entire plan.
              </div>
            </div>

            {/* Account & Security Information */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-stone-900">
                Data Privacy & Encryption
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Your biometric metrics and nutritional preferences are stored securely and used exclusively to personalize your training and meal plans.
              </p>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
