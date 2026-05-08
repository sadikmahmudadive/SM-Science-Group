"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { BookOpen, GraduationCap, Users, Award } from "lucide-react";
import { usePathname } from "next/navigation";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Hide header on annex portal pages
  if (pathname.startsWith("/annex")) return null;

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled 
          ? "bg-white/90 backdrop-blur-xl shadow-lg shadow-slate-200/50" 
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center gap-3 group">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center transform group-hover:rotate-6 transition-all shadow-lg ${scrolled ? "bg-indigo-600 text-white shadow-indigo-200" : "bg-white/15 text-white backdrop-blur-sm border border-white/20 shadow-black/10"}`}>
              <span className="font-bold text-xl">SM</span>
            </div>
            <span className={`text-2xl font-extrabold tracking-tight transition-colors duration-500 ${scrolled ? "text-slate-800" : "text-white"}`}>Science Group</span>
          </Link>

          <nav className="hidden md:flex space-x-8">
            <Link href="#scholars" className={`text-sm font-semibold uppercase tracking-widest transition-colors flex items-center gap-2 ${scrolled ? "text-slate-600 hover:text-indigo-600" : "text-white/70 hover:text-white"}`}>
              <BookOpen className="w-4 h-4" /> Scholars
            </Link>
            <Link href="#academy" className={`text-sm font-semibold uppercase tracking-widest transition-colors flex items-center gap-2 ${scrolled ? "text-slate-600 hover:text-indigo-600" : "text-white/70 hover:text-white"}`}>
              <GraduationCap className="w-4 h-4" /> Academy
            </Link>
            <Link href="/teachers" className={`text-sm font-semibold uppercase tracking-widest transition-colors flex items-center gap-2 ${scrolled ? "text-slate-600 hover:text-indigo-600" : "text-white/70 hover:text-white"}`}>
              <Award className="w-4 h-4" /> Teachers
            </Link>
            <Link href="#annex" className={`text-sm font-semibold uppercase tracking-widest transition-colors flex items-center gap-2 ${scrolled ? "text-slate-600 hover:text-indigo-600" : "text-white/70 hover:text-white"}`}>
              <Users className="w-4 h-4" /> Annex Portal
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Link href="/annex/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-5 py-2.5 text-sm font-bold rounded-full transition-all ${scrolled ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700" : "bg-white/15 text-white backdrop-blur-sm border border-white/25 hover:bg-white/25 shadow-lg shadow-black/10"}`}
              >
                SM-ANNEX PORTAL
              </motion.button>
            </Link>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
