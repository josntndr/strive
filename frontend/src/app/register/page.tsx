"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight, ShieldCheck, FileText, Eye, EyeOff, User, Mail, Lock, Sparkles, Dumbbell, Utensils, TrendingUp } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { toast } from "react-hot-toast";
import { Modal } from "@/components/Modal";
import { getToken, postJson, saveAuth } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (getToken()) {
      router.replace("/dashboard");
    }
  }, [router]);

  const isFormValid = 
    formData.name.trim() !== "" &&
    formData.email.includes("@") &&
    formData.password.length >= 6 &&
    formData.password === formData.confirmPassword &&
    acceptedTerms;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!acceptedTerms) {
      return toast.error("You must agree to the Terms and Privacy Policy before creating an account.");
    }

    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match.");
    }

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
      }>("/api/auth/register", {
        fullName: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        agreedToTerms: acceptedTerms,
      });

      if (!response.ok) {
        throw new Error(response.message);
      }

      if (!response.data?.token || !response.data.user) {
        throw new Error("Server returned an invalid response. Please check if the backend API is running.");
      }

      saveAuth(response.data.token, response.data.user);
      toast.success("Account created successfully!");
      router.replace("/profile-setup");
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Registration failed. Please check if the backend server is running."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-slate-50 selection:bg-blue-500 selection:text-white">
      {/* 1st Panel: Fitness Visual & Showcase */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden bg-slate-900">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-65 scale-105 transition-transform duration-1000"
          style={{ backgroundImage: `url('/images/fitness_auth.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-slate-900/40" />

        {/* Top Logo */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center space-x-3 group">
            <div className="bg-blue-600/90 p-2.5 rounded-2xl backdrop-blur-md group-hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/30">
              <BrandMark className="h-7 w-7 text-white" />
            </div>
            <span className="text-2xl font-extrabold text-white tracking-tight">Strive</span>
          </Link>
        </div>

        {/* Center Quote & Badges */}
        <div className="relative z-10 max-w-lg my-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-md border border-white/15">
            💪 Start Your Journey Today
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight tracking-tight">
            Build Strong Habits. <br />
            Achieve Your <span className="bg-gradient-to-r from-blue-400 via-coral to-amber-300 bg-clip-text text-transparent">Full Potential.</span>
          </h1>
          <p className="text-slate-300 text-base leading-relaxed font-medium">
            Create your account in seconds to receive custom workouts, smart meal plans, and intelligent progress tracking.
          </p>

          <div className="flex items-center gap-6 pt-4">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-5 py-3 text-white">
              <p className="text-xl font-extrabold">100% Free</p>
              <p className="text-xs text-slate-300 font-medium">To Get Started</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-5 py-3 text-white">
              <p className="text-xl font-extrabold">Instant</p>
              <p className="text-xs text-slate-300 font-medium">AI Plan Generation</p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 font-medium">
          <p>&copy; 2026 Strive Fitness</p>
          <Link href="/" className="hover:text-white transition-colors">Back to Home &rarr;</Link>
        </div>
      </div>

      {/* 2nd Panel: Rich Visual Form Container */}
      <div className="relative flex flex-col justify-between py-12 px-6 sm:px-12 lg:px-16 bg-gradient-to-br from-cream via-slate-50 to-orange-50/40 overflow-y-auto">
        {/* SVG Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {/* Ambient Glowing Orbs */}
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 left-10 w-60 h-60 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />

        {/* Floating Top Accent Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white shadow-md border border-slate-200/80 text-xs font-bold text-slate-700 absolute top-8 right-8 z-20 animate-floaty">
          <Sparkles className="w-4 h-4 text-blue-600 fill-blue-600" />
          <span>Join Free Today</span>
        </div>

        <div className="my-auto mx-auto w-full max-w-md bg-white/95 backdrop-blur-2xl rounded-[2.5rem] border border-white shadow-2xl shadow-slate-300/60 overflow-hidden relative z-10 hover-lift">
          {/* Top Gradient Accent Bar */}
          <div className="h-2 w-full bg-gradient-to-r from-blue-600 via-coral to-amber-500" />

          <div className="p-8 sm:p-10">
            {/* Mobile Brand Header */}
            <div className="lg:hidden mb-6 flex items-center justify-between">
              <Link href="/" className="inline-flex items-center space-x-2.5">
                <div className="bg-blue-600 p-2 rounded-xl text-white shadow-md shadow-blue-500/20">
                  <BrandMark className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-extrabold text-slate-900 tracking-tight">Strive</span>
              </Link>
            </div>

            {/* Auth Tab Switcher */}
            <div className="flex bg-slate-100/80 p-1 rounded-2xl mb-8 border border-slate-200/60 text-xs font-bold">
              <Link
                href="/login"
                className="flex-1 py-2.5 rounded-xl text-slate-500 hover:text-slate-900 text-center transition-all"
              >
                Sign In
              </Link>
              <button
                type="button"
                className="flex-1 py-2.5 rounded-xl bg-white text-slate-900 shadow-sm text-center transition-all"
              >
                Create Account
              </button>
            </div>

            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-3 border border-blue-100/80">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Free Account Registration
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Start your transformation</h2>
              <p className="mt-1.5 text-sm text-slate-500 font-medium">
                Set up your profile to generate your first AI fitness plan.
              </p>
            </div>

            <form className="space-y-4" onSubmit={onSubmit}>
              <div>
                <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    autoComplete="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="block w-full pl-10 pr-4 py-3 bg-slate-50/90 text-slate-900 border border-slate-200/90 rounded-2xl shadow-xs placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 focus:bg-white transition-all text-sm font-medium"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Email Address
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
                    className="block w-full pl-10 pr-4 py-3 bg-slate-50/90 text-slate-900 border border-slate-200/90 rounded-2xl shadow-xs placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 focus:bg-white transition-all text-sm font-medium"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="new-password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="block w-full pl-9 pr-9 py-3 bg-slate-50/90 text-slate-900 border border-slate-200/90 rounded-2xl shadow-xs placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 focus:bg-white transition-all text-sm font-medium"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-blue-600 transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Confirm
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      autoComplete="new-password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="block w-full pl-9 pr-9 py-3 bg-slate-50/90 text-slate-900 border border-slate-200/90 rounded-2xl shadow-xs placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 focus:bg-white transition-all text-sm font-medium"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-blue-600 transition-colors"
                      aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-start pt-1">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-slate-300 rounded-lg cursor-pointer transition-colors"
                  />
                </div>
                <div className="ml-3 text-xs">
                  <label htmlFor="terms" className="font-medium text-slate-600 cursor-pointer select-none">
                    I agree to the{" "}
                    <button 
                      type="button"
                      onClick={() => setShowTerms(true)}
                      className="text-blue-600 font-bold hover:underline"
                    >
                      Terms
                    </button>{" "}
                    and{" "}
                    <button 
                      type="button"
                      onClick={() => setShowPrivacy(true)}
                      className="text-blue-600 font-bold hover:underline"
                    >
                      Privacy Policy
                    </button>
                  </label>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  onClick={(e) => {
                    if (!isFormValid && !isLoading) {
                      e.preventDefault();
                      if (!acceptedTerms) {
                        toast.error("You must agree to the Terms and Privacy Policy before creating an account.");
                      } else if (formData.password !== formData.confirmPassword) {
                        toast.error("Passwords do not match.");
                      } else if (formData.name.trim() === "" || !formData.email.includes("@") || formData.password.length < 6) {
                        toast.error("Please fill in all fields correctly.");
                      }
                    }
                  }}
                  className={`w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-full shadow-lg text-sm font-bold text-white transition-all active:scale-95 group ${
                    isFormValid 
                      ? "bg-blue-600 hover:bg-blue-700 shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30" 
                      : "bg-blue-600/70 hover:bg-blue-600 shadow-blue-500/10"
                  }`}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <span className="flex items-center gap-2">
                      Create My Free Account
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  )}
                </button>
                {!acceptedTerms && !isLoading && (
                  <p className="mt-2 text-center text-xs text-slate-400 font-medium">
                    Please accept the terms to enable account creation.
                  </p>
                )}
              </div>
            </form>

            {/* Feature Highlights Footer inside card */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 text-center">Included with your account</p>
              <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-bold text-slate-600">
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center gap-1">
                  <Dumbbell className="w-4 h-4 text-blue-600" />
                  <span>Workouts</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center gap-1">
                  <Utensils className="w-4 h-4 text-emerald-600" />
                  <span>Meal Plans</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-amber-600" />
                  <span>Progress</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Trust Footer */}
        <div className="mt-6 text-center text-xs text-slate-400 font-medium relative z-10 flex items-center justify-center gap-4">
          <span className="flex items-center gap-1">🔒 256-Bit SSL Security</span>
          <span>•</span>
          <span className="flex items-center gap-1">⚡ Instant Setup</span>
        </div>
      </div>

      {/* Modals */}
      <Modal 
        isOpen={showTerms} 
        onClose={() => setShowTerms(false)} 
        title="Terms and Conditions"
        onAccept={() => setAcceptedTerms(true)}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-blue-600 mb-6">
            <FileText className="w-8 h-8" />
            <span className="text-sm font-bold uppercase tracking-wider">User Agreement</span>
          </div>
          <p>By using Strive, you agree to use the application for personal fitness tracking and planning purposes only. The workout and meal suggestions provided by the system are general recommendations and should not be treated as medical advice.</p>
          <p>Users are responsible for entering accurate information and consulting a qualified professional before starting any intense workout or diet program, especially if they have existing health conditions.</p>
          <h4 className="font-bold text-slate-900 mt-6">1. App Usage</h4>
          <p>Strive is designed to be a supportive tool in your fitness journey. We encourage consistent use but remind users that results vary based on individual effort and biological factors.</p>
          <h4 className="font-bold text-slate-900">2. Disclaimer</h4>
          <p>We do not provide medical advice. If you experience pain or discomfort during workouts, stop immediately and seek medical attention.</p>
          <h4 className="font-bold text-slate-900">3. Account Responsibility</h4>
          <p>You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account.</p>
        </div>
      </Modal>

      <Modal 
        isOpen={showPrivacy} 
        onClose={() => setShowPrivacy(false)} 
        title="Privacy Policy"
        onAccept={() => setAcceptedTerms(true)}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-green-600 mb-6">
            <ShieldCheck className="w-8 h-8" />
            <span className="text-sm font-bold uppercase tracking-wider">Data Protection</span>
          </div>
          <p>Strive respects your privacy. This Privacy Policy explains what information is collected, how it is used, and how your data is protected when using the application.</p>
          
          <h4 className="font-bold text-slate-900 mt-6">1. Information We Collect</h4>
          <p>Strive collects basic account information (name, email) and fitness profile details (age, height, weight, goals) to generate personalized workout and meal plans.</p>
          
          <h4 className="font-bold text-slate-900">2. How We Use Data</h4>
          <p>Your information is used only to improve your fitness experience inside the application. We use your profile to calculate optimal training volumes and nutritional needs.</p>
          
          <h4 className="font-bold text-slate-900">3. Protection</h4>
          <p>Private user information is securely stored and never shared with third parties. Admin access is strictly limited to general system analytics for service improvement.</p>
          
          <h4 className="font-bold text-slate-900">4. User Control</h4>
          <p>You have full control over your data. You can update your profile or delete your account at any time through the settings page.</p>
        </div>
      </Modal>
    </div>
  );
}
