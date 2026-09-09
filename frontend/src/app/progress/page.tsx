"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { AIChat } from "@/components/ai/AIChat";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { api, clearAuth, getApiErrorMessage, getToken, isUnauthorizedError } from "@/lib/api";

type ProgressRecord = {
  id: string;
  date: string;
  weight?: number;
  waist?: number;
  hips?: number;
  notes?: string;
};

type FitnessProfile = {
  weight?: number;
  height?: number;
  fitnessGoal?: string;
};

export default function ProgressPage() {
  const router = useRouter();
  const [records, setRecords] = useState<ProgressRecord[]>([]);
  const [profile, setProfile] = useState<FitnessProfile | null>(null);
  const [streak, setStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    weight: "",
    waist: "",
    hips: "",
    notes: "",
  });

  const fetchRecords = useCallback(async () => {
    if (!getToken()) {
      router.replace("/login");
      setIsLoading(false);
      return;
    }

    try {
      const [progressRes, dashRes] = await Promise.allSettled([
        api.get<ProgressRecord[]>("/api/progress"),
        api.get("/api/dashboard"),
      ]);

      if (progressRes.status === "fulfilled") {
        setRecords(progressRes.value.data);
      }

      if (dashRes.status === "fulfilled" && dashRes.value.data) {
        if (dashRes.value.data.profile) setProfile(dashRes.value.data.profile);
        if (dashRes.value.data.workoutStreak) setStreak(dashRes.value.data.workoutStreak);
        // Pre-fill weight with profile weight if not already entered
        if (dashRes.value.data.profile?.weight) {
          setFormData((prev) => ({
            ...prev,
            weight: prev.weight || String(dashRes.value.data.profile.weight),
          }));
        }
      }
    } catch (error: unknown) {
      if (isUnauthorizedError(error)) {
        clearAuth();
        router.replace("/login");
        return;
      }
      toast.error(getApiErrorMessage(error, "Failed to load progress records"));
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchRecords();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchRecords]);

  const adjustWeight = (delta: number) => {
    setFormData((prev) => {
      const current = parseFloat(prev.weight) || profile?.weight || 48.0;
      const next = Math.max(30, Math.round((current + delta) * 10) / 10);
      return { ...prev, weight: next.toFixed(1) };
    });
  };

  const selectFeelingTag = (tag: string) => {
    setSelectedFeeling(tag);
    setFormData((prev) => {
      const existing = prev.notes ? prev.notes.replace(/\s*•\s*Energy:.*$/, "").trim() : "";
      const updatedNotes = existing ? `${existing} • Energy: ${tag}` : `Energy: ${tag}`;
      return { ...prev, notes: updatedNotes };
    });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/api/progress", formData);
      toast.success("Biometric check-in recorded! 📈");
      setFormData((prev) => ({
        weight: prev.weight,
        waist: "",
        hips: "",
        notes: "",
      }));
      setSelectedFeeling(null);
      await fetchRecords();
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Failed to log progress"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const baseWeight = profile?.weight || 48.0;
  const userHeight = profile?.height || 157;
  const bmi = (baseWeight / ((userHeight / 100) * (userHeight / 100))).toFixed(1);

  // Synthesize chart data (anchoring baseline if empty)
  const sortedRecords = [...records].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const chartData =
    sortedRecords.length > 0
      ? sortedRecords.map((r) => ({
          date: new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          weight: r.weight,
        }))
      : [
          { date: "Day 1", weight: baseWeight },
          { date: "Day 2", weight: baseWeight },
          { date: "Day 3", weight: baseWeight },
          { date: "Day 4", weight: baseWeight },
          { date: "Day 5", weight: baseWeight },
          { date: "Today", weight: baseWeight },
        ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fbf5f0] flex flex-col">
        <Navbar />
        <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8 animate-pulse">
          <div className="h-72 rounded-3xl bg-stone-200/80" />
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-3xl bg-stone-200/80" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 h-96 rounded-3xl bg-stone-200/80" />
            <div className="h-96 rounded-3xl bg-stone-200/80" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbf5f0] text-slate-900 flex flex-col selection:bg-blue-500 selection:text-white">
      <Navbar />
      <AIChat />

      <main className="flex-grow py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
        {/* ─── 1. EDITORIAL BIOMETRICS HERO BANNER ─── */}
        <div className="relative rounded-3xl overflow-hidden shadow-xl border border-stone-900/10 min-h-[320px] sm:min-h-[360px] flex items-end">
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/progress_hero.jpg"
              alt="Athlete tracking biometrics at sunrise"
              fill
              priority
              className="object-cover object-center"
              sizes="(max-width: 1280px) 100vw, 1280px"
            />
            {/* Cinematic multi-stop gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
          </div>

          <div className="relative z-10 p-6 sm:p-10 w-full max-w-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-blue-600 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-blue-500/30">
                Biometric Progression
              </span>
              <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-bold border border-white/20">
                Baseline: {baseWeight} kg
              </span>
              <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-bold border border-white/20">
                BMI {bmi} (Optimal Range)
              </span>
            </div>

            <div>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                Transformation Analytics
              </h1>
              <p className="mt-2 text-stone-300 text-sm sm:text-base font-medium max-w-xl leading-relaxed">
                Precision tracking of body mass trends, circumference shifts, and metabolic adaptions over your training cycle.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href="#log-section"
                className="inline-flex items-center px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-600/30 transition-all active:scale-95"
              >
                <span>Log Today&apos;s Biometrics</span>
              </a>
              <Link
                href="/dashboard"
                className="inline-flex items-center px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-xs font-bold border border-white/25 transition-all"
              >
                <span>Athlete Command Center</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ─── 2. BIOMETRIC PERFORMANCE TELEMETRY STRIP ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-stone-200/80 shadow-xs space-y-1">
            <span className="text-[10px] font-black uppercase text-stone-400 tracking-wider block">
              Current Mass
            </span>
            <p className="text-2xl sm:text-3xl font-black text-stone-900">
              {records[0]?.weight || baseWeight}{" "}
              <span className="text-xs font-bold text-stone-400">kg</span>
            </p>
            <p className="text-[11px] text-stone-500 font-medium">Height: {userHeight} cm</p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-stone-200/80 shadow-xs space-y-1">
            <span className="text-[10px] font-black uppercase text-stone-400 tracking-wider block">
              BMI Index
            </span>
            <p className="text-2xl sm:text-3xl font-black text-stone-900">{bmi}</p>
            <p className="text-[11px] text-emerald-600 font-bold">Optimal Health Classification</p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-stone-200/80 shadow-xs space-y-1">
            <span className="text-[10px] font-black uppercase text-stone-400 tracking-wider block">
              Workout Streak
            </span>
            <p className="text-2xl sm:text-3xl font-black text-stone-900">
              {streak} <span className="text-xs font-bold text-stone-400">days</span>
            </p>
            <p className="text-[11px] text-stone-500 font-medium">Consecutive Training Discipline</p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-stone-200/80 shadow-xs space-y-1">
            <span className="text-[10px] font-black uppercase text-stone-400 tracking-wider block">
              Logged Check-ins
            </span>
            <p className="text-2xl sm:text-3xl font-black text-stone-900">
              {records.length}{" "}
              <span className="text-xs font-bold text-stone-400">entries</span>
            </p>
            <p className="text-[11px] text-stone-500 font-medium">Phase 1 Telemetry Active</p>
          </div>
        </div>

        {/* ─── 3. MAIN WORKFLOW: CHART & FORM SPLIT ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left 7 Columns: Weight Trend Area Chart & Timeline Feed */}
          <div className="lg:col-span-7 space-y-6">
            {/* Weight Trend Chart Card */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-100">
                <div>
                  <h2 className="text-lg font-black text-stone-900 tracking-tight">
                    Body Mass Progression Curve
                  </h2>
                  <p className="text-xs text-stone-500">
                    {records.length > 1
                      ? `Tracking dynamic shift across ${records.length} data points`
                      : `Baseline established at ${baseWeight} kg`}
                  </p>
                </div>

                <span className="self-start sm:self-auto text-xs font-black px-3 py-1 rounded-full bg-stone-100 text-stone-700">
                  {records.length > 0 ? "Live Telemetry" : "Baseline Calibrated"}
                </span>
              </div>

              {/* Chart Area */}
              <div className="h-[280px] sm:h-[320px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ed4f28" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#ed4f28" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3ebe4" />
                    <XAxis
                      dataKey="date"
                      stroke="#a8a29e"
                      fontSize={11}
                      fontWeight={600}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#a8a29e"
                      fontSize={11}
                      fontWeight={600}
                      tickLine={false}
                      axisLine={false}
                      domain={["dataMin - 1.5", "dataMax + 1.5"]}
                      tickFormatter={(val) => `${val}kg`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1c1b1a",
                        color: "#fff",
                        borderRadius: "16px",
                        border: "none",
                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
                        fontSize: "12px",
                        fontWeight: "700",
                      }}
                      itemStyle={{ color: "#fa835c" }}
                      formatter={(val: unknown) => [`${val} kg`, "Weight"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="weight"
                      stroke="#ed4f28"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#weightGradient)"
                      dot={{ fill: "#ed4f28", stroke: "#ffffff", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: "#ed4f28", stroke: "#ffffff", strokeWidth: 3 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {records.length <= 1 && (
                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-100 text-xs text-stone-600 leading-relaxed">
                  Your profile baseline is locked at <strong>{baseWeight} kg</strong>. Log regular check-ins to unlock dynamic weekly trend lines.
                </div>
              )}
            </div>

            {/* ─── Progression Timeline (History Feed) ─── */}
            <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
              <div className="p-6 border-b border-stone-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider">
                    Biometric Timeline
                  </h3>
                  <p className="text-[11px] text-stone-500">Historical transformation records</p>
                </div>

                <span className="text-xs font-bold text-stone-400">
                  {records.length > 0 ? `${records.length} Recorded` : "Starting Profile"}
                </span>
              </div>

              <div className="p-6 space-y-3">
                {records.length > 0 ? (
                  records.map((r, idx) => (
                    <div
                      key={r.id}
                      className="p-4 rounded-2xl bg-stone-50/70 hover:bg-white border border-stone-200/70 hover:border-blue-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 text-stone-900 font-mono font-black text-xs flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          0{idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-stone-900 text-sm">
                              {r.weight ? `${r.weight} kg` : `${baseWeight} kg`}
                            </span>
                            <span className="text-[10px] font-bold text-stone-400">
                              {new Date(r.date).toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                          {(r.waist || r.hips) && (
                            <p className="text-[11px] text-stone-500 mt-0.5 font-medium">
                              {r.waist ? `Waist: ${r.waist}cm` : ""}{" "}
                              {r.waist && r.hips ? "• " : ""}
                              {r.hips ? `Hips: ${r.hips}cm` : ""}
                            </p>
                          )}
                        </div>
                      </div>

                      {r.notes && (
                        <div className="px-3 py-1 rounded-xl bg-white border border-stone-200 text-xs text-stone-600 italic max-w-xs truncate shadow-2xs">
                          {r.notes}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  /* Baseline Establishment Card */
                  <div className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200/70 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-200 text-stone-800 font-mono font-black text-xs flex items-center justify-center shrink-0">
                        00
                      </div>
                      <div>
                        <p className="font-extrabold text-stone-900 text-sm">
                          Profile Baseline &bull; {baseWeight} kg
                        </p>
                        <p className="text-xs text-stone-500 mt-0.5">
                          Initial setup complete. Ready to record your subsequent weigh-ins.
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                      Anchor
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right 5 Columns: Tactical Log Form & Achievements */}
          <div className="lg:col-span-5 space-y-6">
            {/* ─── Log Biometrics Form Card ─── */}
            <div
              id="log-section"
              className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200/80 shadow-xs space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div>
                  <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider">
                    Log Check-in
                  </h3>
                  <p className="text-[11px] text-stone-500">Record today&apos;s biometric metrics</p>
                </div>

                <span className="text-xs font-bold text-stone-400">Quick Entry</span>
              </div>

              <form onSubmit={onSubmit} className="space-y-4">
                {/* Weight Input with Stepper */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-black uppercase tracking-wider text-stone-700">
                      Current Weight (kg)
                    </label>
                    <span className="text-[11px] font-bold text-stone-400">
                      Baseline: {baseWeight} kg
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => adjustWeight(-0.5)}
                      className="w-11 h-11 rounded-xl bg-stone-100 hover:bg-stone-200 font-mono font-bold text-stone-800 text-sm transition-colors active:scale-95 shrink-0"
                    >
                      -0.5
                    </button>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      className="w-full text-center px-4 py-2.5 bg-white text-stone-900 font-mono font-black text-lg placeholder-stone-400 border border-stone-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                      placeholder={String(baseWeight)}
                    />
                    <button
                      type="button"
                      onClick={() => adjustWeight(0.5)}
                      className="w-11 h-11 rounded-xl bg-stone-100 hover:bg-stone-200 font-mono font-bold text-stone-800 text-sm transition-colors active:scale-95 shrink-0"
                    >
                      +0.5
                    </button>
                  </div>
                </div>

                {/* Circumferences: Waist & Hips */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-600 mb-1">
                      Waist (cm)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.waist}
                      onChange={(e) => setFormData({ ...formData, waist: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white text-stone-900 placeholder-stone-400 border border-stone-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. 68"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-600 mb-1">
                      Hips (cm)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.hips}
                      onChange={(e) => setFormData({ ...formData, hips: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white text-stone-900 placeholder-stone-400 border border-stone-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. 92"
                    />
                  </div>
                </div>

                {/* Subjective Energy & Recovery Selector */}
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1.5">
                    How is your energy & recovery today?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "High Energy", dotColor: "bg-emerald-500" },
                      { label: "Strong & Ready", dotColor: "bg-blue-500" },
                      { label: "Balanced", dotColor: "bg-amber-500" },
                      { label: "Sore / Rest Needed", dotColor: "bg-stone-400" },
                    ].map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => selectFeelingTag(item.label)}
                        className={`p-2.5 rounded-xl text-xs font-bold border text-left flex items-center gap-2 transition-all ${
                          selectedFeeling === item.label
                            ? "bg-blue-50 border-blue-400 text-blue-800 shadow-2xs"
                            : "bg-stone-50/70 border-stone-200/70 text-stone-700 hover:bg-stone-100"
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${item.dotColor} shrink-0`} />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">
                    Coach & Training Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white text-stone-900 placeholder-stone-400 border border-stone-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500"
                    placeholder="Diet compliance, sleep quality, training reflections..."
                    rows={2}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-blue-600/30 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                  ) : (
                    "Record Progress Entry"
                  )}
                </button>
              </form>
            </div>

            {/* ─── Athletic Milestones & Achievements Card ─── */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-stone-900">
                    Discipline Badges
                  </h3>
                  <p className="text-[11px] text-stone-500">Milestone benchmarks</p>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                  Milestones
                </span>
              </div>

              <div className="space-y-2.5">
                <div className="p-3 rounded-2xl bg-stone-50/80 border border-stone-200/70 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black text-stone-900">Baseline Calibrated</p>
                    <p className="text-[10px] text-stone-500">Weight & BMI established</p>
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                    Unlocked
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-stone-50/80 border border-stone-200/70 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black text-stone-900">Daily Ignition</p>
                    <p className="text-[10px] text-stone-500">Training cycle activated</p>
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                    Active
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-stone-50/80 border border-stone-200/70 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black text-stone-900">Master of Consistency</p>
                    <p className="text-[10px] text-stone-500">Log 5 biometric check-ins</p>
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-stone-200 text-stone-600">
                    {Math.min(records.length, 5)}/5
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
