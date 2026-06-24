"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { AIChat } from "@/components/ai/AIChat";
import {
  LineChart,
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { 
  TrendingUp, 
  Scale, 
  Activity, 
  History, 
  Plus,
  Loader2,
  Calendar
} from "lucide-react";
import { toast } from "react-hot-toast";
import { api, getApiErrorMessage, getToken } from "@/lib/api";

type ProgressRecord = {
  id: string;
  date: string;
  weight?: number;
  waist?: number;
  hips?: number;
  notes?: string;
};

export default function ProgressPage() {
  const [records, setRecords] = useState<ProgressRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    weight: "",
    waist: "",
    hips: "",
    notes: ""
  });

  const fetchRecords = async () => {
    if (!getToken()) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.get<ProgressRecord[]>("/api/progress");
      setRecords(res.data);
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Failed to load progress records"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchRecords();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/api/progress", formData);
      toast.success("Progress logged!");
      setFormData({ weight: "", waist: "", hips: "", notes: "" });
      await fetchRecords();
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Failed to log progress"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const chartData = [...records].reverse().map(r => ({
    date: new Date(r.date).toLocaleDateString(),
    weight: r.weight
  }));

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <AIChat />

      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900">Your Progress</h1>
          <p className="text-slate-600 mt-1">Visualize your transformation and stay motivated.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Stats and Charts */}
          <div className="lg:col-span-2 space-y-8">
            {/* Chart */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <h2 className="font-bold text-slate-900">Weight Trend</h2>
                </div>
                <select className="bg-slate-50 border-none text-sm font-semibold text-slate-600 rounded-lg px-3 py-1.5 focus:ring-0">
                  <option>Last 30 Days</option>
                  <option>Last 3 Months</option>
                </select>
              </div>
              
              <div className="h-[300px] w-full">
                {records.length > 1 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="weight" 
                        stroke="#2563eb" 
                        strokeWidth={3} 
                        dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }} 
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500">
                    <History className="w-12 h-12 mb-4 opacity-30" />
                    <p>Not enough data points to show trend</p>
                  </div>
                )}
              </div>
            </div>

            {/* Records List */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex items-center gap-3">
                <div className="p-2 bg-slate-50 rounded-lg text-slate-600">
                  <History className="w-5 h-5" />
                </div>
                <h2 className="font-bold text-slate-900">History</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Weight</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Waist</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Hips</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider text-right">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {records.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-500" />
                            <span className="text-sm font-medium text-slate-900">{new Date(r.date).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-900">{r.weight ? `${r.weight} kg` : "-"}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{r.waist ? `${r.waist} cm` : "-"}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{r.hips ? `${r.hips} cm` : "-"}</td>
                        <td className="px-6 py-4 text-sm text-slate-500 text-right italic">{r.notes || "-"}</td>
                      </tr>
                    ))}
                    {records.length === 0 && !isLoading && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500">No records yet. Start logging!</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right: Log Form */}
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-blue-600 rounded-lg text-white">
                  <Plus className="w-5 h-5" />
                </div>
                <h2 className="font-bold text-slate-900">Log Progress</h2>
              </div>
              
              <form onSubmit={onSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Scale className="w-4 h-4 text-slate-500" />
                    Current Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full px-4 py-3 bg-white text-slate-900 placeholder-slate-500 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="e.g. 72.5"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-slate-500" />
                      Waist (cm)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.waist}
                      onChange={(e) => setFormData({ ...formData, waist: e.target.value })}
                      className="w-full px-4 py-3 bg-white text-slate-900 placeholder-slate-500 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-slate-500" />
                      Hips (cm)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.hips}
                      onChange={(e) => setFormData({ ...formData, hips: e.target.value })}
                      className="w-full px-4 py-3 bg-white text-slate-900 placeholder-slate-500 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-3 bg-white text-slate-900 placeholder-slate-500 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="How do you feel today?"
                    rows={4}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    "Record Progress"
                  )}
                </button>
              </form>
            </div>

            {/* Tip Box */}
            <div className="bg-slate-900 rounded-3xl p-8 text-white">
              <h4 className="font-bold mb-4 text-white">Pro Tip</h4>
              <p className="text-slate-200 text-sm leading-relaxed">
                Consistency is more important than the number on the scale. Try to log your progress at the same time each day (preferably in the morning) for the most accurate results.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
