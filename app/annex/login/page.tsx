"use client";

import { motion, useScroll, useTransform } from "motion/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Lock, Binary, Mail, AlertCircle, Loader2, Users, GraduationCap, Shield } from "lucide-react";
import { useState, useEffect, useRef, Suspense } from "react";
import { useAuth } from "@/lib/auth-context";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "admin";
  const { login, loading: authLoading, error: authError, user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const scale = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0.9, 1, 1, 0.9]);
  const opacity = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0.7, 1, 1, 0.7]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const roleInfo = {
    admin: { title: "Admin Console", icon: Shield, desc: "Secure access to SM-Annex admin portal" },
    teacher: { title: "Teacher Portal", icon: GraduationCap, desc: "Sign in to manage your classes and students" },
    student: { title: "Student Portal", icon: Users, desc: "Sign in to access your grades and materials" }
  }[role as "admin" | "teacher" | "student"] || { title: "Annex Login", icon: Binary, desc: "Secure access to SM-Annex" };

  const RoleIcon = roleInfo.icon;

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push("/annex/dashboard");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      router.push("/annex/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const displayError = error || authError;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Premium Background Mesh */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-200/50 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-200/50 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <motion.div 
        ref={containerRef}
        style={{ scale, opacity }}
        className="relative z-10 w-full"
      >
        <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
          <Link href="/annex">
            <motion.button 
              whileHover={{ x: -5 }}
              className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors mb-8 font-black text-[10px] uppercase tracking-widest"
            >
              <ArrowLeft className="w-4 h-4" /> Change role
            </motion.button>
          </Link>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-center mb-8"
          >
            <div className="w-20 h-20 bg-indigo-600 text-white rounded-[2rem] flex items-center justify-center shadow-2xl shadow-indigo-600/30 transform -rotate-6">
              <RoleIcon className="w-10 h-10" />
            </div>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center text-4xl font-black text-slate-900 font-display tracking-tight leading-none"
          >
            {roleInfo.title}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-3 text-center text-sm text-slate-500 font-medium"
          >
            {roleInfo.desc}
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-10 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
        >
          <div className="bg-white/80 backdrop-blur-xl py-10 px-6 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] sm:rounded-[3rem] sm:px-12 border border-white">
            {/* Error Alert */}
            {displayError && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-3 items-center"
              >
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-xs font-bold text-red-700 uppercase tracking-tight">{displayError}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label htmlFor="email" className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">
                  Email Registry
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    disabled={loading || authLoading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 block w-full pl-12 pr-4 sm:text-sm border-slate-100 rounded-2xl py-4 border bg-slate-50/50 transition-all hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed font-medium text-slate-900"
                    placeholder="name@university.edu"
                  />
                </div>
              </motion.div>

              {/* Password Input */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <label htmlFor="password" className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">
                  Secret Key
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    disabled={loading || authLoading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 block w-full pl-12 pr-12 sm:text-sm border-slate-100 rounded-2xl py-4 border bg-slate-50/50 transition-all hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed font-medium text-slate-900"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-300 hover:text-indigo-600 transition-colors"
                    tabIndex={-1}
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest">{showPassword ? "Hide" : "Show"}</span>
                  </button>
                </div>
              </motion.div>

              {/* Remember Me & Forgot Password */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center justify-between px-1"
              >
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    disabled={loading || authLoading}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-200 rounded cursor-pointer disabled:opacity-50"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-[10px] font-black text-slate-500 uppercase tracking-widest cursor-pointer">
                    Stay logged in
                  </label>
                </div>

                <div className="text-[10px] font-black uppercase tracking-widest">
                  <Link href="/annex/forgot-password" university-name="text-indigo-600 hover:text-indigo-500">
                    Forgot Key?
                  </Link>
                </div>
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 }}
              >
                <button
                  type="submit"
                  disabled={loading || authLoading}
                  className="w-full flex justify-center items-center gap-3 py-5 px-4 border border-transparent rounded-2xl shadow-xl shadow-indigo-200 text-xs font-black uppercase tracking-[0.2em] text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading || authLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    "Authorize Session"
                  )}
                </button>
              </motion.div>
              
              {/* Divider */}
              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-100" />
                  </div>
                  <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                    <span className="px-3 bg-white text-slate-400">Registry Support</span>
                  </div>
                </div>

                <div className="mt-8 text-center text-[10px] font-black uppercase tracking-widest">
                  <span className="text-slate-400">Need an account? </span>
                  <Link href="/annex/register" className="text-indigo-600 hover:text-indigo-500 underline decoration-indigo-200 underline-offset-4">
                    Register as {role === 'admin' ? 'Administrator' : role}
                  </Link>
                </div>
              </div>
            </form>

            {/* Info Box */}
            <div className="mt-10 p-5 bg-slate-50 rounded-[2rem] border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-100 rounded-full blur-2xl opacity-50" />
              <div className="relative z-10">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Shield className="w-3 h-3 text-indigo-600" /> Demo Credentials
                </p>
                <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-600 truncate">EMAIL: <span className="text-indigo-600">{role}@smsciencegroup.com</span></p>
                    <p className="text-[10px] font-bold text-slate-600 truncate">PASS: <span className="text-indigo-600">{role === 'admin' ? 'AdminPassword123!' : 'UserPassword123!'}</span></p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function AnnexLogin() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
