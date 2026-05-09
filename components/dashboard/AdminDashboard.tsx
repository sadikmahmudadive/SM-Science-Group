"use client";

import { useEffect, useState } from "react";
import { Users, UserCheck, Clock, Megaphone, TrendingUp } from "lucide-react";
import { Card3D } from "@/components/ui/Card3D";
import { getDashboardStats, DashboardStats } from "@/lib/stats";

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const data = await getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to load stats:", err);
        setError("Failed to load dashboard statistics");
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-indigo-50 rounded-full animate-pulse mx-auto flex items-center justify-center">
            <div className="w-8 h-8 bg-indigo-600 rounded-full animate-bounce" />
          </div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Synchronizing campus metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 relative">
      {/* Background Blobs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100 rounded-full blur-[100px] opacity-40 -z-10" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-100 rounded-full blur-[100px] opacity-40 -z-10" />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-indigo-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter mb-4 shadow-lg shadow-indigo-200">
            System Administrator
          </div>
          <h2 className="text-4xl font-black text-slate-900 font-display tracking-tight leading-none">Administration <span className="text-indigo-600">Overview</span></h2>
          <p className="text-slate-500 mt-2 font-medium">Real-time status of SM-Annex registry and campus communications.</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="text-xs font-black text-indigo-600 uppercase tracking-widest bg-white/70 backdrop-blur-md px-4 py-2 rounded-xl border border-indigo-100 shadow-sm">
              Live System Status: <span className="text-emerald-500">Active</span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card3D className="bg-white/80 backdrop-blur-md p-8 flex items-start gap-5 border border-white shadow-xl shadow-slate-200/40 rounded-[2.5rem] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity -mr-10 -mt-10" />
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-200 relative z-10">
            <Users className="w-7 h-7" />
          </div>
          <div className="flex-1 relative z-10">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Total Registry</p>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black text-slate-900 tracking-tighter">{stats?.totalUsers || 0}</p>
              <span className="text-xs font-bold text-slate-400 uppercase">Accounts</span>
            </div>
          </div>
        </Card3D>

        <Card3D className="bg-white/80 backdrop-blur-md p-8 flex items-start gap-5 border border-white shadow-xl shadow-slate-200/40 rounded-[2.5rem] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity -mr-10 -mt-10" />
          <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-100 relative z-10">
            <UserCheck className="w-7 h-7" />
          </div>
          <div className="flex-1 relative z-10">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Active Now</p>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black text-slate-900 tracking-tighter">{stats?.activeUsers || 0}</p>
              <span className="text-xs font-bold text-emerald-600 uppercase">Verified</span>
            </div>
          </div>
        </Card3D>

        <Card3D className="bg-white/80 backdrop-blur-md p-8 flex items-start gap-5 border border-white shadow-xl shadow-slate-200/40 rounded-[2.5rem] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity -mr-10 -mt-10" />
          <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-100 relative z-10">
            <Clock className="w-7 h-7" />
          </div>
          <div className="flex-1 relative z-10">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Queue</p>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black text-slate-900 tracking-tighter">{stats?.pendingUsers || 0}</p>
              <span className="text-xs font-bold text-amber-600 uppercase">Pending</span>
            </div>
          </div>
        </Card3D>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card3D className="bg-white/70 backdrop-blur-md p-10 border border-white shadow-xl shadow-slate-200/40 rounded-[3rem]">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-200">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-900 font-display tracking-tight uppercase">User Distribution</h3>
            </div>
            <div className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">Analytics</div>
          </div>
          
          <div className="space-y-6">
            <div className="relative">
                <div className="flex justify-between items-center mb-2 px-1">
                    <span className="text-sm font-black text-slate-600 uppercase tracking-widest">Teachers</span>
                    <span className="text-lg font-black text-slate-900">{stats?.teacherCount || 0}</span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${((stats?.teacherCount || 0) / (stats?.totalUsers || 1)) * 100}%` }} />
                </div>
            </div>
            
            <div className="relative">
                <div className="flex justify-between items-center mb-2 px-1">
                    <span className="text-sm font-black text-slate-600 uppercase tracking-widest">Students</span>
                    <span className="text-lg font-black text-slate-900">{stats?.studentCount || 0}</span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${((stats?.studentCount || 0) / (stats?.totalUsers || 1)) * 100}%` }} />
                </div>
            </div>
          </div>
        </Card3D>

        <Card3D className="bg-indigo-600 p-10 border-indigo-500 shadow-2xl shadow-indigo-200 rounded-[3rem] relative overflow-hidden text-white group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] pointer-events-none -mr-20 -mt-20" />
          
          <div className="flex items-center justify-between mb-10 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center shadow-inner">
                <Megaphone className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black font-display tracking-tight uppercase">Campus Broadcasts</h3>
            </div>
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-[10px] font-black uppercase tracking-widest">Live Feed</span>
          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 flex items-center justify-between relative z-10">
            <div>
              <p className="text-[10px] font-black text-indigo-100 uppercase tracking-[0.2em] mb-2">Total Announcements</p>
              <p className="text-6xl font-black text-white tracking-tighter">{stats?.totalAnnouncements || 0}</p>
            </div>
            <div className="w-16 h-16 bg-white rounded-[2rem] flex items-center justify-center text-indigo-600 shadow-2xl transform rotate-12 group-hover:rotate-0 transition-transform duration-500">
              <Megaphone className="w-8 h-8" />
            </div>
          </div>
          
          <button className="mt-8 w-full py-4 bg-white text-indigo-600 font-black rounded-2xl shadow-xl hover:bg-indigo-50 transition-colors relative z-10 uppercase tracking-widest text-sm">
            Manage Broadcasts
          </button>
        </Card3D>
      </div>
    </div>
  );
}
