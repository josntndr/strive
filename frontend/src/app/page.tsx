"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { BrandMark } from "@/components/BrandMark";
import { Reveal } from "@/components/Reveal";
import {
  ArrowRight,
  Dumbbell,
  Utensils,
  LineChart,
  Check,
  Activity,
  Flame,
  Zap,
  Target,
  TrendingUp,
  Clock,
  Sparkles,
  ChevronRight,
  Sliders,
  Layers,
  Award,
  Heart,
  Timer,
  Plus,
  Minus,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
export default function Home() {
  const router = useRouter();

  // Hero interactive console state
  const [heroTab, setHeroTab] = useState<"workout" | "macros" | "analytics">("workout");
  const [setsData, setSetsData] = useState([
    { set: 1, prev: "32 kg × 10", load: 32.5, reps: 10, completed: true },
    { set: 2, prev: "32 kg × 10", load: 32.5, reps: 10, completed: true },
    { set: 3, prev: "34 kg × 8", load: 35.0, reps: 9, completed: false },
    { set: 4, prev: "34 kg × 8", load: 35.0, reps: 8, completed: false },
  ]);

  // Rest Timer State in Hero
  const [restSeconds, setRestSeconds] = useState(75);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning && restSeconds > 0) {
      interval = setInterval(() => {
        setRestSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (restSeconds === 0) {
      setTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [timerRunning, restSeconds]);

  const toggleTimer = () => setTimerRunning((prev) => !prev);
  const resetTimer = () => {
    setTimerRunning(false);
    setRestSeconds(90);
  };

  const toggleSetCompleted = (index: number) => {
    setSetsData((prev) =>
      prev.map((s, idx) => {
        if (idx === index) {
          const nextCompleted = !s.completed;
          if (nextCompleted) {
            // Trigger rest timer on completing a set
            setRestSeconds(90);
            setTimerRunning(true);
          }
          return { ...s, completed: nextCompleted };
        }
        return s;
      })
    );
  };

  const adjustLoad = (index: number, delta: number) => {
    setSetsData((prev) =>
      prev.map((s, idx) =>
        idx === index ? { ...s, load: Math.max(5, Math.round((s.load + delta) * 10) / 10) } : s
      )
    );
  };

  // Live session calculated total volume
  const sessionBaseVolume = 2770;
  const loggedVolume = setsData.reduce(
    (acc, s) => (s.completed ? acc + Math.round(s.load * s.reps) : acc),
    0
  );
  const totalVolume = sessionBaseVolume + loggedVolume;

  // Macro Fueling interactive Day Mode
  const [macroDayType, setMacroDayType] = useState<"training" | "rest">("training");

  // Bento Interactive States
  const [bentoWeek, setBentoWeek] = useState<1 | 3 | 5>(3);
  const [macroMode, setMacroMode] = useState<"hypertrophy" | "lean">("hypertrophy");
  const [equipmentMode, setEquipmentMode] = useState<"gym" | "dumbbells" | "bodyweight">("gym");

  // Interactive Plan Calculator State
  const [calcGoal, setCalcGoal] = useState<"hypertrophy" | "fatloss" | "strength">("hypertrophy");
  const [calcLevel, setCalcLevel] = useState<"beginner" | "intermediate" | "advanced">("intermediate");
  const [calcDays, setCalcDays] = useState<3 | 4 | 5>(4);

  // How it works active step
  const [activeStep, setActiveStep] = useState<number>(0);

  // Dynamic calculator result generator
  const getCalculatorOutput = () => {
    if (calcGoal === "hypertrophy") {
      return {
        splitName:
          calcDays === 3
            ? "3-Day Full Body Hypertrophy"
            : calcDays === 4
            ? "4-Day Upper / Lower Hypertrophy Split"
            : "5-Day Push / Pull / Legs / Upper / Lower Split",
        calories: "2,650 kcal",
        protein: "185g",
        carbs: "290g",
        fats: "68g",
        primaryFocus: "Mechanical tension, localized pump, & progressive volume (8-12 reps)",
        restInterval: "90-120 seconds between hypertrophy sets",
        schedule:
          calcDays === 3
            ? ["Day 1: Full Body Heavy", "Day 2: Full Body Density", "Day 3: Full Body Hypertrophy"]
            : calcDays === 4
            ? ["Mon: Upper Power", "Tue: Lower Strength", "Thu: Upper Volume", "Fri: Lower Hypertrophy"]
            : ["Mon: Push", "Tue: Pull", "Wed: Legs", "Fri: Upper Body", "Sat: Lower Body"],
      };
    } else if (calcGoal === "fatloss") {
      return {
        splitName:
          calcDays === 3
            ? "3-Day Metabolic Full Body Density"
            : calcDays === 4
            ? "4-Day Upper / Lower Lean Recomposition"
            : "5-Day High-Work-Capacity Athletic Split",
        calories: "2,150 kcal",
        protein: "195g",
        carbs: "180g",
        fats: "55g",
        primaryFocus: "Muscle preservation in caloric deficit with high density compound circuits",
        restInterval: "60-90 seconds for elevated metabolic expenditure",
        schedule:
          calcDays === 3
            ? ["Day 1: Compound Density", "Day 2: Hypertrophic Circuit", "Day 3: Posterior Chain Focus"]
            : calcDays === 4
            ? ["Mon: Upper Density", "Tue: Lower Power", "Thu: Torso Metabolic", "Fri: Legs & Core Focus"]
            : ["Mon: Push Density", "Tue: Pull Strength", "Wed: Legs & Core", "Fri: Upper Circuit", "Sat: Lower Density"],
      };
    } else {
      return {
        splitName:
          calcDays === 3
            ? "3-Day Linear Periodization Strength"
            : calcDays === 4
            ? "4-Day Heavy Compound Wave Progression"
            : "5-Day Powerbuilding & Max Neurological Recruitment",
        calories: "2,850 kcal",
        protein: "190g",
        carbs: "320g",
        fats: "75g",
        primaryFocus: "Peak motor unit recruitment & compound barbell bar velocity (3-6 reps)",
        restInterval: "2-3 minutes for maximal ATP replenishment",
        schedule:
          calcDays === 3
            ? ["Day 1: Heavy Squat & Bench", "Day 2: Deadlift & Overhead Press", "Day 3: Accessory Wave"]
            : calcDays === 4
            ? ["Mon: Bench Press Wave", "Tue: Squat Power", "Thu: Overhead Press Wave", "Fri: Deadlift Strength"]
            : ["Mon: Heavy Squat", "Tue: Heavy Bench", "Wed: Deadlift Focus", "Fri: Overhead Strength", "Sat: Heavy Accessory"],
      };
    }
  };

  const calcOutput = getCalculatorOutput();

  const handleApplyPlan = () => {
    // Persist user draft to localStorage for seamless cross-flow UX
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "strive_plan_draft",
        JSON.stringify({
          goal: calcGoal,
          days: calcDays,
          level: calcLevel,
          splitName: calcOutput.splitName,
        })
      );
    }
    router.push("/register");
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 selection:bg-[#ed4f28] selection:text-white antialiased">
      <Navbar />

      <main className="flex-grow">
        {/* ========================================================================= */}
        {/* 1. HERO SECTION: Human-centric, editorial, highly interactive athletic tech */}
        {/* ========================================================================= */}
        <section className="relative overflow-hidden bg-white border-b border-slate-200/80 pt-10 pb-16 lg:pt-16 lg:pb-24">
          {/* Subtle architectural dot grid background */}
          <div className="absolute inset-0 dot-grid opacity-50 pointer-events-none" />

          {/* Ambient energetic coral/amber radiant glows */}
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-gradient-to-tr from-[#ed4f28]/10 via-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/4 -right-24 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-12 gap-10 lg:gap-8 items-center">
              {/* Hero Copy (Left 6 cols on LG) */}
              <div className="lg:col-span-6 text-left">
                <Reveal>
                  <div className="space-y-3">
                    {/* Clean Brand Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200/90 text-xs font-bold text-slate-700 uppercase tracking-wider shadow-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ed4f28]" />
                      <span>Athletic Training Architecture</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-[#ed4f28] font-bold">Auto-Overload</span>
                    </div>

                    {/* Headline: Clean, authoritative, non-AI solid typography */}
                    <h1 className="text-4xl sm:text-5xl lg:text-[3.75rem] font-black tracking-[-0.035em] text-slate-950 leading-[1.05]">
                      Precision Training. <br />
                      Engineered for{" "}
                      <span className="bg-gradient-to-r from-[#ed4f28] via-orange-500 to-amber-500 bg-clip-text text-transparent">
                        Results.
                      </span>
                    </h1>
                  </div>

                  {/* Subheadline */}
                  <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed font-normal max-w-xl">
                    Ditch generic workout templates and guesswork diets. Strive computes periodized
                    lifting splits, adaptive macro targets, and automated progressive overload
                    tailored to your exact gear and schedule.
                  </p>

                  {/* CTAs */}
                  <div className="mt-8 flex flex-wrap items-center gap-4">
                    <Link
                      href="/register"
                      className="inline-flex items-center gap-2.5 rounded-xl bg-slate-950 px-6 py-3.5 text-sm sm:text-base font-bold text-white shadow-xl shadow-slate-950/15 hover:bg-slate-800 active:scale-95 transition-all group"
                    >
                      Build Your Free Plan
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <a
                      href="#interactive-demo"
                      className="inline-flex items-center gap-2 rounded-xl bg-white hover:bg-slate-50 px-5 py-3.5 text-sm font-bold text-slate-800 border border-slate-300 shadow-xs transition-colors"
                    >
                      <Sliders className="w-4 h-4 text-slate-600" />
                      Interactive Plan Calculator
                    </a>
                  </div>

                  {/* Telemetry spec strip */}
                  <div className="mt-9 rounded-2xl bg-slate-50/90 border border-slate-200/90 p-3.5 max-w-lg shadow-xs">
                    <div className="grid grid-cols-3 divide-x divide-slate-200 text-center">
                      <div className="px-2">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Hardware
                        </p>
                        <p className="text-base font-black text-slate-950 mt-0.5">100% Adaptive</p>
                        <p className="text-[11px] text-slate-500 font-medium">Home & Gym</p>
                      </div>
                      <div className="px-2">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Overload
                        </p>
                        <p className="text-base font-black text-[#ed4f28] mt-0.5">+2.5 kg</p>
                        <p className="text-[11px] text-slate-500 font-medium">Auto Micro-Load</p>
                      </div>
                      <div className="px-2">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Nutrition
                        </p>
                        <p className="text-base font-black text-slate-950 mt-0.5">3-Tier</p>
                        <p className="text-[11px] text-slate-500 font-medium">Dynamic Macro Sync</p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              </div>

              {/* Hero Visual: Pro-Grade Live Session Console (Right 6 cols on LG) */}
              <div className="lg:col-span-6">
                <Reveal delay={100}>
                  <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xl shadow-slate-200/60 overflow-hidden">
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
                            <span className="font-mono text-[11px] font-normal text-slate-400">
                              • 00:32:15
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs font-mono font-semibold text-slate-300">
                        <span className="flex items-center gap-1.5 text-rose-400">
                          <Heart className="w-3.5 h-3.5 fill-current animate-pulse" /> 138 BPM
                        </span>
                        <span className="h-3 w-px bg-slate-800" />
                        <span className="text-amber-400 font-bold">
                          ⚡ {totalVolume.toLocaleString()} kg
                        </span>
                      </div>
                    </div>

                    {/* Segmented Control Tabs */}
                    <div className="bg-slate-100/90 p-1.5 border-b border-slate-200 flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setHeroTab("workout")}
                        className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold text-center transition-all cursor-pointer ${
                          heroTab === "workout"
                            ? "bg-white text-slate-950 shadow-xs font-extrabold border border-slate-200/60"
                            : "text-slate-600 hover:text-slate-950 hover:bg-slate-200/50"
                        }`}
                      >
                        Active Workout
                      </button>

                      <button
                        type="button"
                        onClick={() => setHeroTab("macros")}
                        className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold text-center transition-all cursor-pointer ${
                          heroTab === "macros"
                            ? "bg-white text-slate-950 shadow-xs font-extrabold border border-slate-200/60"
                            : "text-slate-600 hover:text-slate-950 hover:bg-slate-200/50"
                        }`}
                      >
                        Macro Fueling
                      </button>

                      <button
                        type="button"
                        onClick={() => setHeroTab("analytics")}
                        className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold text-center transition-all cursor-pointer ${
                          heroTab === "analytics"
                            ? "bg-white text-slate-950 shadow-xs font-extrabold border border-slate-200/60"
                            : "text-slate-600 hover:text-slate-950 hover:bg-slate-200/50"
                        }`}
                      >
                        Volume Curve
                      </button>
                    </div>

                    {/* Dashboard Body */}
                    <div className="p-5 bg-white min-h-[385px]">
                      {/* TAB 1: WORKOUT PROTOCOL (Interactive Set Logger with live controls) */}
                      {heroTab === "workout" && (
                        <div className="space-y-4 animate-in fade-in duration-200">
                          {/* Exercise Header & Live Rest Timer */}
                          <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                            <div>
                              <h3 className="text-base font-black text-slate-950">
                                Incline Dumbbell Bench Press
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#ed4f28] bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
                                  Chest • Deltoids
                                </span>
                                <span className="text-xs text-slate-500 font-medium">
                                  Target: 4 sets × 8-10 reps • RPE 8.5
                                </span>
                              </div>
                            </div>

                            {/* Interactive Rest Interval Pill */}
                            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-xl shadow-2xs">
                              <Timer className="w-3.5 h-3.5 text-amber-500" />
                              <span className="font-mono text-xs font-bold text-slate-800">
                                {String(Math.floor(restSeconds / 60)).padStart(2, "0")}:
                                {String(restSeconds % 60).padStart(2, "0")}
                              </span>
                              <button
                                type="button"
                                onClick={toggleTimer}
                                className="p-0.5 rounded text-slate-500 hover:text-slate-950 cursor-pointer"
                                title={timerRunning ? "Pause timer" : "Start rest timer"}
                              >
                                {timerRunning ? (
                                  <Pause className="w-3 h-3" />
                                ) : (
                                  <Play className="w-3 h-3 fill-current" />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={resetTimer}
                                className="p-0.5 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
                                title="Reset rest timer"
                              >
                                <RotateCcw className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          </div>

                          {/* Sets Table: Highly Interactive with Load Controls and Log Action */}
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="text-slate-400 font-bold uppercase text-[10px] border-b border-slate-100 pb-2">
                                  <th className="text-left font-mono py-1.5">Set</th>
                                  <th className="text-left font-mono py-1.5">Previous</th>
                                  <th className="text-center font-mono py-1.5">Load</th>
                                  <th className="text-center font-mono py-1.5">Reps</th>
                                  <th className="text-right font-mono py-1.5">Action</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {setsData.map((s, idx) => (
                                  <tr
                                    key={s.set}
                                    className={`transition-colors ${
                                      s.completed ? "bg-slate-50/70" : "hover:bg-slate-50/40"
                                    }`}
                                  >
                                    <td className="py-2.5 font-mono font-bold text-slate-700">
                                      0{s.set}
                                    </td>
                                    <td className="py-2.5 font-mono text-slate-400">{s.prev}</td>
                                    <td className="py-2.5 text-center">
                                      <div className="inline-flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-0.5">
                                        <button
                                          type="button"
                                          onClick={() => adjustLoad(idx, -0.5)}
                                          className="text-slate-400 hover:text-slate-800 cursor-pointer text-[10px]"
                                          title="Minus 0.5 kg"
                                        >
                                          <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="font-mono font-bold text-slate-900 min-w-[48px]">
                                          {s.load.toFixed(1)} kg
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => adjustLoad(idx, 0.5)}
                                          className="text-slate-400 hover:text-slate-800 cursor-pointer text-[10px]"
                                          title="Add 0.5 kg"
                                        >
                                          <Plus className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </td>
                                    <td className="py-2.5 font-mono text-slate-900 text-center font-bold">
                                      {s.reps}
                                    </td>
                                    <td className="py-2.5 text-right">
                                      <button
                                        type="button"
                                        onClick={() => toggleSetCompleted(idx)}
                                        className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                                          s.completed
                                            ? "bg-emerald-600 text-white shadow-xs hover:bg-emerald-700"
                                            : "bg-slate-100 text-slate-700 hover:bg-[#ed4f28] hover:text-white"
                                        }`}
                                      >
                                        {s.completed ? "✓ Logged" : "Log Set"}
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Next Exercise in Queue preview */}
                          <div className="pt-2 border-t border-slate-100">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                              Next In Session
                            </p>
                            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                              <div className="flex items-center gap-2.5">
                                <div className="w-6 h-6 rounded-md bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-mono font-bold">
                                  #2
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-slate-900">
                                    Standing Barbell Overhead Press
                                  </p>
                                  <p className="text-[11px] text-slate-500">
                                    3 sets × 8 reps • 52.5 kg
                                  </p>
                                </div>
                              </div>
                              <span className="text-[11px] font-semibold text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                                In Queue
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* TAB 2: MACRO FUELING (Interactive Day Mode Switcher) */}
                      {heroTab === "macros" && (
                        <div className="space-y-4 animate-in fade-in duration-200">
                          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                Daily Nutrition Protocol
                              </span>
                              <h3 className="text-base font-black text-slate-950 mt-1">
                                {macroDayType === "training" ? "2,650 kcal" : "2,150 kcal"} / day
                                Budget
                              </h3>
                            </div>

                            {/* Training vs Rest Day Toggle */}
                            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-bold">
                              <button
                                type="button"
                                onClick={() => setMacroDayType("training")}
                                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                                  macroDayType === "training"
                                    ? "bg-white text-slate-950 shadow-xs"
                                    : "text-slate-500 hover:text-slate-950"
                                }`}
                              >
                                Training Day
                              </button>
                              <button
                                type="button"
                                onClick={() => setMacroDayType("rest")}
                                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                                  macroDayType === "rest"
                                    ? "bg-white text-slate-950 shadow-xs"
                                    : "text-slate-500 hover:text-slate-950"
                                }`}
                              >
                                Rest Day
                              </button>
                            </div>
                          </div>

                          {/* Macro Target Progress Bars */}
                          <div className="space-y-3 pt-1">
                            <div>
                              <div className="flex justify-between text-xs font-bold mb-1">
                                <span className="text-slate-700">Protein (Muscle Synthesis)</span>
                                <span className="text-[#ed4f28] font-mono">
                                  {macroDayType === "training" ? "185g / 185g (100%)" : "190g / 190g (100%)"}
                                </span>
                              </div>
                              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-[#ed4f28] rounded-full w-full transition-all duration-300" />
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between text-xs font-bold mb-1">
                                <span className="text-slate-700">Carbohydrates (Glycogen Replenishment)</span>
                                <span className="text-amber-700 font-mono">
                                  {macroDayType === "training" ? "290g / 290g (100%)" : "180g / 180g (100%)"}
                                </span>
                              </div>
                              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full bg-amber-500 rounded-full transition-all duration-300 ${
                                    macroDayType === "training" ? "w-full" : "w-[65%]"
                                  }`}
                                />
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between text-xs font-bold mb-1">
                                <span className="text-slate-700">Healthy Fats (Endocrine & Joint Support)</span>
                                <span className="text-emerald-700 font-mono">
                                  {macroDayType === "training" ? "68g / 68g (100%)" : "55g / 55g (100%)"}
                                </span>
                              </div>
                              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full w-full transition-all duration-300" />
                              </div>
                            </div>
                          </div>

                          {/* Tailored Meal Recommendation Card */}
                          <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
                                {macroDayType === "training" ? "Post-Workout Refuel" : "Recovery Meal"}
                              </span>
                              <span className="text-xs font-black text-slate-900">
                                {macroDayType === "training" ? "620 kcal" : "480 kcal"}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-slate-900">
                              {macroDayType === "training"
                                ? "Grilled Salmon, Spiced Quinoa & Steamed Broccolini Bowl"
                                : "Grass-Fed Beef Patty with Avocado & Mixed Garden Greens"}
                            </h4>
                            <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-600 font-medium">
                              <span className="font-bold text-[#ed4f28]">48g Protein</span> •
                              <span className="font-bold text-amber-700">
                                {macroDayType === "training" ? "52g Carbs" : "18g Carbs"}
                              </span>{" "}
                              •<span className="font-bold text-emerald-700">18g Fats</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* TAB 3: VOLUME CURVE (Visual Progression SVG) */}
                      {heroTab === "analytics" && (
                        <div className="space-y-4 animate-in fade-in duration-200">
                          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                                Progression Analytics
                              </span>
                              <h3 className="text-base font-black text-slate-950 mt-1">
                                +14.2% Estimated 1RM Gain
                              </h3>
                            </div>
                            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                              6-Week Microcycle
                            </span>
                          </div>

                          {/* SVG Volume Curve with Gradient Fill */}
                          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                            <div className="flex justify-between items-center text-xs font-bold text-slate-500 mb-2">
                              <span>Compound Lift Tonnage</span>
                              <span className="text-[#ed4f28] font-mono">
                                Week 1 (80kg) → Week 6 (92.5kg)
                              </span>
                            </div>
                            <div className="h-28 w-full relative flex items-end">
                              <svg viewBox="0 0 300 100" className="w-full h-full overflow-visible">
                                <defs>
                                  <linearGradient id="heroCurveGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#ed4f28" stopOpacity="0.3" />
                                    <stop offset="100%" stopColor="#ed4f28" stopOpacity="0.0" />
                                  </linearGradient>
                                </defs>
                                <path
                                  d="M 10 80 Q 70 75, 120 55 T 220 30 T 290 12"
                                  fill="none"
                                  stroke="#ed4f28"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                />
                                <path
                                  d="M 10 80 Q 70 75, 120 55 T 220 30 T 290 12 L 290 100 L 10 100 Z"
                                  fill="url(#heroCurveGrad)"
                                />
                                <circle cx="10" cy="80" r="3.5" fill="#ed4f28" />
                                <circle cx="120" cy="55" r="3.5" fill="#ed4f28" />
                                <circle cx="220" cy="30" r="3.5" fill="#ed4f28" />
                                <circle cx="290" cy="12" r="4.5" fill="#10b981" />
                              </svg>
                            </div>
                            <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-2">
                              <span>W1</span>
                              <span>W2</span>
                              <span>W3</span>
                              <span>W4</span>
                              <span>W5</span>
                              <span className="text-emerald-600 font-bold">W6 (Peak)</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                              <p className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                                Weekly Load
                              </p>
                              <p className="text-lg font-black text-slate-950 mt-0.5">48,250 kg</p>
                              <p className="text-[10px] font-semibold text-emerald-600 mt-0.5">
                                ↑ 8.4% vs last cycle
                              </p>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                              <p className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                                Consistency Index
                              </p>
                              <p className="text-lg font-black text-slate-950 mt-0.5">18 Days Active</p>
                              <p className="text-[10px] font-semibold text-[#ed4f28] mt-0.5">
                                100% Prescription Met
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Console Footer */}
                    <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-slate-500 font-medium">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Cloud Auto-Save • Offline Resilient</span>
                      </div>
                      <Link
                        href="/register"
                        className="font-bold text-slate-900 hover:text-[#ed4f28] transition-colors inline-flex items-center gap-1"
                      >
                        Explore Full Engine →
                      </Link>
                    </div>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. CORE ARCHITECTURE BENTO GRID (Deep Obsidian & Warm Atmospheric Glyphs) */}
        {/* ========================================================================= */}
        <section id="features" className="relative py-24 overflow-hidden bg-slate-950 text-white border-y border-slate-800">
          {/* Subtle Ambient Radial Lighting */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[radial-gradient(ellipse_60%_60%_at_50%_-10%,rgba(237,79,40,0.15),transparent)]" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/25 text-xs font-mono font-bold text-orange-400 uppercase tracking-widest mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ed4f28] animate-pulse" />
                System Architecture
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white mt-2">
                Everything Engineered for{" "}
                <span className="text-[#ed4f28]">Relentless Progress</span>
              </h2>
              <p className="mt-4 text-slate-300 text-base sm:text-lg font-normal leading-relaxed">
                No random routines, no guesswork. Strive merges exercise physiology with automated
                tracking to ensure your efforts translate into measurable gains.
              </p>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Bento Card 1: 8-col on MD (Interactive Dynamic Progressive Overload) */}
              <div className="md:col-span-8 rounded-3xl bg-slate-900/90 backdrop-blur-xl border border-slate-800/90 hover:border-orange-500/40 p-7 sm:p-8 transition-all flex flex-col justify-between group shadow-xl">
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-center text-[#ed4f28] group-hover:border-orange-500/60 transition-colors shadow-inner">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase block">
                          Engine Module 01
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-200">
                          PROGRESSION_MATRIX
                        </span>
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
                    Never plateau on your key lifts. Strive monitors completed sets, reps, and
                    perceived difficulty to calculate the precise micro-increments (+1.25kg to +2.5kg)
                    you need each week.
                  </p>
                </div>

                {/* Interactive Week Timeline Selector */}
                <div className="mt-8 pt-6 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2.5 font-mono">
                    <span>TIMELINE SIMULATION</span>
                    <span className="text-orange-400 font-bold">Select Week to Preview</span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 sm:gap-4">
                    <button
                      type="button"
                      onClick={() => setBentoWeek(1)}
                      className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer ${
                        bentoWeek === 1
                          ? "bg-slate-800 border-orange-500/80 shadow-md"
                          : "bg-slate-950/70 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <p className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                        Week 1 Baseline
                      </p>
                      <p className="text-base sm:text-lg font-black text-white mt-0.5">80 kg × 8</p>
                      <span className="text-[10px] font-mono text-slate-400">RPE 8.0 Target</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBentoWeek(3)}
                      className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer ${
                        bentoWeek === 3
                          ? "bg-slate-800 border-emerald-500/80 shadow-md"
                          : "bg-slate-950/70 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <p className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                        Week 3 Adapted
                      </p>
                      <p className="text-base sm:text-lg font-black text-emerald-400 mt-0.5">
                        85 kg × 8
                      </p>
                      <span className="text-[10px] font-mono font-bold text-emerald-400">
                        +5 kg Overload
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBentoWeek(5)}
                      className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer ${
                        bentoWeek === 5
                          ? "bg-orange-950/40 border-orange-500 shadow-md"
                          : "bg-slate-950/70 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <p className="text-[10px] font-mono font-bold text-orange-400 uppercase">
                        Week 5 Target
                      </p>
                      <p className="text-base sm:text-lg font-black text-orange-300 mt-0.5">
                        87.5 kg × 8
                      </p>
                      <span className="text-[10px] font-mono font-bold text-orange-400">
                        Auto-Prescribed
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Bento Card 2: 4-col (Calibrated Macro OS) */}
              <div className="md:col-span-4 rounded-3xl bg-slate-900/90 backdrop-blur-xl border border-slate-800/90 hover:border-emerald-500/40 p-7 sm:p-8 transition-all flex flex-col justify-between group shadow-xl">
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-center text-emerald-400 group-hover:border-emerald-500/60 transition-colors shadow-inner">
                        <Utensils className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase block">
                          Engine Module 02
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-200">
                          METABOLIC_SYNC
                        </span>
                      </div>
                    </div>

                    <span className="text-[11px] font-mono font-bold text-orange-400 bg-orange-500/10 border border-orange-500/30 px-3 py-1 rounded-full">
                      3-TIER MACROS
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Calibrated Macro OS
                  </h3>
                  <p className="mt-2 text-sm text-slate-300 leading-relaxed font-normal">
                    Custom nutrition algorithms compute protein, carbohydrate, and lipid targets
                    matched to your training intensity and body composition.
                  </p>
                </div>

                <div className="mt-6 p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                  {/* Goal Mode Toggle */}
                  <div className="flex gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setMacroMode("hypertrophy")}
                      className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                        macroMode === "hypertrophy"
                          ? "bg-slate-800 text-white shadow-xs"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Hypertrophy
                    </button>
                    <button
                      type="button"
                      onClick={() => setMacroMode("lean")}
                      className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                        macroMode === "lean"
                          ? "bg-slate-800 text-white shadow-xs"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Lean Cut
                    </button>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-mono font-bold text-slate-300">
                      <span>Protein Target</span>
                      <span className="text-emerald-400 font-mono font-black">
                        {macroMode === "hypertrophy" ? "2.0g / kg BW" : "2.4g / kg BW"}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden mt-1.5">
                      <div
                        className={`h-full bg-emerald-500 rounded-full transition-all duration-300 ${
                          macroMode === "hypertrophy" ? "w-[85%]" : "w-[95%]"
                        }`}
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">
                    {macroMode === "hypertrophy"
                      ? "Calibrated for positive nitrogen balance and lean tissue growth."
                      : "Preserves lean muscle mass in an active caloric deficit."}
                  </p>
                </div>
              </div>

              {/* Bento Card 3: 6-col (Zero Equipment Barrier) */}
              <div className="md:col-span-6 rounded-3xl bg-slate-900/90 backdrop-blur-xl border border-slate-800/90 hover:border-amber-500/40 p-7 sm:p-8 transition-all group shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-center text-amber-400 group-hover:border-amber-500/60 transition-colors shadow-inner">
                      <Dumbbell className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase block">
                        Engine Module 03
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-200">
                        HARDWARE_AGNOSTIC
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setEquipmentMode("gym")}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        equipmentMode === "gym"
                          ? "bg-slate-800 text-white shadow-xs"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Gym Rack
                    </button>
                    <button
                      type="button"
                      onClick={() => setEquipmentMode("dumbbells")}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        equipmentMode === "dumbbells"
                          ? "bg-slate-800 text-white shadow-xs"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Dumbbells
                    </button>
                    <button
                      type="button"
                      onClick={() => setEquipmentMode("bodyweight")}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        equipmentMode === "bodyweight"
                          ? "bg-slate-800 text-white shadow-xs"
                          : "text-slate-400 hover:text-slate-200"
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
                  Whether you have access to an elite barbell gym, a set of dumbbells at home, or
                  zero equipment in a hotel room — your plan adapts instantly.
                </p>

                <div className="mt-6 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-300">
                    <span>
                      {equipmentMode === "gym" && "Commercial Barbell & Cable Setup"}
                      {equipmentMode === "dumbbells" && "Home Dumbbell & Bench Setup"}
                      {equipmentMode === "bodyweight" && "Calisthenics & High-Tension Movement"}
                    </span>
                    <span className="text-[#ed4f28] font-bold">Active Preset</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 font-medium">
                    {equipmentMode === "gym" &&
                      "Includes Barbell Squats, Cable Crossovers, Romanian Deadlifts, Lat Pulldowns."}
                    {equipmentMode === "dumbbells" &&
                      "Includes DB Goblet Squats, DB Floor Press, Single-Leg RDLs, Hammer Curls."}
                    {equipmentMode === "bodyweight" &&
                      "Includes Deficit Push-ups, Pike Presses, Bulgarian Split Squats, Pull-ups."}
                  </p>
                </div>
              </div>

              {/* Bento Card 4: 6-col (Readiness & Recovery Rhythm) */}
              <div className="md:col-span-6 rounded-3xl bg-slate-900/90 backdrop-blur-xl border border-slate-800/90 hover:border-rose-500/40 p-7 sm:p-8 transition-all flex flex-col justify-between group shadow-xl">
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-center text-rose-400 group-hover:border-rose-500/60 transition-colors shadow-inner">
                        <Heart className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase block">
                          Engine Module 04
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-200">
                          CNS_AUTONOMIC
                        </span>
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
                    Lifting heavy without planned recovery leads to fatigue. Strive balances
                    training load with scheduled deloads and rest periods so your joints stay healthy.
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
        {/* 3. INTERACTIVE PLAN & MACRO CALCULATOR (Refined high-value micro-tool)     */}
        {/* ========================================================================= */}
        <section id="interactive-demo" className="py-24 bg-white border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-[#ed4f28] bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
                Interactive Plan Preview
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 mt-3">
                Test-Drive Your Custom Protocol
              </h2>
              <p className="mt-3 text-slate-600 text-base font-normal">
                Choose your primary fitness objective and training frequency to see how Strive
                calibrates your split and nutrition breakdown in real time.
              </p>
            </div>

            <div className="max-w-5xl mx-auto rounded-3xl bg-slate-950 text-white p-6 sm:p-10 shadow-2xl relative overflow-hidden border border-slate-800">
              {/* Radiant ambient glow */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#ed4f28]/10 rounded-full blur-3xl pointer-events-none" />
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
                          className={`py-2.5 px-2 rounded-xl text-xs font-bold text-center transition-all cursor-pointer ${
                            calcGoal === item.id
                              ? "bg-[#ed4f28] text-white shadow-md shadow-[#ed4f28]/30 font-extrabold"
                              : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800"
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
                          className={`py-2.5 px-2 rounded-xl text-xs font-bold text-center transition-all cursor-pointer ${
                            calcDays === d
                              ? "bg-[#ed4f28] text-white shadow-md shadow-[#ed4f28]/30 font-extrabold"
                              : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800"
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
                          className={`py-2 px-2 rounded-xl text-xs font-bold text-center transition-all cursor-pointer ${
                            calcLevel === item.id
                              ? "bg-[#ed4f28] text-white shadow-md shadow-[#ed4f28]/30 font-extrabold"
                              : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                      <Sparkles className="w-4 h-4" />
                      <span>Instant Algorithmic Synthesis</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      All calculations are calibrated against validated sports science models
                      (Mifflin-St Jeor & Schoenfeld Volume Guidelines).
                    </p>
                  </div>
                </div>

                {/* Right Output Card (7 cols) */}
                <div className="lg:col-span-7 bg-slate-900/80 rounded-2xl p-6 sm:p-8 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400">
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

                    {/* Weekly Schedule Timeline Preview */}
                    <div className="mt-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Weekly Microcycle Roadmap
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {calcOutput.schedule.map((dayItem, idx) => (
                          <span
                            key={idx}
                            className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                          >
                            {dayItem}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Macro Target Summary Cards */}
                    <div className="grid grid-cols-4 gap-2.5 my-5">
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                        <p className="text-[10px] font-bold uppercase text-slate-400">Calories</p>
                        <p className="text-sm sm:text-base font-black text-white mt-1">
                          {calcOutput.calories}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                        <p className="text-[10px] font-bold uppercase text-[#ed4f28]">Protein</p>
                        <p className="text-sm sm:text-base font-black text-white mt-1">
                          {calcOutput.protein}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                        <p className="text-[10px] font-bold uppercase text-amber-400">Carbs</p>
                        <p className="text-sm sm:text-base font-black text-white mt-1">
                          {calcOutput.carbs}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                        <p className="text-[10px] font-bold uppercase text-emerald-400">Fats</p>
                        <p className="text-sm sm:text-base font-black text-white mt-1">
                          {calcOutput.fats}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-slate-300">
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>
                          <strong>Training Methodology:</strong> {calcOutput.primaryFocus}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>
                          <strong>Rest Cadence:</strong> {calcOutput.restInterval}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-5 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-slate-400 text-center sm:text-left">
                      Ready to lock in this routine? Sign up takes under 60 seconds.
                    </p>
                    <button
                      type="button"
                      onClick={handleApplyPlan}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#ed4f28] hover:bg-orange-600 px-6 py-3 text-xs font-bold text-white transition-all shadow-md shadow-[#ed4f28]/30 active:scale-95 cursor-pointer"
                    >
                      Generate Full Plan →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. HOW IT WORKS (Connected, interactive execution roadmap)               */}
        {/* ========================================================================= */}
        <section id="how-it-works" className="py-24 bg-slate-50 border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-[#ed4f28] bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
                Execution Workflow
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 mt-3">
                How Strive Drives Results
              </h2>
              <p className="mt-3 text-slate-600 text-base font-normal">
                Three streamlined steps that replace spreadsheets, expensive coaching, and
                trial-and-error. Click any step to inspect the protocol in action.
              </p>
            </div>

            {/* Connected Step Cards with Interactive Selection */}
            <div className="grid lg:grid-cols-3 gap-8 relative">
              {[
                {
                  step: "01",
                  title: "Calibrate Metrics & Gear",
                  description:
                    "Specify your current lifting stats, weekly schedule availability, and exact equipment (full commercial gym, home barbell, or dumbbells only).",
                  highlight: "Equipment-Aware Mapping",
                  previewLabel: "Adaptive Hardware Presets",
                  icon: Sliders,
                },
                {
                  step: "02",
                  title: "Synthesize Training & Macros",
                  description:
                    "Our algorithm creates balanced weekly training splits, movement order, target sets/reps, and dynamic daily macronutrient targets.",
                  highlight: "Periodized Volume",
                  previewLabel: "Daily Nutrient Matching",
                  icon: Layers,
                },
                {
                  step: "03",
                  title: "Log Sets & Auto-Progress",
                  description:
                    "Record weight and repetitions in two taps during sessions. Strive automatically calculates progressive overload increases for your next workout.",
                  highlight: "Zero Guesswork",
                  previewLabel: "Automated +2.5kg Micro-Loads",
                  icon: TrendingUp,
                },
              ].map((item, idx) => {
                const isSelected = activeStep === idx;
                return (
                  <Reveal key={item.step} delay={idx * 80}>
                    <div
                      onClick={() => setActiveStep(idx)}
                      className={`h-full rounded-3xl p-8 border transition-all duration-200 flex flex-col justify-between group cursor-pointer ${
                        isSelected
                          ? "bg-white border-[#ed4f28] shadow-lg shadow-orange-500/10 ring-2 ring-[#ed4f28]/20"
                          : "bg-white border-slate-200/90 shadow-sm hover:border-slate-300 hover:shadow-md"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-6">
                          <span
                            className={`text-3xl font-black transition-colors ${
                              isSelected ? "text-[#ed4f28]" : "text-slate-200 group-hover:text-slate-400"
                            }`}
                          >
                            {item.step}
                          </span>
                          <div
                            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                              isSelected
                                ? "bg-[#ed4f28] text-white shadow-md shadow-[#ed4f28]/30"
                                : "bg-orange-50 text-[#ed4f28]"
                            }`}
                          >
                            <item.icon className="w-5 h-5" />
                          </div>
                        </div>

                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#ed4f28] bg-orange-50 px-2.5 py-0.5 rounded border border-orange-100">
                          {item.highlight}
                        </span>
                        <h3 className="text-xl font-extrabold text-slate-900 mt-2.5 tracking-tight">
                          {item.title}
                        </h3>
                        <p className="mt-3 text-sm text-slate-600 leading-relaxed font-normal">
                          {item.description}
                        </p>
                      </div>

                      <div className="mt-7 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                        <span className={isSelected ? "text-[#ed4f28]" : "text-slate-500"}>
                          {item.previewLabel}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[#ed4f28]">
                          <span>Step {idx + 1} of 3</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>

            {/* Interactive Live Workflow Step Explainer Box */}
            <div className="mt-8 rounded-2xl bg-white p-6 border border-slate-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#ed4f28] text-white font-bold flex items-center justify-center text-xs">
                    0{activeStep + 1}
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase text-slate-400">Selected Step Preview</p>
                    <p className="text-sm font-bold text-slate-900">
                      {activeStep === 0 && "Equipment Profiler: Instant conversion between Barbell, Dumbbell, and Bodyweight protocols"}
                      {activeStep === 1 && "Algorithmic Periodization: Volume matches muscle recovery cycles and dynamic macro nutrition"}
                      {activeStep === 2 && "Micro-Progression: +1.25kg to +2.5kg calculated directly from previous RPE feedback"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveStep((prev) => (prev + 1) % 3)}
                  className="text-xs font-bold text-[#ed4f28] hover:text-orange-700 transition-colors inline-flex items-center gap-1 self-start sm:self-auto cursor-pointer"
                >
                  Next Step Showcase →
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. BUILT FOR EVERY TRAINING DISCIPLINE                                    */}
        {/* ========================================================================= */}
        <section className="py-24 bg-white border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-[#ed4f28] bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
                Tailored Disciplines
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 mt-3">
                Engineered for Every Training Style
              </h2>
              <p className="mt-3 text-slate-600 text-base font-normal">
                Whether your primary focus is maximum muscle hypertrophy, pure compound strength,
                or time-efficient conditioning, Strive tailors the volume and nutrition to match.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Hypertrophy & Physique",
                  description:
                    "High mechanical tension, localized fatigue management, and strategic exercise variety to maximize muscle cross-sectional area.",
                  splitExample: "4-5 Day Push / Pull / Legs",
                },
                {
                  title: "Power & Compound Strength",
                  description:
                    "Heavy barbell work, nervous system recruitment, and linear progression schemes designed around squats, bench, and deadlifts.",
                  splitExample: "3-4 Day Wave Progression",
                },
                {
                  title: "Fat Loss & Recomposition",
                  description:
                    "Muscle-sparing high-protein deficits paired with dense, calorie-burning compound circuits to drop fat without sacrificing strength.",
                  splitExample: "4-Day Upper / Lower Density",
                },
                {
                  title: "Minimalist & Home Training",
                  description:
                    "Ultra-efficient dumbbell and bodyweight protocols for busy founders and professionals needing results in 35 minutes or less.",
                  splitExample: "3-Day Full Body High-Intensity",
                },
              ].map((style, idx) => (
                <Reveal key={style.title} delay={idx * 80}>
                  <div className="h-full rounded-2xl p-6 bg-slate-50 border border-slate-200/80 hover:border-orange-300 hover:bg-white transition-all flex flex-col justify-between group shadow-2xs">
                    <div>
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-800 mb-4 shadow-xs group-hover:border-orange-300 group-hover:text-[#ed4f28] transition-colors">
                        0{idx + 1}
                      </div>
                      <h3 className="text-base font-extrabold text-slate-900">{style.title}</h3>
                      <p className="mt-2 text-xs text-slate-600 leading-relaxed font-normal">
                        {style.description}
                      </p>
                    </div>

                    <div className="mt-6 pt-3 border-t border-slate-200/60 text-[11px] font-bold text-[#ed4f28]">
                      Structure: {style.splitExample}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. CALL TO ACTION: Dynamic, high-impact athletic conversion banner        */}
        {/* ========================================================================= */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="rounded-3xl bg-slate-950 p-8 sm:p-14 text-center relative overflow-hidden shadow-2xl border border-slate-800">
                {/* Radiant ambient background glows */}
                <div className="absolute top-0 right-1/4 w-80 h-80 bg-[#ed4f28]/20 rounded-full blur-3xl pointer-events-none" />
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
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#ed4f28] hover:bg-orange-600 px-8 py-3.5 text-sm font-bold text-white transition-all shadow-lg shadow-[#ed4f28]/30 hover:scale-[1.02] active:scale-95"
                    >
                      Sign Up
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      href="/login"
                      className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-slate-900 hover:bg-slate-800 px-6 py-3.5 text-sm font-bold text-slate-300 transition-colors border border-slate-800"
                    >
                      Login
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
                <div className="group-hover:scale-105 transition-transform flex items-center justify-center">
                  <BrandMark className="h-7 w-7 drop-shadow-xs" />
                </div>
                <span className="text-xl font-black text-slate-950 tracking-tight">Strive</span>
              </Link>

              <div className="flex flex-wrap justify-center gap-6 sm:gap-8 text-sm font-bold text-slate-700">
                <a href="#features" className="hover:text-[#ed4f28] transition-colors">
                  Features
                </a>
                <a href="#interactive-demo" className="hover:text-[#ed4f28] transition-colors">
                  Plan Calculator
                </a>
                <a href="#how-it-works" className="hover:text-[#ed4f28] transition-colors">
                  How It Works
                </a>
                <Link href="/login" className="hover:text-[#ed4f28] transition-colors">
                  Login
                </Link>
                <Link href="/register" className="hover:text-[#ed4f28] transition-colors">
                  Sign Up
                </Link>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
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
