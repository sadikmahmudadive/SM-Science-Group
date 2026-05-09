"use client";

import { motion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useState, useRef } from "react";
import { BookOpen, GraduationCap, ArrowRight, Sparkles, Binary, UserCircle2, ChevronDown } from "lucide-react";
import { Card3D } from "@/components/ui/Card3D";
import { VantaGlobe } from "@/components/ui/VantaGlobe";
import { useEffect } from "react";
import { getFeaturedTeachers, PublicTeacherProfile } from "@/lib/dashboard-data";

const STAGGER_CHILD_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};


export default function HomePage() {
  const heroRef = useRef<HTMLElement>(null);
  const servicesRef = useRef<HTMLElement>(null);
  const teachersRef = useRef<HTMLElement>(null);
  const annexRef = useRef<HTMLElement>(null);

  // Hero Scroll Transforms
  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const heroOpacity = useTransform(heroScrollProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(heroScrollProgress, [0, 0.5], [1, 0.85]);
  const heroY = useTransform(heroScrollProgress, [0, 0.5], ["0%", "15%"]);

  // Services Scroll Transforms
  const { scrollYProgress: servicesScrollProgress } = useScroll({
    target: servicesRef,
    offset: ["start end", "end start"]
  });
  const servicesScale = useTransform(servicesScrollProgress, [0, 0.2, 0.8, 1], [0.9, 1, 1, 0.9]);
  const servicesOpacity = useTransform(servicesScrollProgress, [0, 0.2, 0.8, 1], [0.5, 1, 1, 0.5]);

  // Teachers Scroll Transforms
  const { scrollYProgress: teachersScrollProgress } = useScroll({
    target: teachersRef,
    offset: ["start end", "end start"]
  });
  const teachersScale = useTransform(teachersScrollProgress, [0, 0.2, 0.8, 1], [0.9, 1, 1, 0.9]);
  const teachersY = useTransform(teachersScrollProgress, [0, 0.2, 0.8, 1], [100, 0, 0, -100]);

  // Annex Scroll Transforms
  const { scrollYProgress: annexScrollProgress } = useScroll({
    target: annexRef,
    offset: ["start end", "end start"]
  });
  const annexScale = useTransform(annexScrollProgress, [0, 0.3, 0.7, 1], [0.8, 1, 1, 0.8]);

  const { scrollYProgress } = useScroll();
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const [featuredTeachers, setFeaturedTeachers] = useState<PublicTeacherProfile[]>([]);

  useEffect(() => {
    async function loadTeachers() {
      const data = await getFeaturedTeachers();
      setFeaturedTeachers(data);
    }
    loadTeachers();
  }, []);

  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* Hero Section — Full-screen with Vanta Globe & Scroll Interaction */}
      <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden bg-[#020617]">
        {/* Animated Vanta Globe Background */}
        <VantaGlobe />

        {/* Radial overlay for depth */}
        <div className="absolute inset-0 z-[1] pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(2,6,23,0.4)_70%,rgba(2,6,23,0.85)_100%)]" />

        {/* Floating elements for depth */}
        <motion.div 
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 10, 0]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] left-[15%] w-12 h-12 bg-indigo-500/20 backdrop-blur-xl border border-indigo-400/30 rounded-2xl z-10 hidden lg:block" 
        />
        <motion.div 
          animate={{ 
            y: [0, 20, 0],
            rotate: [0, -10, 0]
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[20%] right-[15%] w-16 h-16 bg-blue-500/20 backdrop-blur-xl border border-blue-400/30 rounded-full z-10 hidden lg:block" 
        />

        {/* Scroll-driven hero content */}
        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
          className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-6"
        >
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.2, delayChildren: 0.3 }
              }
            }}
            className="flex flex-col items-center text-center space-y-8"
          >
            <motion.div variants={STAGGER_CHILD_VARIANTS} className="inline-flex items-center rounded-full border border-indigo-400/30 bg-indigo-500/10 backdrop-blur-sm px-5 py-2 text-sm font-bold text-indigo-300 mb-2 shadow-lg shadow-indigo-500/5">
              <Sparkles className="mr-2 h-4 w-4 text-indigo-400" />
              Empowering the Next Generation
            </motion.div>

            <motion.h1
              variants={STAGGER_CHILD_VARIANTS}
              className="text-5xl md:text-8xl lg:text-9xl font-black tracking-tighter text-white font-display leading-[0.9] text-glow"
            >
              SM SCIENCE <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400">
                GROUP
              </span>
            </motion.h1>

            <motion.p
              variants={STAGGER_CHILD_VARIANTS}
              className="max-w-[700px] text-lg md:text-xl text-slate-300/80 leading-relaxed font-medium"
            >
              Excellence from foundation to mastery. Discover our school programs, dedicated coaching, and state-of-the-art smart learning portal.
            </motion.p>

            <motion.div variants={STAGGER_CHILD_VARIANTS} className="flex flex-col sm:flex-row gap-6 pt-4">
              <Link href="#services">
                <motion.button
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-indigo-600 text-white px-10 py-5 rounded-2xl font-bold shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 w-full sm:w-auto hover:bg-indigo-500 transition-all"
                >
                  Explore Scholars <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
              <Link href="/annex/login">
                <motion.button
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white/5 text-white border border-white/10 backdrop-blur-md px-10 py-5 rounded-2xl font-bold shadow-sm hover:bg-white/10 transition-all flex items-center justify-center gap-3 w-full sm:w-auto"
                >
                  Student Portal
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        >
          <span className="text-xs uppercase tracking-[0.3em] text-slate-400 font-medium">Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="w-5 h-5 text-slate-400" />
          </motion.div>
        </motion.div>
      </section>

      {/* Services Section */}
      <section ref={servicesRef} className="py-32 bg-white relative z-10 overflow-hidden" id="services">
        {/* Modern grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

        <motion.div 
          style={{ scale: servicesScale, opacity: servicesOpacity }}
          className="container px-4 md:px-6 mx-auto w-full max-w-7xl relative z-10"
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center rounded-full bg-indigo-50 px-4 py-1.5 text-xs font-bold text-indigo-600 mb-4 uppercase tracking-widest border border-indigo-100">
              Our Infrastructure
            </div>
            <h2 className="text-4xl md:text-6xl font-bold font-display text-slate-900 mb-6 tracking-tight">The Educational <span className="text-indigo-600">Ecosystem</span></h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg">Comprehensive educational infrastructure tailored for modern learning.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-12 md:grid-rows-6 gap-6 min-h-[800px]">
            {/* Scholars Card */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="md:col-span-7 md:row-span-3"
            >
              <Card3D className="h-full bg-slate-50 border border-slate-100 p-8 flex flex-col justify-between shadow-none group">
                <div className="flex flex-col h-full z-10 relative">
                  <div className="absolute top-0 right-0">
                    <div className="px-4 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-full">KG - CLASS 8</div>
                  </div>
                  <div className="w-14 h-14 bg-slate-100 text-slate-900 rounded-2xl flex items-center justify-center mb-6">
                    <BookOpen className="w-7 h-7" />
                  </div>
                  <h3 className="text-3xl lg:text-4xl font-bold font-display mb-4 text-slate-900">SM Scholars</h3>
                  <p className="text-slate-600 text-lg mb-6 flex-grow max-w-md leading-relaxed">
                    Premier school service nurturing young minds from KG to Class 8 with an innovative curriculum.
                  </p>
                  <Link href="#scholars" className="text-slate-900 font-medium flex items-center gap-2 group mt-auto w-fit">
                    Learn more <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </Card3D>
            </motion.div>

            {/* Academy Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="md:col-span-5 md:row-span-6"
            >
              <Card3D className="h-full bg-slate-50 border border-slate-100 p-8 flex flex-col shadow-none">
                <div className="absolute -right-16 -top-16 w-64 h-64 bg-slate-100 rounded-full blur-3xl opacity-50 pointer-events-none" />
                <div className="flex flex-col h-full z-10 relative">
                  <div className="w-14 h-14 bg-slate-100 text-slate-900 rounded-2xl flex items-center justify-center mb-6">
                    <GraduationCap className="w-7 h-7" />
                  </div>
                  <h3 className="text-3xl font-bold font-display mb-4 text-slate-900">SM Science Academy</h3>
                  <p className="text-slate-600 text-base leading-relaxed mb-8 flex-grow">
                    Advanced coaching service designed to prepare students for competitive excellence and deep conceptual understanding.
                  </p>
                  <Link href="#academy" className="mt-auto w-full py-4 bg-slate-900 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors">
                    Learn more <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </Card3D>
            </motion.div>

            {/* Annex Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="md:col-span-7 md:row-span-3"
            >
              <Card3D className="h-full bg-indigo-600 border-indigo-500 p-8 shadow-2xl flex flex-col relative overflow-hidden">
                {/* Decorative glow */}
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/20 rounded-full blur-[80px] pointer-events-none" />
                
                <div className="flex flex-col h-full z-10 relative">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 bg-white/20 text-white rounded-2xl flex items-center justify-center shadow-sm backdrop-blur-md border border-white/30">
                      <Binary className="w-7 h-7" />
                    </div>
                    <span className="text-[10px] px-3 py-1 bg-white/20 text-white font-black rounded-full uppercase border border-white/30 backdrop-blur-md">Smart Portal</span>
                  </div>
                  <h3 className="text-3xl font-bold font-display mb-3 text-white">SM-Annex Portal</h3>
                  <p className="text-indigo-100 mb-6 flex-grow leading-relaxed max-w-md">
                    The ultimate smart portal for real-time tracking, automated grading, and seamless institutional communication.
                  </p>
                  <Link href="/annex/login" className="text-indigo-600 font-bold flex items-center gap-2 group hover:gap-3 transition-all bg-white hover:bg-indigo-50 px-8 py-4 rounded-xl w-fit shadow-xl">
                    Access System <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </Card3D>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Teachers Section */}
      <section ref={teachersRef} className="py-32 bg-white relative z-10 overflow-hidden" id="teachers">
        <motion.div 
          style={{ scale: teachersScale, y: teachersY }}
          className="container px-4 md:px-6 mx-auto w-full max-w-7xl"
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-600 mb-6 shadow-sm">
              <UserCircle2 className="mr-2 h-4 w-4" />
              Expert Mentorship
            </div>
            <h2 className="text-3xl md:text-5xl font-bold font-display text-slate-900 mb-4">Elite Faculty</h2>
            <p className="text-slate-600 max-w-2xl mx-auto mb-10">Our most experienced and distinguished educators leading both school and academy programs.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {featuredTeachers.map((teacher, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                key={teacher.id}
                className="group"
              >
                <Card3D className="bg-white rounded-[2rem] p-4 border border-slate-100 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-100 group">
                    <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden mb-5 bg-slate-100">
                    <Image
                      src={teacher.image || "https://picsum.photos/seed/teacher/400/600"}
                      alt={teacher.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 20vw"
                    />
                    <div className="absolute top-3 left-3">
                        <span className="text-[8px] font-black uppercase tracking-widest bg-white/90 backdrop-blur-sm text-indigo-600 px-2 py-1 rounded-md border border-white shadow-sm">
                            {teacher.category === 'school' ? 'Scholars' : 'Academy'}
                        </span>
                    </div>
                  </div>
                  <div className="px-1 pb-1 text-center">
                    <p className="text-indigo-600 font-black text-[9px] uppercase tracking-[0.2em] mb-2">{teacher.subject}</p>
                    <h3 className="text-lg font-bold text-slate-900 font-display mb-1 group-hover:text-indigo-600 transition-colors truncate px-2">{teacher.name}</h3>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{teacher.role}</p>
                    <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{teacher.experience} Experience</span>
                    </div>
                  </div>
                </Card3D>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <Link href="/teachers">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all"
                >
                    View All Faculty <ArrowRight className="w-4 h-4" />
                </motion.button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Interactive Annex Teaser Section */}
      <section ref={annexRef} className="py-32 bg-slate-50 overflow-hidden relative" id="annex">
        <motion.div 
          style={{ scale: annexScale }}
          className="container px-4 md:px-6 mx-auto w-full max-w-7xl relative z-10"
        >
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="flex-1 space-y-8"
            >
              <h2 className="text-4xl md:text-5xl font-bold font-display text-slate-900">
                Data-Driven <br/><span className="text-indigo-600">Learning Insights</span>
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                The SM-Annex portal connects teachers, students, and parents. Powered by advanced analytics, it provides an authentic, transparent view of academic progress and potential.
              </p>
              
              <ul className="space-y-4">
                {["Live Attendance Tracking", "Automated Grade Calculations", "Interactive Study Material", "Teacher-Parent Messaging"].map((item, i) => (
                  <motion.li 
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 + 0.4 }}
                    key={i} 
                    className="flex items-center gap-3 text-slate-700 font-medium"
                  >
                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">✓</div>
                    {item}
                  </motion.li>
                ))}
              </ul>

              <div className="pt-6">
                <Link href="/annex/login">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-slate-900 text-white px-8 py-4 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center gap-3"
                  >
                    Enter SM-Annex <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </Link>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8 }}
              className="flex-1 relative w-full max-w-[600px]"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-indigo-50 rounded-[40px] transform rotate-3 scale-105 opacity-50 z-0 border border-blue-200/50" />
              <div className="relative bg-white rounded-[40px] shadow-2xl z-10 overflow-hidden border border-slate-100 flex flex-col p-6 aspect-[4/3]">
                {/* Mockup Dashboard UI */}
                <div className="flex justify-between items-center mb-8 border-b pb-4">
                  <div className="flex gap-3 items-center">
                    <motion.div 
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ type: "spring", delay: 0.3 }}
                      className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs"
                    >
                      SM
                    </motion.div>
                    <div>
                      <div className="h-3 w-32 bg-slate-200 rounded animate-pulse" />
                      <div className="h-2 w-20 bg-slate-100 rounded mt-2 animate-pulse" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <motion.div 
                      initial={{ opacity: 0, x: 10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 }}
                      className="h-8 w-8 rounded-full bg-slate-50 border border-slate-100" 
                    />
                    <motion.div 
                      initial={{ opacity: 0, x: 10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 }}
                      className="h-8 w-8 rounded-full bg-slate-50 border border-slate-100" 
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                    className="bg-slate-50 p-4 rounded-xl border border-slate-100 relative overflow-hidden"
                  >
                    <p className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Attendance</p>
                    <p className="text-2xl font-bold text-slate-900 mb-2">98%</p>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: "98%" }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6, duration: 1 }}
                        className="h-full bg-green-500 rounded-full" 
                      />
                    </div>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                    className="bg-slate-50 p-4 rounded-xl border border-slate-100 relative overflow-hidden"
                  >
                    <p className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Avg Grade</p>
                    <p className="text-2xl font-bold text-indigo-600 mb-2">A+</p>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: "94%" }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.7, duration: 1 }}
                        className="h-full bg-indigo-500 rounded-full" 
                      />
                    </div>
                  </motion.div>
                </div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 }}
                  className="flex-grow bg-slate-50 rounded-xl border border-slate-100 p-6 relative overflow-hidden flex flex-col"
                >
                  <p className="text-xs font-semibold text-slate-500 mb-4 uppercase tracking-wider">Performance Trend</p>
                  <div className="flex-grow flex items-end gap-3">
                    {[40, 70, 45, 90, 65, 100, 80].map((h, i) => (
                      <motion.div 
                        initial={{ height: 0 }}
                        whileInView={{ height: `${h}%` }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.8 + i * 0.1, duration: 1, type: "spring" }}
                        key={i} 
                        className="flex-1 bg-gradient-to-t from-indigo-600/80 to-indigo-400/80 rounded-t-md hover:from-indigo-600 hover:to-indigo-500 transition-colors cursor-pointer" 
                      />
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>
      
      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16">
        <div className="container px-4 md:px-6 mx-auto w-full max-w-7xl grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center">
                <span className="font-bold text-lg">SM</span>
              </div>
              <span className="font-bold text-2xl text-white font-display">Science Group</span>
            </Link>
            <p className="max-w-md mb-8 leading-relaxed text-slate-400">Leading the future of education with innovative tools, dedicated mentorship, and comprehensive digital infrastructure.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-6 text-lg">Services</h4>
            <ul className="space-y-3">
              <li><Link href="#scholars" className="hover:text-indigo-400 transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3"/> SM Scholars</Link></li>
              <li><Link href="#academy" className="hover:text-indigo-400 transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3"/> SM Science Academy</Link></li>
              <li><Link href="#teachers" className="hover:text-indigo-400 transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3"/> Our Teachers</Link></li>
              <li><Link href="/annex/login" className="hover:text-indigo-400 transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3"/> SM-Annex Portal</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-6 text-lg">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <div className="mt-1 w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                <span>123 Education City, Road 4<br/>Dhaka, Bangladesh</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                <span>info@smsciencegroup.com</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                <span>+880 1234 567890</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="container px-4 md:px-6 mx-auto w-full max-w-7xl mt-16 pt-8 border-t border-slate-800 text-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} SM Science Group. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
