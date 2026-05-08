"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { 
  User, 
  BookOpen, 
  Settings, 
  LogOut, 
  Binary, 
  Shield, 
  Megaphone, 
  Loader2, 
  Layout, 
  Users, 
  ClipboardCheck, 
  GraduationCap, 
  Calendar,
  FileText,
  Library
} from "lucide-react";
import { Suspense, useState, useEffect } from "react";
import { NotificationCenter } from "@/components/NotificationCenter";
import { useAuth } from "@/lib/auth-context";
import { getUserProfile, UserProfile } from "@/lib/users";

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, loading: authLoading } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

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

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/annex/login");
    }
  }, [authLoading, user, router]);

  if (authLoading || (user && loadingProfile)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-2" />
          <p className="text-slate-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const displayName = userProfile?.displayName || user?.displayName || "User";
  const role = userProfile?.role || 'admin';
  const profilePhotoUrl = userProfile?.photoUrl || 
    (displayName 
      ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`
      : "https://picsum.photos/seed/user/100/100");

  // Navigation configurations based on role
  const navItems = {
    admin: [
      { label: "Overview", icon: Layout, href: "/annex/dashboard" },
      { label: "Manage Users", icon: Shield, href: "/annex/dashboard/users" },
      { label: "Announcements", icon: Megaphone, href: "/annex/dashboard/announcements" },
      { label: "Global Settings", icon: Settings, href: "/annex/dashboard/settings" },
    ],
    teacher: [
      { label: "Dashboard", icon: Layout, href: "/annex/dashboard" },
      { label: "My Classes", icon: BookOpen, href: "/annex/dashboard/classes" },
      { label: "Attendance", icon: Users, href: "/annex/dashboard/attendance" },
      { label: "Grading", icon: ClipboardCheck, href: "/annex/dashboard/grading" },
      { label: "Resources", icon: FileText, href: "/annex/dashboard/resources" },
    ],
    student: [
      { label: "Dashboard", icon: Layout, href: "/annex/dashboard" },
      { label: "My Grades", icon: GraduationCap, href: "/annex/dashboard/grades" },
      { label: "Assignments", icon: FileText, href: "/annex/dashboard/assignments" },
      { label: "Attendance", icon: Calendar, href: "/annex/dashboard/my-attendance" },
      { label: "Library", icon: Library, href: "/annex/dashboard/library" },
    ]
  }[role as 'admin' | 'teacher' | 'student'] || [];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="h-20 flex items-center px-6 border-b border-slate-200">
          <Link href="/annex/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-bold text-sm shadow-sm">
              <Binary className="w-5 h-5" />
            </div>
            <span className="font-black text-indigo-900 tracking-tight text-xl italic">SM-ANNEX</span>
          </Link>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-1">
          {navItems.map((item) => (
            <Link 
              key={item.label} 
              href={item.href} 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium ${
                pathname === item.href 
                  ? "bg-indigo-50 text-indigo-700" 
                  : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
              }`}
            >
              <item.icon className={`w-5 h-5 ${pathname === item.href ? "text-indigo-600" : "text-slate-400 group-hover:text-indigo-600"}`} /> 
              {item.label}
            </Link>
          ))}
          
          <div className="pt-4 pb-2 px-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Account</p>
          </div>
          
          <Link href="/annex/dashboard/profile" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium ${pathname === '/annex/dashboard/profile' ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"}`}>
            <User className="w-5 h-5 text-slate-400" /> My Profile
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-200">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium disabled:opacity-50"
          >
            {loggingOut ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogOut className="w-5 h-5" />}
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-slate-800 capitalize">
              {pathname === '/annex/dashboard' ? `${role} Dashboard` : pathname.split('/').pop()?.replace('-', ' ')}
            </h1>
          </div>
          
          <div className="flex items-center gap-6">
            <NotificationCenter userId={user?.uid || ""} />
            <div className="h-8 w-px bg-slate-200 hidden sm:block" />
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900">{displayName}</p>
                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">{role}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border-2 border-white shadow-sm overflow-hidden flex-shrink-0">
                 <Image src={profilePhotoUrl} alt="Avatar" width={40} height={40} className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>}>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </Suspense>
  );
}
