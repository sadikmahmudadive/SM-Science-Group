"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { User, BookOpen, Settings, LogOut, Binary, Shield, Megaphone, Loader2 } from "lucide-react";
import { Suspense, useState, useEffect } from "react";
import { NotificationCenter } from "@/components/NotificationCenter";
import { useAuth } from "@/lib/auth-context";
import { getUserProfile } from "@/lib/users";

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, logout, loading: authLoading } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [, setLoadingProfile] = useState(true);

  // Load user profile data
  useEffect(() => {
    async function loadProfile() {
      if (!user?.uid) return;
      try {
        setLoadingProfile(true);
        const profile = await getUserProfile(user.uid);
        if (profile) {
          setUserProfile(profile);
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setLoadingProfile(false);
      }
    }

    loadProfile();
  }, [user?.uid]);

  // Refresh profile data every 5 seconds to catch updates from other tabs/sessions
  useEffect(() => {
    if (!user?.uid) return;

    const uid = user.uid;

    async function refreshProfile() {
      try {
        const profile = await getUserProfile(uid);
        if (profile) {
          setUserProfile(profile);
        }
      } catch (err) {
        console.error("Error refreshing profile:", err);
      }
    }

    const interval = setInterval(refreshProfile, 5000);

    return () => clearInterval(interval);
  }, [user?.uid]);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
      router.push("/annex/login");
    } catch (error) {
      console.error("Logout failed:", error);
      setLoggingOut(false);
    }
  };

  // Handle redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/annex/login");
    }
  }, [authLoading, user, router]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-2" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Return null while redirecting (the useEffect will handle the redirect)
  if (!user) {
    return null;
  }

  const displayName = userProfile?.displayName || user?.displayName || "Admin";
  const profilePhotoUrl = userProfile?.photoUrl || 
    (userProfile?.displayName 
      ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile.displayName}`
      : "https://picsum.photos/seed/user/100/100");

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
        <div className="h-20 flex items-center px-6 border-b border-slate-200">
          <Link href="/annex/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 text-white rounded-lg flex items-center justify-center font-bold text-sm shadow-sm">
              <Binary className="w-5 h-5" />
            </div>
            <span className="font-black text-emerald-900 tracking-tight text-xl italic">SM-ANNEX</span>
          </Link>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2">
          <Link href="/annex/dashboard" className="flex items-center gap-3 px-3 py-2 text-slate-700 hover:text-emerald-600 hover:bg-slate-50 rounded-lg transition-colors font-medium">
            <BookOpen className="w-5 h-5" /> Dashboard
          </Link>
          <Link href="/annex/dashboard/profile" className="flex items-center gap-3 px-3 py-2 text-slate-700 hover:text-emerald-600 hover:bg-slate-50 rounded-lg transition-colors font-medium">
            <User className="w-5 h-5" /> Profile
          </Link>

          <Link href="/annex/dashboard/users" className="flex items-center gap-3 px-3 py-2 text-slate-700 hover:text-emerald-600 hover:bg-slate-50 rounded-lg transition-colors font-medium">
            <Shield className="w-5 h-5" /> Manage Users
          </Link>

          <Link href="/annex/dashboard/announcements" className="flex items-center gap-3 px-3 py-2 text-slate-700 hover:text-emerald-600 hover:bg-slate-50 rounded-lg transition-colors font-medium">
            <Megaphone className="w-5 h-5" /> Announcements
          </Link>

          <Link href="#" className="flex items-center gap-3 px-3 py-2 text-slate-700 hover:text-emerald-600 hover:bg-slate-50 rounded-lg transition-colors font-medium">
            <Settings className="w-5 h-5" /> Settings
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-200">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loggingOut ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Signing out...
              </>
            ) : (
              <>
                <LogOut className="w-5 h-5" /> Sign Out
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>
          <div className="flex items-center gap-6">
            <NotificationCenter userId={user?.uid || ""} />
            <div className="h-8 w-px bg-slate-200 hidden sm:block" />
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900">{displayName}</p>
                <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold border-2 border-white shadow-sm overflow-hidden flex-shrink-0">
                 <Image src={profilePhotoUrl} alt="Avatar" width={40} height={40} className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-8 overflow-y-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </Suspense>
  );
}
