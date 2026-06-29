"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Modal } from "@/components/Modal";
import type { LucideIcon } from "lucide-react";
import { Dumbbell, ChevronRight, Info, Clock, Target, CheckCircle2, Loader2, Home, Building2, ShieldAlert, TriangleAlert, Repeat2, PlayCircle } from "lucide-react";
import { api, getToken } from "@/lib/api";
import { toast } from "react-hot-toast";
import { resolveWorkoutVideo } from "@/lib/workoutDemoMap";
import { normalizeExerciseName } from "@/lib/normalizeExerciseName";
import { WorkoutDemo } from "@/components/workouts/WorkoutDemo";
import { AIChat } from "@/components/ai/AIChat";
import { getAlternatives, EQUIPMENT_OPTIONS, type EquipmentKey, type WorkoutAlternative } from "@/lib/alternativeWorkoutMap";

type Exercise = {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  equipment: string;
  locationType?: "Gym" | "Home" | "Both";
  targetMuscle?: string;
  difficulty?: string;
  instruction?: string;
  instructions?: string;
  steps?: string[];
  machineSetupTips?: string[];
  safetyTips?: string[];
  commonMistakes?: string[];
  completed?: boolean;
  notes?: string;
  visualDemo?: string;
  youtubeEmbedUrl?: string;
  alternativeExercise?: {
    name?: string;
    equipment?: string;
    locationType?: "Gym" | "Home" | "Both";
    summary?: string;
    youtubeEmbedUrl?: string;
  };
  alternativeExercises?: WorkoutAlternative[];
};

type WorkoutDay = {
  day: string;
  focus: string;
  workoutLocation?: string;
  exercises: Exercise[];
  completed?: boolean;
};

type WorkoutPlan = {
  _id?: string;
  isActive?: boolean;
  workoutLocation?: string;
  days?: WorkoutDay[];
  planData?: WorkoutDay[];
};

function enhanceExercise(exercise: Exercise): Exercise {
  // Standardize the name and resolve a real YouTube tutorial video for it.
  const name = normalizeExerciseName(exercise.name);
  const youtubeEmbedUrl = resolveWorkoutVideo(name, exercise.youtubeEmbedUrl);

  const alternative = exercise.alternativeExercise;
  const alternativeUrl = alternative
    ? resolveWorkoutVideo(normalizeExerciseName(alternative.name || ""), alternative.youtubeEmbedUrl)
    : "";

  return {
    ...exercise,
    name,
    youtubeEmbedUrl,
    alternativeExercise: alternative
      ? { ...alternative, name: alternative.name ? normalizeExerciseName(alternative.name) : alternative.name, youtubeEmbedUrl: alternativeUrl }
      : alternative,
  };
}

function enhanceWorkoutPlan(plan: WorkoutPlan | null): WorkoutPlan | null {
  if (!plan) return null;

  const enhanceDay = (day: WorkoutDay): WorkoutDay => ({
    ...day,
    exercises: (day.exercises || []).map(enhanceExercise),
  });

  return {
    ...plan,
    days: plan.days?.map(enhanceDay),
    planData: plan.planData?.map(enhanceDay),
  };
}

