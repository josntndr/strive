"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Sparkles, ArrowRight, ArrowLeft, Minus, Plus, Dumbbell, Activity, HeartPulse, Footprints } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { toast } from "react-hot-toast";
import { api, clearAuth, getToken, isUnauthorizedError } from "@/lib/api";

type Focus = { label: string; icon: LucideIcon; blurb: string };

const FOCUS_OPTIONS: Focus[] = [
  { label: "Full Body", icon: Dumbbell, blurb: "A balanced mix for the whole body" },
  { label: "Upper Body", icon: Dumbbell, blurb: "Chest, back, shoulders, and arms" },
  { label: "Lower Body", icon: Footprints, blurb: "Quads, hamstrings, and calves" },
  { label: "Glutes & Legs", icon: Footprints, blurb: "Glute-focused leg training" },
  { label: "Core", icon: Activity, blurb: "Abs and core stability" },
  { label: "Cardio", icon: HeartPulse, blurb: "Get your heart rate up" },
];

const MIN_EXERCISES = 3;
const MAX_EXERCISES = 10;

export default function GenerateWorkoutPage() {
  const router = useRouter();
  const [focus, setFocus] = useState<string | null>(null);
  const [count, setCount] = useState(6);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      toast.error("Please log in first.");
      router.replace("/login");
    }
  }, [router]);

  const generate = async () => {
    if (!focus || loading) return;
    setLoading(true);
    try {
      await api.post("/api/workouts/generate", { focus, exerciseCount: count });
      toast.success("Session generated!");
      router.replace("/workouts");
    } catch (error: unknown) {
      if (isUnauthorizedError(error)) {
        clearAuth();
        router.replace("/login");
        return;
      }

      toast.error("Failed to generate session");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="relative inline-block mb-8">
            <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 p-4 rounded-2xl relative z-10 animate-bounce flex items-center justify-center shadow-lg shadow-orange-500/30">
              <BrandMark className="h-10 w-10 text-white" />
            </div>
            <div className="absolute inset-0 bg-blue-100 rounded-2xl blur-xl animate-pulse -z-0 scale-150" />
            <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-brand-amber animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold text-ink mb-4">Building Your Session</h1>
          <p className="text-slate-600 mb-8 leading-relaxed">
            Putting together {count} {focus?.toLowerCase()} exercises matched to your profile.
          </p>
          <div className="flex items-center justify-center gap-3 text-blue-600 font-bold">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Optimizing exercises…</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="mb-6">
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-blue-600">
            <ArrowLeft className="h-4 w-4" /> Back to dashboard
          </Link>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-extrabold tracking-tight text-ink">Build your session</h1>
          <p className="mt-2 text-slate-600">Pick a focus and how many exercises you want for today.</p>

          {/* Focus */}
          <div className="mt-8">
            <p className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">What do you want to train?</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {FOCUS_OPTIONS.map((option) => {
                const selected = focus === option.label;
                return (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => setFocus(option.label)}
                    className={`flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-all ${
                      selected
                        ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600"
                        : "border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/40"
                    }`}
                  >
                    <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${selected ? "bg-blue-600 text-white" : "bg-slate-100 text-blue-600"}`}>
                      <option.icon className="h-5 w-5" />
                    </span>
                    <span className="text-sm font-bold text-ink">{option.label}</span>
                    <span className="text-xs text-slate-500 leading-snug">{option.blurb}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Exercise count */}
          <div className="mt-8">
            <p className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">How many exercises?</p>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setCount((c) => Math.max(MIN_EXERCISES, c - 1))}
                disabled={count <= MIN_EXERCISES}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 hover:border-blue-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Fewer exercises"
              >
                <Minus className="h-5 w-5" />
              </button>
              <div className="flex min-w-[5rem] flex-col items-center">
                <span className="text-4xl font-extrabold text-ink leading-none">{count}</span>
                <span className="mt-1 text-xs text-slate-500">exercises</span>
              </div>
              <button
                type="button"
                onClick={() => setCount((c) => Math.min(MAX_EXERCISES, c + 1))}
                disabled={count >= MAX_EXERCISES}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 hover:border-blue-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="More exercises"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={generate}
            disabled={!focus}
            className="mt-9 inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-7 py-4 text-base font-semibold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Generate Session
            <ArrowRight className="h-5 w-5" />
          </button>
          {!focus && <p className="mt-3 text-center text-xs text-slate-500">Choose a focus to continue.</p>}
        </div>
      </div>
    </div>
  );
}
