"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Utensils, Sparkles } from "lucide-react";
import { toast } from "react-hot-toast";
import { api, getToken } from "@/lib/api";

export default function GenerateMealPage() {
  const router = useRouter();

  useEffect(() => {
    const generate = async () => {
      if (!getToken()) {
        toast.error("Please log in first.");
        router.push("/login");
        return;
      }

      try {
        await api.post("/api/meals/generate");
        toast.success("Meal plan generated!");
        router.push("/meals");
      } catch {
        toast.error("Failed to generate plan");
        router.push("/dashboard");
      }
    };

    generate();
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="relative inline-block mb-8">
          <div className="bg-green-600 p-4 rounded-2xl relative z-10 animate-bounce">
            <Utensils className="h-10 w-10 text-white" />
          </div>
          <div className="absolute inset-0 bg-green-100 rounded-2xl blur-xl animate-pulse -z-0 scale-150" />
          <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-pulse" />
        </div>
        
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Crafting Your Menu</h1>
        <p className="text-slate-600 mb-8 leading-relaxed">
          We&apos;re selecting the best nutritious and budget-friendly meals to support your transformation.
        </p>
        
        <div className="flex items-center justify-center gap-3 text-green-600 font-bold">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Balanced nutrition coming up...</span>
        </div>
      </div>
    </div>
  );
}