export default function WorkoutsPage() {
  const router = useRouter();
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState<{ exercise: Exercise; day: string } | null>(null);
  const [equipment, setEquipment] = useState<EquipmentKey>("none");
  const [demoAltName, setDemoAltName] = useState<string | null>(null);

  useEffect(() => {
    const loadWorkouts = async () => {
      if (!getToken()) {
        router.push("/login");
        return;
      }

      try {
        const res = await api.get("/api/workouts");
        const plans = res.data as WorkoutPlan[];
        const activePlan = plans.find((plan) => plan.isActive) || plans[0] || null;
        setWorkoutPlan(enhanceWorkoutPlan(activePlan));
      } catch {
        toast.error("Failed to load workouts");
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkouts();
  }, [router]);

  const workoutLocation = workoutPlan?.workoutLocation || workoutPlan?.days?.[0]?.workoutLocation || "Both";

  const alternatives = selectedExercise ? getAlternatives(selectedExercise.exercise, equipment) : [];

  const handleUseAlternative = async (alt: WorkoutAlternative) => {
    if (!selectedExercise || !workoutPlan) return;
    const { exercise: current, day } = selectedExercise;

    const replacement: Exercise = {
      ...current,
      name: alt.name,
      equipment: alt.equipment,
      locationType: alt.locationType,
      instruction: alt.instruction || current.instruction,
      instructions: alt.instruction || current.instructions,
      steps: alt.instruction ? [alt.instruction] : current.steps,
      youtubeEmbedUrl: alt.youtubeEmbedUrl,
      alternativeExercise: {
        name: current.name,
        equipment: current.equipment,
        locationType: current.locationType,
        summary: `Switch back to ${current.name} when you have the equipment.`,
        youtubeEmbedUrl: current.youtubeEmbedUrl,
      },
    };

    const replaceInDays = (days?: WorkoutDay[]) =>
      days?.map((d) =>
        d.day === day ? { ...d, exercises: d.exercises.map((e) => (e.name === current.name ? replacement : e)) } : d
      );

    const updated: WorkoutPlan = {
      ...workoutPlan,
      days: replaceInDays(workoutPlan.days),
      planData: replaceInDays(workoutPlan.planData),
    };

    setWorkoutPlan(updated);
    setSelectedExercise({ exercise: replacement, day });
    setDemoAltName(null);
    toast.success(`Switched to ${alt.name}`);

    if (workoutPlan._id) {
      try {
        await api.put(`/api/workouts/${workoutPlan._id}`, { days: updated.days || updated.planData });
      } catch {
        toast.error("Switched locally, but couldn't sync to the server.");
      }
    }
  };

  const toggleDayComplete = async (dayIdx: number) => {
    if (!workoutPlan) return;
    const usePlanData = !workoutPlan.days && Boolean(workoutPlan.planData);
    const source = workoutPlan.days || workoutPlan.planData || [];
    const days = source.map((d, di) =>
      di === dayIdx
        ? { ...d, completed: !d.completed, exercises: d.exercises.map((e) => ({ ...e, completed: !d.completed })) }
        : d
    );
    const updated: WorkoutPlan = { ...workoutPlan, ...(usePlanData ? { planData: days } : { days }) };
    setWorkoutPlan(updated);
    toast.success(days[dayIdx].completed ? "Workout completed! Great job." : "Marked as not done.");

    if (workoutPlan._id) {
      try {
        await api.put(`/api/workouts/${workoutPlan._id}`, { days: updated.days || updated.planData });
      } catch {
        toast.error("Marked locally, but couldn't sync to the server.");
      }
    }
  };

  const workoutLocationLabel = (() => {
    const value = workoutLocation.toLowerCase();
    if (value.includes("home") && value.includes("gym")) return "Flexible";
    if (value.includes("home")) return "Home-based";
    if (value.includes("gym")) return "Gym-based";
    return "Flexible";
  })();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <AIChat currentExercise={selectedExercise?.exercise.name} />

      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Your Workout Plan</h1>
            <p className="text-slate-700 mt-1">Consistency is the key to transformation.</p>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-700 shadow-sm">
              {workoutLocation.toLowerCase().includes("home") && !workoutLocation.toLowerCase().includes("gym") ? (
                <Home className="h-4 w-4 text-blue-600" />
              ) : (
                <Building2 className="h-4 w-4 text-blue-600" />
              )}
              <span>{workoutLocationLabel}</span>
            </div>
          </div>
          <Link href="/workouts/generate" className="px-4 py-2 bg-white border border-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-50 transition-all text-sm shadow-sm">
            Regenerate Plan
          </Link>
        </div>

        {!workoutPlan ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
            <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Dumbbell className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">No Plan Found</h2>
            <p className="text-slate-600 mb-8 max-w-sm mx-auto">You haven&apos;t generated a workout plan yet. Let&apos;s create one tailored for you.</p>
            <Link href="/workouts/generate" className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
              Generate My Plan
              <ChevronRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {(workoutPlan.days || workoutPlan.planData || []).map((dayPlan, idx) => (
              <div key={idx} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 flex items-center justify-between bg-white">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg bg-blue-600 text-white shadow-lg shadow-blue-100">
                      {dayPlan.day.substring(0, 2)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{dayPlan.day}</h3>
                      <p className="text-sm font-medium text-blue-700">{dayPlan.focus} Focus</p>
                      <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-700">
                        {dayPlan.workoutLocation?.toLowerCase().includes("home") && !dayPlan.workoutLocation?.toLowerCase().includes("gym") ? (
                          <Home className="h-3.5 w-3.5" />
                        ) : (
                          <Building2 className="h-3.5 w-3.5" />
                        )}
                        <span>{dayPlan.workoutLocation || workoutLocation}</span>
                      </div>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-slate-600 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>45-60 min</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600 text-sm">
                      <Target className="w-4 h-4" />
                      <span>{dayPlan.exercises.length} Exercises</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-slate-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {dayPlan.exercises.map((ex, exIdx) => (
                      <button
                        key={exIdx}
                        type="button"
                        onClick={() => {
                          setSelectedExercise({ exercise: ex, day: dayPlan.day });
                          setDemoAltName(null);
                        }}
                        className="group text-left p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{ex.name}</h4>
                          <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded capitalize">{ex.locationType || workoutLocation}</span>
                        </div>
                        <div className="mb-3 flex flex-wrap gap-2">
                          <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                            {ex.targetMuscle || "General strength"}
                          </span>
                          <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                            {ex.equipment}
                          </span>
                          <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                            {ex.difficulty || "Beginner"}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          <Metric label="Sets" value={ex.sets} />
                          <Metric label="Reps" value={ex.reps} />
                          <Metric label="Rest" value={ex.rest} />
                        </div>
                        <div className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed">
                          <Info className="w-3.5 h-3.5 mt-0.5 text-blue-500 shrink-0" />
                          <p>{ex.instruction || ex.instructions}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="mt-8 flex justify-center">
                    <button
                      type="button"
                      onClick={() => toggleDayComplete(idx)}
                      className={`flex items-center gap-2 px-6 py-3 font-bold rounded-xl transition-all shadow-lg ${
                        dayPlan.completed
                          ? "bg-green-600 text-white hover:bg-green-700"
                          : "bg-slate-900 text-white hover:bg-slate-800"
                      }`}
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      {dayPlan.completed ? "Completed" : "Complete Workout"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Modal
        isOpen={Boolean(selectedExercise)}
        onClose={() => {
          setSelectedExercise(null);
          setDemoAltName(null);
        }}
        title={selectedExercise?.exercise.name || "Exercise details"}
      >
        {selectedExercise && (
          <div className="space-y-6">
            {(() => {
              const loc = (selectedExercise.exercise.locationType || workoutLocation).toLowerCase();
              const home = loc.includes("home") && !loc.includes("gym");
              const both = loc.includes("both") || (loc.includes("home") && loc.includes("gym"));
              const label = both ? "Home & Gym Workout" : home ? "Home Workout" : "Gym Workout";
              const BadgeIcon = home ? Home : Building2;
              return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1.5 text-xs font-bold text-white">
                  <BadgeIcon className="h-3.5 w-3.5" />
                  {label}
                </span>
              );
            })()}

            <div className="flex flex-wrap gap-2">
              <Pill icon={selectedExercise.exercise.locationType?.toLowerCase().includes("home") && !selectedExercise.exercise.locationType?.toLowerCase().includes("gym") ? Home : Building2} label={selectedExercise.exercise.locationType || workoutLocation} />
              <Pill icon={Target} label={selectedExercise.exercise.targetMuscle || "General strength"} />
              <Pill icon={Dumbbell} label={selectedExercise.exercise.equipment} />
              <Pill icon={Repeat2} label={selectedExercise.exercise.difficulty || "Beginner"} />
            </div>

            <Section title="How to do it" icon={Dumbbell}>
              <ol className="space-y-2 list-decimal list-inside text-slate-700">
                {(selectedExercise.exercise.steps?.length ? selectedExercise.exercise.steps : [selectedExercise.exercise.instruction || selectedExercise.exercise.instructions || "Follow the movement slowly and keep your form controlled."]).map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </Section>

            {(() => {
              const loc = (selectedExercise.exercise.locationType || workoutLocation).toLowerCase();
              const home = loc.includes("home") && !loc.includes("gym");
              const tips = selectedExercise.exercise.machineSetupTips?.length
                ? selectedExercise.exercise.machineSetupTips
                : home
                  ? ["Clear a small space and use a mat if you have one.", "Use a sturdy chair, wall, or step where the move needs support."]
                  : ["Adjust the seat and pads so the movement lines up with your joints.", "Start with a light weight to learn the full range of motion."];
              return (
                <Section title={home ? "Home Setup Tips" : "Machine Setup Tips"} icon={Info}>
                  <ul className="space-y-2 text-slate-700">
                    {tips.map((tip, index) => (
                      <li key={index} className="flex gap-2">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </Section>
              );
            })()}

            <div className="grid gap-4 sm:grid-cols-2">
              <Section title="Safety tips" icon={ShieldAlert}>
                <ul className="space-y-2 text-slate-700">
                  {(selectedExercise.exercise.safetyTips?.length ? selectedExercise.exercise.safetyTips : ["Use a controlled pace.", "Stop if your form breaks down."]).map((tip, index) => (
                    <li key={index} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </Section>

              <Section title="Common mistakes" icon={TriangleAlert}>
                <ul className="space-y-2 text-slate-700">
                  {(selectedExercise.exercise.commonMistakes?.length ? selectedExercise.exercise.commonMistakes : ["Rushing the rep.", "Letting posture collapse."]).map((mistake, index) => (
                    <li key={index} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                      <span>{mistake}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            </div>

            <Section title="Workout Demo" icon={PlayCircle}>
              <WorkoutDemo
                exerciseName={selectedExercise.exercise.name}
                youtubeEmbedUrl={selectedExercise.exercise.youtubeEmbedUrl}
              />
            </Section>

            <Section title="Alternative Workouts" icon={Repeat2}>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-slate-500">Equipment you have:</span>
                {EQUIPMENT_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setEquipment(opt.key)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                      equipment === opt.key
                        ? "bg-blue-600 text-white"
                        : "border border-slate-200 bg-white text-slate-600 hover:border-blue-200"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {alternatives.length === 0 ? (
                <p className="text-sm text-slate-600">No alternatives available for this exercise yet.</p>
              ) : (
                <div className="space-y-3">
                  {alternatives.map((alt) => (
                    <div key={alt.name} className="rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="font-semibold text-slate-900">{alt.name}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {alt.equipment} · {alt.locationType}
                      </p>
                      <p className="mt-2 text-sm text-slate-600">{alt.reason}</p>
                      {alt.instruction && <p className="mt-1 text-sm text-slate-700">{alt.instruction}</p>}
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleUseAlternative(alt)}
                          className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
                        >
                          Use this alternative
                        </button>
                        <button
                          type="button"
                          onClick={() => setDemoAltName(demoAltName === alt.name ? null : alt.name)}
                          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:border-blue-200 transition-colors"
                        >
                          {demoAltName === alt.name ? "Hide demo" : "View demo"}
                        </button>
                      </div>
                      {demoAltName === alt.name && (
                        <div className="mt-4">
                          <WorkoutDemo
                            exerciseName={alt.name}
                            youtubeEmbedUrl={alt.youtubeEmbedUrl}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Section>
          </div>
        )}
      </Modal>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white p-2 rounded-lg border border-slate-100 text-center">
      <p className="text-[10px] uppercase tracking-wider font-bold text-slate-600">{label}</p>
      <p className="text-sm font-bold text-slate-900">{value}</p>
    </div>
  );
}

function Pill({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700">
      <Icon className="h-4 w-4 text-slate-500" />
      <span>{label}</span>
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: LucideIcon; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-4 w-4 text-blue-600" />
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
      </div>
      {children}
    </section>
  );
}
