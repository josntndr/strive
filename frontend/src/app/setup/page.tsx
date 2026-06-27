"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Loader2,
  Info
} from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { toast } from "react-hot-toast";
import { api, getApiErrorMessage, getToken } from "@/lib/api";

const STEPS = [
  { id: 1, title: "Basic Info", description: "Your physical profile" },
  { id: 2, title: "Goals", description: "What do you want to achieve?" },
  { id: 3, title: "Preferences", description: "Workout & diet details" },
];

export default function SetupPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    age: "",
    gender: "Male",
    height: "",
    weight: "",
    goals: ["Improve overall fitness"],
    experienceLevel: "Beginner",
    location: "Gym",
    daysPerWeek: "3",
    duration: "60",
    focus: "Full body",
    dietaryPreference: "Balanced",
    restrictions: "",
  });

  // Hydrate the form with the user's existing profile so editing doesn't reset fields.
  useEffect(() => {
    if (!getToken()) return;
    api
      .get("/api/profile")
      .then((res) => {
        const p = res.data || {};
        setFormData((prev) => ({
          ...prev,
          age: p.age != null ? String(p.age) : prev.age,
          gender: p.gender || prev.gender,
          height: p.height != null ? String(p.height) : prev.height,
          weight: p.weight != null ? String(p.weight) : prev.weight,
          goals: p.fitnessGoal ? String(p.fitnessGoal).split(",").map((g: string) => g.trim()).filter(Boolean) : prev.goals,
          experienceLevel: p.workoutExperience || prev.experienceLevel,
          location: p.workoutLocation || prev.location,
          daysPerWeek: p.workoutDaysPerWeek != null ? String(p.workoutDaysPerWeek) : prev.daysPerWeek,
          duration: p.workoutDuration != null ? String(p.workoutDuration) : prev.duration,
          focus: p.targetBodyFocus || prev.focus,
          dietaryPreference: p.dietaryPreference || prev.dietaryPreference,
          restrictions: p.foodRestrictions || prev.restrictions,
        }));
      })
      .catch(() => {});
  }, []);

  const step1Valid = Boolean(formData.age && formData.height && formData.weight);

  const nextStep = () => {
    if (currentStep === 1 && !step1Valid) {
      toast.error("Please fill in your age, height, and weight to continue.");
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
  };
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const toggleGoal = (goal: string) => {
    setFormData((prev) => {
      const hasGoal = prev.goals.includes(goal);

      if (hasGoal && prev.goals.length === 1) {
        return prev;
      }

      return {
        ...prev,
        goals: hasGoal ? prev.goals.filter((item) => item !== goal) : [...prev.goals, goal],
      };
    });
  };

  const onSubmit = async () => {
    if (!getToken()) {
      toast.error("Please log in first.");
      router.push("/login");
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/api/profile", {
        ...formData,
        goal: formData.goals.join(", "),
      });
      toast.success("Profile saved successfully!");
      router.push("/dashboard");
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Error saving profile"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-2 rounded-xl">
              <BrandMark className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Complete Your Profile</h1>
          <p className="mt-2 text-slate-600 text-lg">Help us customize your fitness journey.</p>
        </div>

        {/* Stepper */}
        <div className="mb-12">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
            {STEPS.map((step) => (
              <div key={step.id} className="relative z-10 flex flex-col items-center">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    currentStep >= step.id 
                      ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100" 
                      : "bg-white border-slate-300 text-slate-500"
                  }`}
                >
                  {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
                </div>
                <div className="absolute top-12 whitespace-nowrap text-center">
                  <p className={`text-sm font-bold ${currentStep >= step.id ? "text-slate-900" : "text-slate-500"}`}>
                    {step.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 sm:p-10 mt-16 transition-all animate-in fade-in slide-in-from-bottom-4 duration-500">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Age</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900 placeholder-slate-500"
                    placeholder="e.g. 25"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Height (cm)</label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900 placeholder-slate-500"
                    placeholder="e.g. 175"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Weight (kg)</label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900 placeholder-slate-500"
                    placeholder="e.g. 70"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3 text-center sm:text-left">What is your primary fitness goal?</label>
                <p className="mb-4 text-sm text-slate-500 text-center sm:text-left">
                  Select one or more goals.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    "Lose fat", "Gain muscle", "Maintain weight", 
                    "Improve endurance", "Tone body", "Improve overall fitness"
                  ].map((goal) => (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => toggleGoal(goal)}
                      className={`px-4 py-4 rounded-2xl border-2 text-left transition-all ${
                        formData.goals.includes(goal) 
                          ? "bg-blue-50 border-blue-600 text-blue-700 font-bold" 
                          : "bg-slate-50 border-slate-100 text-slate-600 hover:border-slate-200"
                      }`}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
                <div className="mt-4 text-sm text-slate-500">
                  Selected: {formData.goals.join(", ")}
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Experience Level</label>
                  <select
                    value={formData.experienceLevel}
                    onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Location</label>
                  <select
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  >
                    <option>Gym</option>
                    <option>Home</option>
                    <option>Both</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Days per Week</label>
                  <select
                    value={formData.daysPerWeek}
                    onChange={(e) => setFormData({ ...formData, daysPerWeek: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map(d => <option key={d} value={d}>{d} days</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Workout Duration</label>
                  <select
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  >
                    {[30, 45, 60, 75, 90].map((d) => <option key={d} value={d}>{d} minutes</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Dietary Preference</label>
                  <select
                    value={formData.dietaryPreference}
                    onChange={(e) => setFormData({ ...formData, dietaryPreference: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  >
                    <option>Balanced</option>
                    <option>High protein</option>
                    <option>Budget friendly</option>
                    <option>Filipino meal style</option>
                    <option>Vegetarian</option>
                    <option>Low sugar</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Body Focus</label>
                <div className="flex flex-wrap gap-2">
                  {["Full body", "Core", "Glutes", "Legs", "Upper body", "Arms"].map((focus) => (
                    <button
                      key={focus}
                      onClick={() => setFormData({ ...formData, focus })}
                      className={`px-4 py-2 rounded-full border-2 transition-all ${
                        formData.focus === focus 
                          ? "bg-blue-600 border-blue-600 text-white font-semibold" 
                          : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      {focus}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Restrictions / Allergies</label>
                  <textarea
                    value={formData.restrictions}
                    onChange={(e) => setFormData({ ...formData, restrictions: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900 placeholder-slate-500"
                    placeholder="e.g. Peanut allergy, lactose intolerant..."
                    rows={3}
                  />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-12 flex justify-between gap-4">
            {currentStep > 1 ? (
              <button
                onClick={prevStep}
                className="flex items-center px-6 py-3 text-sm font-bold text-slate-600 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all"
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                Back
              </button>
            ) : (
              <div />
            )}
            
            {currentStep < STEPS.length ? (
              <button
                onClick={nextStep}
                disabled={currentStep === 1 && !step1Valid}
                className="flex items-center px-8 py-3 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
                <ChevronRight className="w-5 h-5 ml-2" />
              </button>
            ) : (
              <button
                onClick={onSubmit}
                disabled={isLoading}
                className="flex items-center px-8 py-3 text-sm font-bold text-white bg-green-600 rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-100 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <Check className="w-5 h-5 mr-2" />
                )}
                Save Profile
              </button>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 flex items-start gap-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
          <Info className="w-5 h-5 text-blue-500 mt-0.5" />
          <p className="text-sm text-blue-700 leading-relaxed">
            Your data is used strictly to generate the most effective plans for your body and goals. You can update these settings at any time in your dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
