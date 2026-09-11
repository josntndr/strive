"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight, ShieldCheck, FileText, Eye, EyeOff, User, Mail, Lock, Sparkles } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { toast } from "react-hot-toast";
import { Modal } from "@/components/Modal";
import { postJson, saveAuth } from "@/lib/api";

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
            <div className="group-hover:scale-105 transition-transform flex items-center justify-center">
              <BrandMark className="h-10 w-10 drop-shadow-md" priority />
            </div>
            <span className="text-2xl font-black text-white tracking-tight">Strive</span>
          </Link>
        </div>

        {/* Center Quote & Badges */}
        <div className="relative z-10 max-w-lg my-auto space-y-5">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight tracking-tight">
            Build Strong Habits. <br />
            Achieve Your <span className="bg-gradient-to-r from-blue-400 via-coral to-amber-300 bg-clip-text text-transparent">Full Potential.</span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-medium">
            Create your account in seconds to receive custom workouts, smart meal plans, and intelligent progress tracking.
          </p>


        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 font-medium">
          <p>&copy; 2026 Strive Fitness</p>
          <Link href="/" className="hover:text-white transition-colors">Back to Home &rarr;</Link>
        </div>
      </div>

      {/* 2nd Panel: Clean Warm Form Container (No Grid Lines, No Scrollbar) */}
      <div className="relative flex flex-col justify-center items-center py-8 px-6 sm:px-12 lg:px-16 bg-gradient-to-br from-cream via-slate-50 to-orange-50/30 h-full max-h-screen overflow-hidden">
        {/* Ambient Glowing Orbs */}
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 left-10 w-48 h-48 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />

        <div className="my-auto mx-auto w-full max-w-md bg-white/95 backdrop-blur-2xl rounded-[2rem] border border-white shadow-xl shadow-slate-300/50 overflow-hidden relative z-10">

          <div className="p-6 sm:p-8">
            {/* Mobile Brand Header */}
            <div className="lg:hidden mb-4 flex items-center justify-between">
              <Link href="/" className="inline-flex items-center space-x-2">
                <div className="flex items-center justify-center">
                  <BrandMark className="h-8 w-8 drop-shadow-xs" />
                </div>
                <span className="text-xl font-black text-slate-900 tracking-tight">Strive</span>
              </Link>
            </div>

            {/* Auth Tab Switcher */}
            <div className="flex bg-slate-100/90 p-1 rounded-xl mb-5 border border-slate-200/60 text-xs font-bold">
              <Link
                href="/login"
                className="flex-1 py-2 rounded-lg text-slate-500 hover:text-slate-900 text-center transition-all"
              >
                Sign In
              </Link>
              <button
                type="button"
                className="flex-1 py-2 rounded-lg bg-white text-slate-900 shadow-xs text-center transition-all"
              >
                Create Account
              </button>
            </div>
            <div className="mb-4">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Start your transformation</h2>
              <p className="mt-0.5 text-xs text-slate-500 font-medium">
                Set up your profile to generate your first AI fitness plan.
              </p>
            </div>

            <form className="space-y-3" onSubmit={onSubmit}>
              <div>
                <label htmlFor="name" className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="h-3.5 w-3.5" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    autoComplete="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="block w-full pl-9 pr-3 py-2 bg-slate-50/90 text-slate-900 border border-slate-200/90 rounded-xl shadow-xs placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 focus:bg-white transition-all text-xs font-medium"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-3.5 w-3.5" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="block w-full pl-9 pr-3 py-2 bg-slate-50/90 text-slate-900 border border-slate-200/90 rounded-xl shadow-xs placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 focus:bg-white transition-all text-xs font-medium"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label htmlFor="password" className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="h-3.5 w-3.5" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="new-password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="block w-full pl-8 pr-8 py-2 bg-slate-50/90 text-slate-900 border border-slate-200/90 rounded-xl shadow-xs placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 focus:bg-white transition-all text-xs font-medium"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-blue-600 transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="h-3.5 w-3.5" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      autoComplete="new-password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="block w-full pl-8 pr-8 py-2 bg-slate-50/90 text-slate-900 border border-slate-200/90 rounded-xl shadow-xs placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 focus:bg-white transition-all text-xs font-medium"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-blue-600 transition-colors"
                      aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-start pt-0.5">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded-md cursor-pointer transition-colors"
                  />
                </div>
                <div className="ml-2.5 text-[11px]">
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

              <div className="pt-1">
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
                  className={`w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-full shadow-md text-xs sm:text-sm font-bold text-white transition-all active:scale-95 group ${
                    isFormValid 
                      ? "bg-blue-600 hover:bg-blue-700 shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/30" 
                      : "bg-blue-600/70 hover:bg-blue-600 shadow-blue-500/10"
                  }`}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span className="flex items-center gap-2">
                      Create Account
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
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
