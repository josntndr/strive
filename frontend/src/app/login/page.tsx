"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, LogIn, Eye, EyeOff } from "lucide-react";
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
            ✨ AI-Powered Fitness Platform
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight tracking-tight">
            Fuel Your Ambition. <br />
            Track Your <span className="bg-gradient-to-r from-blue-400 to-amber-300 bg-clip-text text-transparent">Transformation.</span>
          </h1>
          <p className="text-slate-300 text-base leading-relaxed font-medium">
            Join thousands of dedicated members achieving personalized fitness goals, custom nutrition plans, and daily AI coaching.
          </p>

          <div className="flex items-center gap-6 pt-4">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-5 py-3 text-white">
              <p className="text-xl font-extrabold">10k+</p>
              <p className="text-xs text-slate-300 font-medium">Active Members</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-5 py-3 text-white">
              <p className="text-xl font-extrabold">100%</p>
              <p className="text-xs text-slate-300 font-medium">Personalized Plans</p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 font-medium">
          <p>&copy; 2026 Strive Fitness</p>
          <Link href="/" className="hover:text-white transition-colors">Back to Home &rarr;</Link>
        </div>
      </div>

      {/* 2nd Panel: Login Form */}
      <div className="flex flex-col justify-center py-12 px-6 sm:px-12 lg:px-16 bg-white">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile Brand Link */}
          <div className="lg:hidden mb-8">
            <Link href="/" className="inline-flex items-center space-x-2.5">
              <div className="bg-blue-600 p-2 rounded-xl text-white">
                <BrandMark className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight">Strive</span>
            </Link>
          </div>

          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome back</h2>
            <p className="mt-2 text-sm text-slate-600 font-medium">
              Don&apos;t have an account yet?{" "}
              <Link href="/register" className="font-bold text-blue-600 hover:text-blue-700 transition-colors">
                Sign up for free
              </Link>
            </p>
          </div>

          <div className="mt-8">
            <form className="space-y-6" onSubmit={onSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="block w-full px-4 py-3 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl shadow-xs placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 focus:bg-white transition-all text-sm font-medium"
                  placeholder="name@example.com"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-sm font-bold text-slate-700">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="block w-full px-4 py-3 pr-11 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl shadow-xs placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 focus:bg-white transition-all text-sm font-medium"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-full shadow-lg shadow-blue-500/25 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-500/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <span className="flex items-center gap-2">
                      Sign In
                      <LogIn className="w-4 h-4" />
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
