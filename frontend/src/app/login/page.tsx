"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, LogIn, Eye, EyeOff, Mail, Lock, ShieldCheck, Dumbbell, Utensils, TrendingUp, Zap } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { toast } from "react-hot-toast";
import { getToken, postJson, saveAuth } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (getToken()) {
      router.replace("/dashboard");
    }
  }, [router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await postJson<{
        message: string;
        user: {
          id: string;
          fullName: string;
          email: string;
          role: "user" | "admin";
        };
        token: string;
      }>("/api/auth/login", formData);

      if (!response.ok || !response.data?.token || !response.data.user) {
        throw new Error(response.message || "Invalid email or password");
      }

      saveAuth(response.data.token, response.data.user);
      toast.success("Logged in successfully!");
      router.replace("/dashboard");
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to connect to the backend server. Please make sure the backend is running on http://localhost:5000."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoAccount = () => {
    setFormData({
      email: "demo@strive.app",
      password: "Password123!",
    });
    toast.success("Demo credentials loaded!");
  };

  return (
    <div className="h-screen max-h-screen overflow-hidden grid lg:grid-cols-2 bg-slate-50 selection:bg-blue-500 selection:text-white">
      {/* 1st Panel: Fitness Visual & Showcase */}
      <div className="relative hidden lg:flex flex-col justify-between p-10 overflow-hidden bg-slate-900 h-full">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-65 scale-105 transition-transform duration-1000"
          style={{ backgroundImage: `url('/images/fitness_auth.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-slate-900/40" />

        {/* Top Logo */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center space-x-3 group">
            <div className="bg-blue-600/90 p-2 rounded-2xl backdrop-blur-md group-hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/30">
              <BrandMark className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-extrabold text-white tracking-tight">Strive</span>
          </Link>
        </div>

        {/* Center Quote & Badges */}
        <div className="relative z-10 max-w-lg my-auto space-y-5">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight tracking-tight">
            Fuel Your Ambition. <br />
            Track Your <span className="bg-gradient-to-r from-blue-400 via-coral to-amber-300 bg-clip-text text-transparent">Transformation.</span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-medium">
            Achieve your personal fitness goals with custom nutrition plans, smart workouts, and daily AI coaching.
          </p>

          <div className="flex items-center gap-5 pt-2">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-4 py-2.5 text-white">
              <p className="text-lg font-extrabold">100% Free</p>
              <p className="text-[11px] text-slate-300 font-medium">To Get Started</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-4 py-2.5 text-white">
              <p className="text-lg font-extrabold">100%</p>
              <p className="text-[11px] text-slate-300 font-medium">Personalized Plans</p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 font-medium">
          <p>&copy; 2026 Strive Fitness</p>
          <Link href="/" className="hover:text-white transition-colors">Back to Home &rarr;</Link>
        </div>
      </div>

      {/* 2nd Panel: Clean Warm Form Container (No Grid Lines, No Scrollbar) */}
      <div className="relative flex flex-col justify-between py-6 sm:py-10 px-6 sm:px-12 lg:px-16 bg-gradient-to-br from-cream via-slate-50 to-orange-50/30 h-full max-h-screen overflow-hidden">
        {/* Ambient Glowing Background Orbs (No Grid Pattern) */}
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 left-10 w-48 h-48 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />

        <div className="my-auto mx-auto w-full max-w-md bg-white/95 backdrop-blur-2xl rounded-[2rem] border border-white shadow-xl shadow-slate-300/50 overflow-hidden relative z-10">
          {/* Top Accent Line */}
          <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-coral to-amber-500" />

          <div className="p-6 sm:p-8">
            {/* Mobile Brand Header */}
            <div className="lg:hidden mb-4 flex items-center justify-between">
              <Link href="/" className="inline-flex items-center space-x-2">
                <div className="bg-blue-600 p-1.5 rounded-xl text-white shadow-md shadow-blue-500/20">
                  <BrandMark className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-extrabold text-slate-900 tracking-tight">Strive</span>
              </Link>
            </div>

            {/* Auth Tab Switcher */}
            <div className="flex bg-slate-100/90 p-1 rounded-xl mb-6 border border-slate-200/60 text-xs font-bold">
              <button
                type="button"
                className="flex-1 py-2 rounded-lg bg-white text-slate-900 shadow-xs text-center transition-all"
              >
                Sign In
              </button>
              <Link
                href="/register"
                className="flex-1 py-2 rounded-lg text-slate-500 hover:text-slate-900 text-center transition-all"
              >
                Create Account
              </Link>
            </div>

            <div className="mb-5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold uppercase tracking-wider mb-2 border border-blue-100/80">
                <ShieldCheck className="w-3 h-3 text-blue-600" />
                Verified Portal
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Welcome back</h2>
              <p className="mt-1 text-xs text-slate-500 font-medium">
                Enter your credentials to access your dashboard.
              </p>
            </div>

            <form className="space-y-3.5" onSubmit={onSubmit}>
              <div>
                <label htmlFor="email" className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="block w-full pl-10 pr-4 py-2.5 bg-slate-50/90 text-slate-900 border border-slate-200/90 rounded-xl shadow-xs placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 focus:bg-white transition-all text-xs sm:text-sm font-medium"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={fillDemoAccount}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
                  >
                    <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                    Auto-fill Demo
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="block w-full pl-10 pr-11 py-2.5 bg-slate-50/90 text-slate-900 border border-slate-200/90 rounded-xl shadow-xs placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 focus:bg-white transition-all text-xs sm:text-sm font-medium"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-full shadow-md shadow-blue-500/25 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all group"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span className="flex items-center gap-2">
                      Sign In to Dashboard
                      <LogIn className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  )}
                </button>
              </div>
            </form>

            {/* Feature Highlights Footer inside card */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">What awaits inside</p>
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold text-slate-600">
                <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100 flex flex-col items-center gap-0.5">
                  <Dumbbell className="w-3.5 h-3.5 text-blue-600" />
                  <span>Workouts</span>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100 flex flex-col items-center gap-0.5">
                  <Utensils className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Meals</span>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100 flex flex-col items-center gap-0.5">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                  <span>Tracking</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Trust Footer */}
        <div className="text-center text-[11px] text-slate-400 font-medium relative z-10 flex items-center justify-center gap-3">
          <span>🔒 256-Bit SSL Security</span>
          <span>•</span>
          <span>⚡ AI Guidance</span>
        </div>
      </div>
    </div>
  );
}
