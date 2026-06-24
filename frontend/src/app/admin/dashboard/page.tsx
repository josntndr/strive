"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { 
  Users, 
  Dumbbell, 
  Utensils, 
  BarChart3,
  Loader2,
  ShieldCheck,
  TrendingUp
} from "lucide-react";
import { toast } from "react-hot-toast";
import { api } from "@/lib/api";

type GoalStat = {
  goal: string;
  count?: number;
  _count?: { goal: number };
};

type AdminStats = {
  totalUsers: number;
  totalWorkoutPlans: number;
  totalMealPlans: number;
  goalStats: GoalStat[];
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/api/admin/analytics");
        setStats(res.data);
      } catch {
        toast.error("Failed to load admin stats");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-blue-600 font-bold text-sm uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4" />
              Admin Portal
            </div>
            <h1 className="text-3xl font-bold text-slate-900">System Analytics</h1>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {[
            { label: "Total Users", value: stats?.totalUsers || 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Workout Plans", value: stats?.totalWorkoutPlans || 0, icon: Dumbbell, color: "text-green-600", bg: "bg-green-50" },
            { label: "Meal Plans", value: stats?.totalMealPlans || 0, icon: Utensils, color: "text-orange-600", bg: "bg-orange-50" },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6">
                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                  <stat.icon className="w-8 h-8" />
                </div>
                <div>
                <p className="text-sm text-slate-600 font-bold mb-1 uppercase tracking-tight">{stat.label}</p>
                <p className="text-3xl font-extrabold text-slate-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Goal Distribution */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
              <div className="flex items-center gap-3 mb-8">
              <BarChart3 className="w-6 h-6 text-slate-500" />
              <h2 className="font-bold text-slate-900 text-lg">Fitness Goals Distribution</h2>
            </div>
            <div className="space-y-6">
              {stats?.goalStats?.map((goal, idx) => (
                <div key={idx}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-bold text-slate-700">{goal.goal}</span>
                    <span className="text-sm font-bold text-blue-600">{goal._count?.goal || goal.count || 0} users</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full rounded-full transition-all duration-1000" 
                      style={{ width: `${(((goal._count?.goal || goal.count || 0) / stats.totalUsers) * 100) || 0}%` }}
                    />
                  </div>
                </div>
              ))}
              {(!stats?.goalStats || stats.goalStats.length === 0) && (
                <p className="text-center text-slate-500 py-8">No profile data available yet.</p>
              )}
            </div>
          </div>

          {/* System Activity */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
            <div className="flex items-center gap-3 mb-8">
              <TrendingUp className="w-6 h-6 text-slate-500" />
              <h2 className="font-bold text-slate-900 text-lg">System Health</h2>
            </div>
            <div className="p-12 text-center border-2 border-dashed border-slate-100 rounded-2xl">
              <ShieldCheck className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-600 font-medium">All systems operational.</p>
              <p className="text-slate-500 text-xs mt-2 italic">Activity logs are being securely processed.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
