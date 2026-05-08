"use client";

import { motion } from "motion/react";
import { BookOpen, GraduationCap, Calendar, FileText, Star, Clock } from "lucide-react";
import { Card3D } from "@/components/ui/Card3D";

const STUDENT_STATS = [
  { label: "Overall GPA", value: "3.85", icon: Star, color: "indigo" },
  { label: "Attendance", value: "94%", icon: Calendar, color: "emerald" },
  { label: "Assignments", value: "3 Due", icon: FileText, color: "amber" },
  { label: "Library Books", value: "2", icon: BookOpen, color: "blue" },
];

export function StudentDashboard() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 font-display">Student Dashboard</h2>
          <p className="text-slate-500 mt-1">Track your academic progress and upcoming deadlines.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
          <Clock className="w-4 h-4 text-indigo-600" />
          <span className="text-sm font-bold text-slate-600">Next Class: Physics @ 10:00 AM</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {STUDENT_STATS.map((stat, idx) => (
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
            <GraduationCap className="w-5 h-5 text-indigo-600" /> My Learning Path
          </h3>
          <div className="space-y-4">
            {[
              { subject: "Advanced Mathematics", progress: 75, grade: "A", instructor: "Dr. Anisur Rahman" },
              { subject: "Atomic Physics", progress: 62, grade: "A-", instructor: "Michael Chang" },
              { subject: "Inorganic Chemistry", progress: 88, grade: "A+", instructor: "Nadia Islam" },
            ].map((course, idx) => (
              <Card3D key={idx} className="bg-white p-6 border border-slate-100 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">{course.subject}</h4>
                    <p className="text-xs text-slate-500">{course.instructor}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-indigo-600">{course.grade}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-tighter">
                    <span>Course Progress</span>
                    <span>{course.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${course.progress}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-indigo-600 rounded-full"
                    />
                  </div>
                </div>
              </Card3D>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" /> Upcoming Tasks
          </h3>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-6 space-y-6">
            {[
              { title: "Calculus Worksheet", deadline: "Today, 11:59 PM", type: "Math" },
              { title: "Lab Report: Chemical Bonds", deadline: "Tomorrow", type: "Chemistry" },
              { title: "Physics Quiz - Waves", deadline: "Friday, May 12", type: "Physics" },
            ].map((task, idx) => (
              <div key={idx} className="flex gap-4 group cursor-pointer">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-indigo-600 group-hover:scale-150 transition-transform" />
                  <div className="w-px flex-1 bg-slate-100 my-1" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{task.title}</h4>
                  <p className="text-xs text-slate-500 mt-1">{task.deadline}</p>
                  <span className="inline-block mt-2 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase">
                    {task.type}
                  </span>
                </div>
              </div>
            ))}
            <button className="w-full py-3 mt-4 rounded-xl border-2 border-indigo-50 text-indigo-600 font-bold text-sm hover:bg-indigo-50 transition-colors">
              Go to Assignments
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
