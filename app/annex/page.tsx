"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { ArrowLeft, Shield, GraduationCap, Users, Binary, ArrowRight } from "lucide-react";
import { Card3D } from "@/components/ui/Card3D";

const ROLES = [
  {
    id: "student",
    title: "Student Portal",
    description: "Access your grades, attendance, and learning materials.",
    icon: Users,
    color: "indigo",
    href: "/annex/login?role=student"
  },
  {
    id: "teacher",
    title: "Teacher Portal",
    description: "Manage classes, track performance, and share resources.",
    icon: GraduationCap,
    color: "blue",
    href: "/annex/login?role=teacher"
  },
  {
    id: "admin",
    title: "Admin Console",
    description: "Full system control, user management, and campus oversight.",
    icon: Shield,
    color: "slate",
    href: "/annex/login?role=admin"
  }
];

export default function AnnexPortal() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-100 rounded-full blur-[120px] opacity-60 pointer-events-none transform translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-100 rounded-full blur-[120px] opacity-60 pointer-events-none transform -translate-x-1/3 translate-y-1/3" />

      <div className="max-w-5xl mx-auto w-full relative z-10">
        <div className="text-center mb-16">
          <Link href="/">
            <motion.button 
              whileHover={{ x: -5 }}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-8 mx-auto"
            >
              <ArrowLeft className="w-4 h-4" /> Back to main site
            </motion.button>
          </Link>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-center mb-6"
          >
            <div className="w-20 h-20 bg-indigo-600 text-white rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-600/30">
              <Binary className="w-10 h-10" />
            </div>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black text-slate-900 font-display tracking-tight"
          >
            SM-Annex Portal
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-xl text-slate-600 max-w-2xl mx-auto"
          >
            Select your role to access the smart campus ecosystem.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {ROLES.map((role, idx) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.1 }}
            >
              <Link href={role.href} className="block group h-full">
                <Card3D className="bg-white p-8 h-full border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col items-center text-center transition-all group-hover:border-indigo-200 group-hover:shadow-indigo-100">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 text-indigo-600 flex items-center justify-center mb-6 transition-colors group-hover:bg-indigo-600 group-hover:text-white shadow-inner">
                    <role.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">{role.title}</h3>
                  <p className="text-slate-500 mb-8 leading-relaxed">{role.description}</p>
                  <div className="mt-auto inline-flex items-center gap-2 text-indigo-600 font-bold group-hover:gap-3 transition-all">
                    Continue <ArrowRight className="w-4 h-4" />
                  </div>
                </Card3D>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-16 text-center"
        >
          <p className="text-slate-400 text-sm">
            Need help accessing your account? <Link href="/contact" className="text-indigo-600 font-semibold hover:underline">Contact Support</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
