"use client";

import { motion } from "motion/react";
import { BookOpen, Users, ClipboardCheck, Layout, MessageSquare, Plus } from "lucide-react";
import { Card3D } from "@/components/ui/Card3D";

const TEACHER_STATS = [
  { label: "My Classes", value: "4", icon: Layout, color: "blue" },
  { label: "Total Students", value: "128", icon: Users, color: "indigo" },
  { label: "Pending Grades", value: "12", icon: ClipboardCheck, color: "amber" },
  { label: "Messages", value: "3", icon: MessageSquare, color: "emerald" },
];

export function TeacherDashboard() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 font-display">Teacher Dashboard</h2>
          <p className="text-slate-500 mt-1">Manage your classrooms, student progress, and assignments.</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
          <Plus className="w-4 h-4" /> New Assignment
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {TEACHER_STATS.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card3D className="bg-white p-6 border border-slate-100 shadow-sm flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-2xl font-black text-slate-900">{stat.value}</p>
              </div>
            </Card3D>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" /> Active Classes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {["Advanced Physics - Class 12", "Foundation Science - Class 8", "Medical Prep - Group A", "Chemistry Lab - Class 11"].map((className, idx) => (
              <Card3D key={idx} className="bg-white p-5 border border-slate-100 shadow-sm hover:border-indigo-200 transition-colors group cursor-pointer">
                <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{className}</h4>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-slate-100 overflow-hidden">
                        <img src={`https://picsum.photos/seed/${idx*10+i}/50/50`} alt="student" />
                      </div>
                    ))}
                    <div className="w-7 h-7 rounded-full border-2 border-white bg-slate-50 flex items-center justify-center text-[10px] font-bold text-slate-400">+30</div>
                  </div>
                  <span className="text-xs font-bold text-slate-400">8:30 AM - Mon, Wed</span>
                </div>
              </Card3D>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-indigo-600" /> Recent Submissions
          </h3>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-5 space-y-4">
              {[
                { name: "Rahul Ahmed", task: "Quantum Mechanics HW", time: "2 mins ago" },
                { name: "Ayesha Karim", task: "Lab Report #4", time: "15 mins ago" },
                { name: "Sifat Hasan", task: "Midterm Quiz", time: "1 hour ago" },
              ].map((sub, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs uppercase">
                    {sub.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{sub.name}</p>
                    <p className="text-xs text-slate-500 truncate">{sub.task}</p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">{sub.time}</span>
                </div>
              ))}
            </div>
            <button className="w-full py-3 bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-widest hover:bg-slate-100 transition-colors">
              View All Submissions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
