"use client";
 
import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Strive Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6 text-slate-900">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/90 shadow-xl shadow-slate-200/60 text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#ed4f28] shadow-sm">
            <BrandMark className="w-10 h-10" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Telemetry Interrupted</span>
          </div>
          <h1 className="text-2xl font-black text-slate-950 tracking-tight">
            Something went wrong
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            We encountered an unexpected issue rendering this view. Your saved fitness and workout data remains safe.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#ed4f28] hover:bg-[#d9421c] text-white font-bold text-xs shadow-md shadow-[#ed4f28]/25 transition-all active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
          <Link
            href="/dashboard"
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
