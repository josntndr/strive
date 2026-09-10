"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/Navbar";
import { BrandMark } from "@/components/BrandMark";
import { Reveal } from "@/components/Reveal";
import {
  ArrowRight,
  Dumbbell,
  Utensils,
  LineChart,
  CalendarCheck,
  Check,
  Activity,
  Flame,
  Zap,
  Target,
  ShieldCheck,
  TrendingUp,
  Clock,
  Sparkles,
  ChevronRight,
  Sliders,
  Layers,
  RotateCcw,
  CheckCircle2,
  BarChart3,
  Scale,
  Award,
  Heart,
  Timer,
} from "lucide-react";

export default function Home() {
  // Hero interactive console tab
  const [heroTab, setHeroTab] = useState<"workout" | "macros" | "analytics">("workout");
  const [completedSets, setCompletedSets] = useState<number[]>([1, 2]);

  // Interactive quick calculator state
  const [calcGoal, setCalcGoal] = useState<"hypertrophy" | "fatloss" | "strength">("hypertrophy");
  const [calcLevel, setCalcLevel] = useState<"beginner" | "intermediate" | "advanced">("intermediate");
  const [calcDays, setCalcDays] = useState<3 | 4 | 5>(4);

  // Equipment demo state in Bento
  const [equipmentMode, setEquipmentMode] = useState<"gym" | "dumbbells" | "bodyweight">("gym");

  // How it works active step
  const [activeStep, setActiveStep] = useState<number>(0);

  const toggleSet = (setNumber: number) => {
    if (completedSets.includes(setNumber)) {
      setCompletedSets(completedSets.filter((s) => s !== setNumber));
    } else {
      setCompletedSets([...completedSets, setNumber]);
    }
  };

  // Dynamic calculator result output
  const getCalculatorOutput = () => {
    if (calcGoal === "hypertrophy") {
      return {
        splitName: calcDays === 3 ? "3-Day Full Body Hypertrophy" : calcDays === 4 ? "4-Day Upper / Lower Split" : "5-Day Push / Pull / Legs / Upper / Lower",
        calories: "2,650 kcal",
        protein: "185g",
        carbs: "290g",
        fats: "68g",
        primaryFocus: "Mechanical tension & progressive volume (8-12 rep brackets)",
        restInterval: "90-120 seconds between working sets",
      };
    } else if (calcGoal === "fatloss") {
      return {
        splitName: calcDays === 3 ? "3-Day Full Body Density Split" : calcDays === 4 ? "4-Day Upper / Lower Fat Loss Protocol" : "5-Day Athletic Recomposition Split",
        calories: "2,150 kcal",
        protein: "195g",
        carbs: "180g",
        fats: "55g",
        primaryFocus: "Muscle preservation in caloric deficit with high work capacity",
        restInterval: "60-90 seconds to maintain elevated metabolic rate",
      };
    } else {
      return {
        splitName: calcDays === 3 ? "3-Day Linear Strength Foundation" : calcDays === 4 ? "4-Day Texas Method / Wave Progression" : "5-Day Powerbuilding & Compound Focus",
        calories: "2,850 kcal",
        protein: "190g",
        carbs: "320g",
        fats: "75g",
        primaryFocus: "Peak neurological recruitment & compound barbell velocity (3-6 reps)",
        restInterval: "2-3 minutes for maximal ATP replenishment",
      };
    }
  };

  const calcOutput = getCalculatorOutput();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 selection:bg-blue-600 selection:text-white antialiased">
      <Navbar />

      <main className="flex-grow">
        {/* ========================================================================= */}
        {/* 1. HERO SECTION: Professional athletic tech, human editorial design       */}
        {/* ========================================================================= */}
        <section className="relative overflow-hidden bg-white border-b border-slate-200/80 pt-12 pb-20 lg:pt-20 lg:pb-28">
          {/* Subtle architectural dot grid background */}
          <div className="absolute inset-0 dot-grid opacity-60 pointer-events-none" />

          {/* Ambient energetic gradient glows */}
          <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[720px] h-[400px] bg-gradient-to-tr from-blue-600/10 via-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/3 -right-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              
              {/* Hero Copy (Left 6 cols on LG) */}
              <div className="lg:col-span-6 text-left">
                <Reveal>
                  {/* Headline: Clean, authoritative, non-AI solid typography */}
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-100 border border-slate-200 text-xs font-mono font-bold text-slate-700 uppercase tracking-widest">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                      Athletic Training Architecture
                    </div>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-[-0.035em] text-slate-950 leading-[1.06]">
                      Precision Training. <br />
                      Engineered for <span className="text-blue-600">Results.</span>
                    </h1>
                  </div>

                  {/* Subheadline */}
                  <p className="mt-6 text-lg text-slate-600 leading-relaxed font-normal max-w-xl">
                    Ditch generic workout templates and guesswork diets. Strive computes periodized lifting splits, adaptive macro targets, and automated progressive overload tailored to your exact gear and schedule.
                  </p>

                  {/* CTAs */}
                  <div className="mt-8 flex flex-wrap items-center gap-4">
                    <Link
                      href="/register"
                      className="inline-flex items-center gap-2.5 rounded-xl bg-slate-950 px-7 py-3.5 text-base font-bold text-white shadow-xl shadow-slate-950/15 hover:bg-slate-900 active:scale-95 transition-all group"
                    >
                      Build Your Free Plan
                      <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <a
                      href="#interactive-demo"
                      className="inline-flex items-center gap-2 rounded-xl bg-white hover:bg-slate-50 px-5 py-3.5 text-sm font-bold text-slate-800 border border-slate-300 shadow-xs transition-colors"
                    >
                      <Sliders className="w-4 h-4 text-slate-600" />
                      Interactive Plan Calculator
                    </a>
                  </div>

                  {/* High-end athletic telemetry spec strip */}
                  <div className="mt-10 rounded-2xl bg-slate-50/80 border border-slate-200/90 p-4 max-w-lg">
                    <div className="grid grid-cols-3 divide-x divide-slate-200 text-center">
                      <div className="px-2">
                        <p className="text-xs font-mono font-bold uppercase text-slate-400">Hardware</p>
                        <p className="text-lg font-black text-slate-950 mt-0.5">100% Adaptive</p>
                        <p className="text-[11px] text-slate-500 font-medium">Home & Commercial</p>
                      </div>
                      <div className="px-2">
                        <p className="text-xs font-mono font-bold uppercase text-slate-400">Overload</p>
                        <p className="text-lg font-black text-blue-600 mt-0.5">+2.5 kg</p>
                        <p className="text-[11px] text-slate-500 font-medium">Calculated Micro-Load</p>
                      </div>
                      <div className="px-2">
                        <p className="text-xs font-mono font-bold uppercase text-slate-400">Nutrition</p>
                        <p className="text-lg font-black text-slate-950 mt-0.5">3-Tier</p>
                        <p className="text-[11px] text-slate-500 font-medium">Dynamic Macro Sync</p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              </div>

              {/* Hero Visual: Pro-Grade Live Session Telemetry Dashboard (Right 6 cols on LG) */}
              <div className="lg:col-span-6">
                <Reveal delay={120}>
                  <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xl shadow-slate-200/50 overflow-hidden">
                    {/* Live Workout Session Header Bar */}
                    <div className="bg-slate-950 px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
                      <div className="flex items-center gap-3">
                        <span className="flex h-2.5 w-2.5 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
                        </span>
                        <div>
                          <p className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                            Active Session
                            <span className="font-mono text-[11px] font-normal text-slate-400">• 00:32:15</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs font-mono font-semibold text-slate-300">
                        <span className="flex items-center gap-1 text-rose-400">
                          <Heart className="w-3.5 h-3.5 fill-current" /> 138 BPM
                        </span>
                        <span className="h-3 w-px bg-slate-800" />
                        <span className="text-amber-400">
                          ⚡ 3,420 kg
                        </span>
                      </div>
                    </div>

                    {/* Segmented Control Tabs */}
                    <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex gap-2">
                      <button
                        onClick={() => setHeroTab("workout")}
                        className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold text-center transition-all ${
                          heroTab === "workout"
                            ? "bg-white text-slate-950 shadow-xs border border-slate-200 font-extrabold"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        Active Workout
                      </button>

                      <button
                        onClick={() => setHeroTab("macros")}
                        className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold text-center transition-all ${
                          heroTab === "macros"
                            ? "bg-white text-slate-950 shadow-xs border border-slate-200 font-extrabold"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        Macro Fueling
                      </button>

                      <button
                        onClick={() => setHeroTab("analytics")}
                        className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold text-center transition-all ${
                          heroTab === "analytics"
                            ? "bg-white text-slate-950 shadow-xs border border-slate-200 font-extrabold"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        Volume Curve
                      </button>
                    </div>

                    {/* Dashboard Body */}
                    <div className="p-5 bg-white min-h-[380px]">
                      {/* TAB 1: WORKOUT PROTOCOL (Tabular Pro Logger) */}
                      {heroTab === "workout" && (
                        <div className="space-y-4 animate-in fade-in duration-200">
                          {/* Exercise Header */}
                          <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                            <div>
                              <h3 className="text-base font-black text-slate-950">Incline Dumbbell Bench Press</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                                  Chest • Deltoids
                                </span>
                                <span className="text-xs text-slate-500 font-medium">Target: 4 sets × 8-10 reps • RPE 8.5</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-mono text-xs font-bold">
                              <Timer className="w-3.5 h-3.5 text-blue-600" />
                              <span>01:15</span>
                            </div>
                          </div>

                          {/* Authentic Pro Tabular Set Logger */}
                          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-mono uppercase text-slate-400">
                                <tr>
                                  <th className="py-2 px-3">Set</th>
                                  <th className="py-2 px-3">Previous</th>
                                  <th className="py-2 px-3">Load</th>
                                  <th className="py-2 px-3">Reps</th>
                                  <th className="py-2 px-3 text-right">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 font-medium">
                                {[
                                  { set: 1, prev: "32 kg × 10", weight: "32.5 kg", reps: "10", overload: false },
                                  { set: 2, prev: "32 kg × 10", weight: "32.5 kg", reps: "10", overload: false },
                                  { set: 3, prev: "34 kg × 8", weight: "35.0 kg", reps: "9", overload: true },
                                  { set: 4, prev: "34 kg × 8", weight: "35.0 kg", reps: "8", overload: true },
                                ].map((item) => {
                                  const isDone = completedSets.includes(item.set);
                                  return (
                                    <tr
                                      key={item.set}
                                      className={`transition-colors ${isDone ? "bg-emerald-50/50" : "hover:bg-slate-50/80"}`}
                                    >
                                      <td className="py-2.5 px-3 font-mono font-bold text-slate-700">0{item.set}</td>
                                      <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">{item.prev}</td>
                                      <td className="py-2.5 px-3 font-bold text-slate-900">{item.weight}</td>
                                      <td className="py-2.5 px-3 font-semibold text-slate-700">{item.reps}</td>
                                      <td className="py-2.5 px-3 text-right">
                                        <button
                                          type="button"
                                          onClick={() => toggleSet(item.set)}
                                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                                            isDone
                                              ? "bg-emerald-600 text-white shadow-xs"
                                              : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                                          }`}
                                        >
                                          {isDone ? (
                                            <>
                                              <Check className="w-3 h-3 stroke-[3]" /> Logged
                                            </>
                                          ) : (
                                            "Log Set"
                                          )}
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>

                          {/* Exercise Queue (Next in Session) */}
                          <div className="pt-1 space-y-2">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Next in Session</p>
                            <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50/50">
                              <div>
                                <p className="text-xs font-bold text-slate-900">Standing Barbell Overhead Press</p>
                                <p className="text-[11px] text-slate-500">3 sets × 8 reps • 52.5 kg</p>
                              </div>
                              <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                                In Queue
                              </span>
                            </div>

                            <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50/50">
                              <div>
                                <p className="text-xs font-bold text-slate-900">Cable Lateral Raises & Tricep Pushdowns</p>
                                <p className="text-[11px] text-slate-500">3 sets × 15 reps • Superset</p>
                              </div>
                              <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                                In Queue
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* TAB 2: MACRO FUELING */}
                      {heroTab === "macros" && (
                        <div className="space-y-4 animate-in fade-in duration-200">
                          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                                Daily Nutrition Budget
                              </span>
                              <h3 className="text-base font-black text-slate-950 mt-1">2,450 kcal / day Target</h3>
                            </div>
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                              94% Completed
                            </span>
                          </div>

                          {/* Macro Bars */}
                          <div className="space-y-3 pt-1">
                            <div>
                              <div className="flex justify-between text-xs font-bold mb-1">
                                <span className="text-slate-700">Protein (Muscle Protein Synthesis)</span>
                                <span className="text-blue-700 font-mono">185g / 185g (100%)</span>
                              </div>
                              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-600 rounded-full w-full" />
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between text-xs font-bold mb-1">
                                <span className="text-slate-700">Carbohydrates (Glycogen Replenishment)</span>
                                <span className="text-amber-700 font-mono">260g / 275g (95%)</span>
                              </div>
                              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500 rounded-full w-[95%]" />
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between text-xs font-bold mb-1">
                                <span className="text-slate-700">Healthy Fats (Endocrine & Joint Support)</span>
                                <span className="text-emerald-700 font-mono">62g / 68g (91%)</span>
                              </div>
                              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full w-[91%]" />
                              </div>
                            </div>
                          </div>

                          {/* Meal Breakdown Card */}
                          <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Post-Workout Fuel</span>
                              <span className="text-xs font-black text-slate-900">540 kcal</span>
                            </div>
                            <h4 className="text-xs font-bold text-slate-900">Grilled Salmon, Spiced Quinoa & Avocado Bowl</h4>
                            <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-600 font-medium">
                              <span className="font-bold text-blue-700">48g Protein</span> • 
                              <span className="font-bold text-amber-700">45g Carbs</span> • 
                              <span className="font-bold text-emerald-700">18g Fats</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* TAB 3: VOLUME CURVE */}
                      {heroTab === "analytics" && (
                        <div className="space-y-4 animate-in fade-in duration-200">
                          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                                Progression Analytics
                              </span>
                              <h3 className="text-base font-black text-slate-950 mt-1">+14.2% Estimated 1RM Gain</h3>
                            </div>
                            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                              6-Week Microcycle
                            </span>
                          </div>

                          {/* SVG Curve */}
                          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                            <div className="flex justify-between items-center text-xs font-bold text-slate-500 mb-2">
                              <span>Compound Lift Tonnage</span>
                              <span className="text-blue-600 font-mono">Week 1 (80kg) &rarr; Week 6 (92.5kg)</span>
                            </div>
                            <div className="h-28 w-full relative flex items-end">
                              <svg viewBox="0 0 300 100" className="w-full h-full overflow-visible">
                                <defs>
                                  <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#cc3f1d" stopOpacity="0.25" />
                                    <stop offset="100%" stopColor="#cc3f1d" stopOpacity="0.0" />
                                  </linearGradient>
                                </defs>
                                <path
                                  d="M 10 80 Q 70 75, 120 55 T 220 30 T 290 12"
                                  fill="none"
                                  stroke="#cc3f1d"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                />
                                <path
                                  d="M 10 80 Q 70 75, 120 55 T 220 30 T 290 12 L 290 100 L 10 100 Z"
                                  fill="url(#curveGrad)"
                                />
                                <circle cx="10" cy="80" r="3.5" fill="#cc3f1d" />
                                <circle cx="120" cy="55" r="3.5" fill="#cc3f1d" />
                                <circle cx="220" cy="30" r="3.5" fill="#cc3f1d" />
                                <circle cx="290" cy="12" r="4.5" fill="#10b981" />
                              </svg>
                            </div>
                            <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-2">
                              <span>W1</span>
                              <span>W2</span>
                              <span>W3</span>
                              <span>W4</span>
                              <span>W5</span>
                              <span>W6 (Peak)</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                              <p className="text-[10px] font-mono font-bold text-slate-400 uppercase">Weekly Load</p>
                              <p className="text-lg font-black text-slate-950 mt-0.5">48,250 kg</p>
                              <p className="text-[10px] font-semibold text-emerald-600 mt-0.5">&uarr; 8.4% vs last cycle</p>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                              <p className="text-[10px] font-mono font-bold text-slate-400 uppercase">Consistency Index</p>
                              <p className="text-lg font-black text-slate-950 mt-0.5">18 Days Active</p>
                              <p className="text-[10px] font-semibold text-blue-600 mt-0.5">100% Prescription Met</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Console Footer */}
                    <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-slate-500 font-medium">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>Cloud Auto-Save • Apple Health Ready</span>
                      </div>
                      <Link
                        href="/register"
                        className="font-bold text-slate-900 hover:text-blue-600 transition-colors"
                      >
                        Explore Full Engine &rarr;
                      </Link>
                    </div>
                  </div>
                </Reveal>
              </div>

            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. CORE ARCHITECTURE BENTO GRID (Atmospheric Gym Background & Precision Glyphs) */}
        {/* ========================================================================= */}
        <section id="features" className="relative py-28 overflow-hidden bg-slate-950 text-white border-y border-slate-800">
          {/* Cinematic Background Image with Dark Atmospheric Overlay */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <Image
              src="/images/features_gym_bg.jpg"
              alt="Athletic Gym Environment"
              fill
              sizes="100vw"
              className="object-cover object-center opacity-25 filter grayscale contrast-125"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950/85 to-slate-950" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(37,99,235,0.18),rgba(255,255,255,0))]" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-xs font-mono font-bold text-blue-400 uppercase tracking-widest mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                System Architecture
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white mt-2">
                Everything Engineered for <span className="text-blue-500">Relentless Progress</span>
              </h2>
              <p className="mt-4 text-slate-300 text-base sm:text-lg font-normal leading-relaxed">
                No random routines, no guesswork. Strive merges exercise physiology with automated tracking to ensure your efforts translate into measurable gains.
              </p>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Bento Card 1: Wide 2-col on MD (Automated Progressive Overload) */}
              <div className="md:col-span-8 rounded-3xl bg-slate-900/85 backdrop-blur-xl border border-slate-800/90 hover:border-blue-500/40 p-7 sm:p-8 transition-all flex flex-col justify-between group shadow-xl">
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-center text-blue-400 group-hover:border-blue-500/60 transition-colors shadow-inner">
                        {/* Custom Precision Vector Gauge */}
                        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-[2.2]" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                          <polyline points="16 7 22 7 22 13" />
                          <line x1="2" y1="21" x2="22" y2="21" className="stroke-slate-600 stroke-[1.5]" />
                        </svg>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase block">Engine Module 01</span>
                        <span className="text-xs font-mono font-bold text-slate-200">PROGRESSION_MATRIX</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
                      +2.5 KG MICRO-OVERLOAD
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Dynamic Progressive Overload
                  </h3>
                  <p className="mt-2 text-sm text-slate-300 leading-relaxed font-normal max-w-xl">
                    Never plateau on your key lifts. Strive monitors completed sets, reps, and perceived difficulty to calculate the precise micro-increments (+1.25kg to +2.5kg) you need each week.
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-3 sm:gap-4">
                  <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
                    <p className="text-[10px] font-mono font-bold text-slate-400 uppercase">Week 1 Baseline</p>
                    <p className="text-base sm:text-lg font-black text-white mt-0.5">80 kg × 8 reps</p>
                    <span className="text-[10px] font-mono text-slate-400">RPE 8.0 Target</span>
                  </div>
                  <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
                    <p className="text-[10px] font-mono font-bold text-slate-400 uppercase">Week 3 Adapted</p>
                    <p className="text-base sm:text-lg font-black text-emerald-400 mt-0.5">85 kg × 8 reps</p>
                    <span className="text-[10px] font-mono font-bold text-emerald-400">+5 kg Overload</span>
                  </div>
                  <div className="bg-blue-950/30 p-3.5 rounded-xl border border-blue-800/60">
                    <p className="text-[10px] font-mono font-bold text-blue-400 uppercase">Week 5 Target</p>
                    <p className="text-base sm:text-lg font-black text-blue-300 mt-0.5">87.5 kg × 8 reps</p>
                    <span className="text-[10px] font-mono font-bold text-blue-400">Auto-Prescribed</span>
                  </div>
                </div>
              </div>

              {/* Bento Card 2: 4-col (Precision Macro Engine) */}
              <div className="md:col-span-4 rounded-3xl bg-slate-900/85 backdrop-blur-xl border border-slate-800/90 hover:border-emerald-500/40 p-7 sm:p-8 transition-all flex flex-col justify-between group shadow-xl">
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-center text-emerald-400 group-hover:border-emerald-500/60 transition-colors shadow-inner">
                        {/* Custom Precision Macro Ring Glyph */}
                        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-[2.2]" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="9" className="stroke-slate-700 stroke-[1.8]" />
                          <path d="M12 3 A 9 9 0 0 1 21 12" className="stroke-blue-400 stroke-[2.5]" />
                          <path d="M21 12 A 9 9 0 0 1 12 21" className="stroke-amber-400 stroke-[2.5]" />
                          <path d="M12 21 A 9 9 0 0 1 3 12" className="stroke-emerald-400 stroke-[2.5]" />
                          <circle cx="12" cy="12" r="2.5" className="fill-emerald-400 stroke-none" />
                        </svg>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase block">Engine Module 02</span>
                        <span className="text-xs font-mono font-bold text-slate-200">METABOLIC_SYNC</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-blue-400 bg-blue-500/10 border border-blue-500/30 px-3 py-1 rounded-full">
                      3-TIER MACROS
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Calibrated Macro OS
                  </h3>
                  <p className="mt-2 text-sm text-slate-300 leading-relaxed font-normal">
                    Custom nutrition algorithms compute protein, carbohydrate, and lipid targets matched to your training intensity and body composition.
                  </p>
                </div>

                <div className="mt-6 p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-mono font-bold text-slate-300">
                      <span>Protein Target</span>
                      <span className="text-emerald-400 font-mono font-black">2.0g / kg BW</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden mt-1.5">
                      <div className="h-full bg-emerald-500 rounded-full w-[85%]" />
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Synchronized with your heavy training days for maximal protein synthesis.
                  </p>
                </div>
              </div>

              {/* Bento Card 3: 6-col (Equipment Flexibility) */}
              <div className="md:col-span-6 rounded-3xl bg-slate-900/85 backdrop-blur-xl border border-slate-800/90 hover:border-amber-500/40 p-7 sm:p-8 transition-all group shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-center text-amber-400 group-hover:border-amber-500/60 transition-colors shadow-inner">
                      {/* Custom Hardware Selector Glyph */}
                      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-[2.2]" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="6" cy="12" r="3" className="stroke-amber-400 stroke-[2]" />
                        <circle cx="18" cy="12" r="3" className="stroke-amber-400 stroke-[2]" />
                        <line x1="9" y1="12" x2="15" y2="12" className="stroke-slate-500 stroke-[2.5]" />
                        <line x1="6" y1="6" x2="6" y2="9" className="stroke-amber-400 stroke-[2]" />
                        <line x1="6" y1="15" x2="6" y2="18" className="stroke-amber-400 stroke-[2]" />
                        <line x1="18" y1="6" x2="18" y2="9" className="stroke-amber-400 stroke-[2]" />
                        <line x1="18" y1="15" x2="18" y2="18" className="stroke-amber-400 stroke-[2]" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase block">Engine Module 03</span>
                      <span className="text-xs font-mono font-bold text-slate-200">HARDWARE_AGNOSTIC</span>
                    </div>
                  </div>

                  <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
                    <button
                      onClick={() => setEquipmentMode("gym")}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                        equipmentMode === "gym" ? "bg-slate-800 text-white shadow-xs" : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Gym Rack
                    </button>
                    <button
                      onClick={() => setEquipmentMode("dumbbells")}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                        equipmentMode === "dumbbells" ? "bg-slate-800 text-white shadow-xs" : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Dumbbells
                    </button>
                    <button
                      onClick={() => setEquipmentMode("bodyweight")}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                        equipmentMode === "bodyweight" ? "bg-slate-800 text-white shadow-xs" : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Bodyweight
                    </button>
                  </div>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Zero Equipment Barrier
                </h3>
                <p className="mt-2 text-sm text-slate-300 leading-relaxed font-normal">
                  Whether you have access to an elite barbell gym, a set of dumbbells at home, or zero equipment in a hotel room — your plan adapts instantly.
                </p>

                <div className="mt-6 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-300">
                    <span>
                      {equipmentMode === "gym" && "Commercial Barbell & Cable Setup"}
                      {equipmentMode === "dumbbells" && "Home Dumbbell & Bench Setup"}
                      {equipmentMode === "bodyweight" && "Calisthenics & High-Tension Movement"}
                    </span>
                    <span className="text-blue-400 font-bold">Active Preset</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 font-medium">
                    {equipmentMode === "gym" && "Includes Barbell Squats, Cable Crossovers, Romanian Deadlifts, Lat Pulldowns."}
                    {equipmentMode === "dumbbells" && "Includes DB Goblet Squats, DB Floor Press, Single-Leg RDLs, Hammer Curls."}
                    {equipmentMode === "bodyweight" && "Includes Deficit Push-ups, Pike Presses, Bulgarian Split Squats, Pull-ups."}
                  </p>
                </div>
              </div>

              {/* Bento Card 4: 6-col (Readiness & Recovery Rhythm) */}
              <div className="md:col-span-6 rounded-3xl bg-slate-900/85 backdrop-blur-xl border border-slate-800/90 hover:border-rose-500/40 p-7 sm:p-8 transition-all flex flex-col justify-between group shadow-xl">
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-center text-rose-400 group-hover:border-rose-500/60 transition-colors shadow-inner">
                        {/* Custom ECG / HRV Pulse Waveform */}
                        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-[2.2]" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 12h3.5l2-6 3.5 14 2.5-10 1.5 4 2-2H21" />
                        </svg>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase block">Engine Module 04</span>
                        <span className="text-xs font-mono font-bold text-slate-200">CNS_AUTONOMIC</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-3 py-1 rounded-full">
                      HRV RECOVERY SYNC
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Recovery Rhythm & Readiness
                  </h3>
                  <p className="mt-2 text-sm text-slate-300 leading-relaxed font-normal">
                    Lifting heavy without planned recovery leads to fatigue. Strive balances training load with scheduled deloads and rest periods so your joints stay healthy.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-sm font-mono">
                      94%
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Readiness Score</p>
                      <p className="text-[11px] text-slate-400">Optimal systemic recovery index</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-mono font-bold text-amber-400">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <span>18-Day Streak</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. INTERACTIVE PLAN & MACRO CALCULATOR (High-value interactive micro-tool)  */}
        {/* ========================================================================= */}
        <section id="interactive-demo" className="py-24 bg-white border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                Interactive Plan Preview
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 mt-3">
                Test-Drive Your Custom Protocol
              </h2>
              <p className="mt-3 text-slate-600 text-base font-normal">
                Choose your primary fitness objective and training frequency to see how Strive calibrates your split and nutrition breakdown in real time.
              </p>
            </div>

            <div className="max-w-5xl mx-auto rounded-3xl bg-slate-900 text-white p-6 sm:p-10 shadow-2xl relative overflow-hidden">
              {/* Subtle ambient lighting inside calculator */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="grid lg:grid-cols-12 gap-8 relative z-10">
                {/* Left Controller (5 cols) */}
                <div className="lg:col-span-5 space-y-6">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
                      1. Primary Target
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "hypertrophy", label: "Muscle Size" },
                        { id: "fatloss", label: "Cut & Lean" },
                        { id: "strength", label: "Raw Strength" },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setCalcGoal(item.id as any)}
                          className={`py-2.5 px-2 rounded-xl text-xs font-bold text-center transition-all ${
                            calcGoal === item.id
                              ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
                      2. Training Frequency
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[3, 4, 5].map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setCalcDays(d as any)}
                          className={`py-2.5 px-2 rounded-xl text-xs font-bold text-center transition-all ${
                            calcDays === d
                              ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                          }`}
                        >
                          {d} Days / Wk
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
                      3. Experience Tier
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "beginner", label: "Beginner" },
                        { id: "intermediate", label: "Intermediate" },
                        { id: "advanced", label: "Advanced" },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setCalcLevel(item.id as any)}
                          className={`py-2 px-2 rounded-xl text-xs font-bold text-center transition-all ${
                            calcLevel === item.id
                              ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                      <Sparkles className="w-4 h-4" />
                      <span>Instant Algorithmic Synthesis</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      All calculations are calibrated against validated sports science models (Mifflin-St Jeor & Schoenfeld Volume Guidelines).
                    </p>
                  </div>
                </div>

                {/* Right Output Card (7 cols) */}
                <div className="lg:col-span-7 bg-slate-800/90 rounded-2xl p-6 sm:p-8 border border-slate-700 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                          Recommended Program Structure
                        </span>
                        <h3 className="text-lg sm:text-xl font-black text-white mt-0.5">
                          {calcOutput.splitName}
                        </h3>
                      </div>
                      <span className="text-xs font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
                        {calcDays} Sessions / Wk
                      </span>
                    </div>

                    {/* Macro Target Summary Cards */}
                    <div className="grid grid-cols-4 gap-3 my-6">
                      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/60 text-center">
                        <p className="text-[10px] font-bold uppercase text-slate-400">Calories</p>
                        <p className="text-sm sm:text-base font-black text-white mt-1">{calcOutput.calories}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/60 text-center">
                        <p className="text-[10px] font-bold uppercase text-blue-400">Protein</p>
                        <p className="text-sm sm:text-base font-black text-white mt-1">{calcOutput.protein}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/60 text-center">
                        <p className="text-[10px] font-bold uppercase text-amber-400">Carbs</p>
                        <p className="text-sm sm:text-base font-black text-white mt-1">{calcOutput.carbs}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/60 text-center">
                        <p className="text-[10px] font-bold uppercase text-emerald-400">Fats</p>
                        <p className="text-sm sm:text-base font-black text-white mt-1">{calcOutput.fats}</p>
                      </div>
                    </div>

                    <div className="space-y-2.5 text-xs text-slate-300">
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span><strong>Training Methodology:</strong> {calcOutput.primaryFocus}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span><strong>Rest Cadence:</strong> {calcOutput.restInterval}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-slate-400 text-center sm:text-left">
                      Ready to lock in this routine? Sign up takes under 60 seconds.
                    </p>
                    <Link
                      href="/register"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-6 py-3 text-xs font-bold text-white transition-all shadow-md shadow-blue-600/30"
                    >
                      Generate Full Plan &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. HOW IT WORKS (Streamlined 3-step interactive roadmap)                  */}
        {/* ========================================================================= */}
        <section id="how-it-works" className="py-24 bg-slate-50 border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                Execution Workflow
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 mt-3">
                How Strive Drives Results
              </h2>
              <p className="mt-3 text-slate-600 text-base font-normal">
                Three streamlined steps that replace spreadsheets, expensive coaching, and trial-and-error.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Calibrate Metrics & Gear",
                  description: "Specify your current lifting stats, weekly schedule availability, and exact equipment (full commercial gym, home barbell, or dumbbells only).",
                  highlight: "Equipment-Aware Mapping",
                  icon: Sliders,
                },
                {
                  step: "02",
                  title: "Synthesize Training & Macros",
                  description: "Our algorithm creates balanced weekly training splits, movement order, target sets/reps, and dynamic daily macronutrient targets.",
                  highlight: "Periodized Volume",
                  icon: Layers,
                },
                {
                  step: "03",
                  title: "Log Sets & Auto-Progress",
                  description: "Record weight and repetitions in two taps during sessions. Strive automatically calculates progressive overload increases for your next workout.",
                  highlight: "Zero Guesswork",
                  icon: TrendingUp,
                },
              ].map((item, idx) => (
                <Reveal key={item.step} delay={idx * 100}>
                  <div className="h-full rounded-3xl bg-white p-8 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <span className="text-3xl font-black text-slate-200 group-hover:text-blue-600 transition-colors">
                          {item.step}
                        </span>
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                          <item.icon className="w-5 h-5" />
                        </div>
                      </div>

                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded">
                        {item.highlight}
                      </span>
                      <h3 className="text-lg font-extrabold text-slate-900 mt-2 tracking-tight">
                        {item.title}
                      </h3>
                      <p className="mt-3 text-sm text-slate-600 leading-relaxed font-normal">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-8 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-blue-600">
                      <span>Step {idx + 1} of 3</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. BUILT FOR EVERY TRAINING DISCIPLINE (Authentic replacement for fake reviews) */}
        {/* ========================================================================= */}
        <section className="py-24 bg-white border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                Tailored Disciplines
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 mt-3">
                Engineered for Every Training Style
              </h2>
              <p className="mt-3 text-slate-600 text-base font-normal">
                Whether your primary focus is maximum muscle hypertrophy, pure compound strength, or time-efficient conditioning, Strive tailors the volume and nutrition to match.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Hypertrophy & Physique",
                  description: "High mechanical tension, localized fatigue management, and strategic exercise variety to maximize muscle cross-sectional area.",
                  splitExample: "4-5 Day Push / Pull / Legs",
                  accent: "blue",
                },
                {
                  title: "Power & Compound Strength",
                  description: "Heavy barbell work, nervous system recruitment, and linear progression schemes designed around squats, bench, and deadlifts.",
                  splitExample: "3-4 Day Wave Progression",
                  accent: "amber",
                },
                {
                  title: "Fat Loss & Recomposition",
                  description: "Muscle-sparing high-protein deficits paired with dense, calorie-burning compound circuits to drop fat without sacrificing strength.",
                  splitExample: "4-Day Upper / Lower Density",
                  accent: "emerald",
                },
                {
                  title: "Minimalist & Home Training",
                  description: "Ultra-efficient dumbbell and bodyweight protocols for busy founders and professionals needing results in 35 minutes or less.",
                  splitExample: "3-Day Full Body High-Intensity",
                  accent: "indigo",
                },
              ].map((style, idx) => (
                <Reveal key={style.title} delay={idx * 80}>
                  <div className="h-full rounded-2xl p-6 bg-slate-50 border border-slate-200/80 hover:border-blue-300 hover:bg-white transition-all flex flex-col justify-between">
                    <div>
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-800 mb-4 shadow-xs">
                        0{idx + 1}
                      </div>
                      <h3 className="text-base font-extrabold text-slate-900">{style.title}</h3>
                      <p className="mt-2 text-xs text-slate-600 leading-relaxed font-normal">
                        {style.description}
                      </p>
                    </div>

                    <div className="mt-6 pt-3 border-t border-slate-200/60 text-[11px] font-bold text-blue-600">
                      Structure: {style.splitExample}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. CALL TO ACTION: High-contrast athletic dark banner                    */}
        {/* ========================================================================= */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="rounded-3xl bg-slate-900 p-8 sm:p-14 text-center relative overflow-hidden shadow-2xl">
                {/* Ambient glow inside CTA banner */}
                <div className="absolute top-0 right-1/4 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 max-w-2xl mx-auto">
                  <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full inline-block mb-4">
                    Immediate Access • 100% Free
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    Ready to Stop Guessing and Start Progressing?
                  </h2>
                  <p className="mt-4 text-slate-300 text-sm sm:text-base font-normal leading-relaxed">
                    Build your first periodized workout routine and custom macronutrient plan in under 2 minutes. No subscription, no credit card required.
                  </p>

                  <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                      href="/register"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-8 py-3.5 text-sm font-bold text-white transition-all shadow-lg shadow-blue-600/30 hover:scale-[1.02] active:scale-95"
                    >
                      Get Started Free
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      href="/login"
                      className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 px-6 py-3.5 text-sm font-bold text-slate-300 transition-colors border border-slate-700"
                    >
                      Sign In to Account
                    </Link>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 7. FOOTER                                                                 */}
        {/* ========================================================================= */}
        <footer className="bg-white text-slate-600 py-12 border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 pb-8 border-b border-slate-200">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="bg-blue-600 p-1.5 rounded-xl text-white shadow-xs">
                  <BrandMark className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-black text-slate-900 tracking-tight">Strive</span>
              </Link>

              <div className="flex flex-wrap justify-center gap-6 sm:gap-8 text-sm font-bold text-slate-700">
                <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
                <a href="#interactive-demo" className="hover:text-blue-600 transition-colors">Plan Calculator</a>
                <a href="#how-it-works" className="hover:text-blue-600 transition-colors">How It Works</a>
                <Link href="/login" className="hover:text-blue-600 transition-colors">Login</Link>
                <Link href="/register" className="hover:text-blue-600 transition-colors">Register</Link>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>All Systems Operational</span>
              </div>
            </div>

            <div className="pt-8 text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p>&copy; 2026 Strive Fitness. All rights reserved.</p>
              <p className="font-medium text-slate-400">
                Precision workout & nutrition architecture engineered for human progression.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
