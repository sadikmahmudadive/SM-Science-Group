"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { getUserProfile, UserProfile } from "@/lib/users";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { TeacherDashboard } from "@/components/dashboard/TeacherDashboard";
import { StudentDashboard } from "@/components/dashboard/StudentDashboard";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      if (!user?.uid) return;
      try {
        setLoading(true);
        const data = await getUserProfile(user.uid);
        setProfile(data);
      } catch (err) {
        console.error("Error loading dashboard profile:", err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [user?.uid]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="text-slate-500 font-medium">Preparing your workspace...</p>
      </div>
    );
  }

  // Render appropriate dashboard based on role
  switch (profile?.role) {
    case 'admin':
    case 'super-admin':
      return <AdminDashboard />;
    case 'teacher':
      return <TeacherDashboard profile={profile} />;
    case 'student':
      return <StudentDashboard profile={profile} />;
    default:
      return (
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-slate-800">Role Unassigned</h2>
          <p className="text-slate-500 mt-2">Please contact your administrator to assign a role to your account.</p>
        </div>
      );
  }
}
