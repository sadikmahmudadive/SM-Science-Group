"use client";

import { useEffect, useState } from "react";
import { Users, UserCheck, Clock, Megaphone, TrendingUp } from "lucide-react";
import { Card3D } from "@/components/ui/Card3D";
import { getDashboardStats, DashboardStats } from "@/lib/stats";

export default function DashboardPage() {
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
    // Refresh stats every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-indigo-100 rounded-full animate-spin mx-auto flex items-center justify-center">
            <div className="w-6 h-6 bg-indigo-600 rounded-full" />
          </div>
          <p className="text-slate-500 font-medium">Aggregating campus data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-12 p-6 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-center font-medium">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 font-display">Administration Overview</h2>
          <p className="text-slate-500 mt-1">Real-time status of SM-Annex registry and communications.</p>
        </div>
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-slate-200">
          Live System Data
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Users Card */}
        <Card3D className="bg-white p-6 flex items-start gap-4 border border-slate-200 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Total Registry</p>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-3xl font-bold text-slate-900">{stats?.totalUsers || 0}</p>
              <span className="text-xs font-bold text-slate-400">Users</span>
            </div>
          </div>
        </Card3D>

        {/* Active Users Card */}
        <Card3D className="bg-white p-6 flex items-start gap-4 border border-slate-200 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Active Accounts</p>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-3xl font-bold text-slate-900">{stats?.activeUsers || 0}</p>
              <span className="text-xs font-bold text-emerald-600">Verified</span>
            </div>
          </div>
        </Card3D>

        {/* Pending Approvals Card */}
        <Card3D className="bg-white p-6 flex items-start gap-4 border border-slate-200 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Pending Access</p>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-3xl font-bold text-slate-900">{stats?.pendingUsers || 0}</p>
              <span className="text-xs font-bold text-amber-600">Awaiting Reg</span>
            </div>
          </div>
        </Card3D>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Distribution Card */}
        <Card3D className="bg-white p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 uppercase tracking-tight">User Distribution</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50">
              <span className="text-sm font-medium text-slate-600">Teachers</span>
              <span className="font-bold text-slate-900">{stats?.teacherCount || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50">
              <span className="text-sm font-medium text-slate-600">Students</span>
              <span className="font-bold text-slate-900">{stats?.studentCount || 0}</span>
            </div>
          </div>
        </Card3D>

        {/* Communications Card */}
        <Card3D className="bg-white p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Megaphone className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 uppercase tracking-tight">Campus Broadcasts</h3>
          </div>
          <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
            <div>
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Total Announcements</p>
              <p className="text-3xl font-black text-indigo-900 mt-1">{stats?.totalAnnouncements || 0}</p>
            </div>
            <div className="p-3 bg-white rounded-xl shadow-sm text-indigo-600">
              <Megaphone className="w-6 h-6" />
            </div>
          </div>
        </Card3D>
      </div>
    </div>
  );
}
