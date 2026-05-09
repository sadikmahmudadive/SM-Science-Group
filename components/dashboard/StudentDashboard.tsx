"use client";

import { motion } from "motion/react";
import { BookOpen, GraduationCap, Calendar, FileText, Star, Clock, Loader2 } from "lucide-react";
import { Card3D } from "@/components/ui/Card3D";
import { UserProfile } from "@/lib/users";
import { useState, useEffect } from "react";
import { getStudentClasses, getStudentAssignments, ClassData, Assignment } from "@/lib/dashboard-data";

export function StudentDashboard({ profile }: { profile: UserProfile }) {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const classCode = (profile as any).classCode || "00"; 

      try {
        const [classesData, assignmentsData] = await Promise.all([
          getStudentClasses(classCode),
          getStudentAssignments(classCode)
        ]);
        setClasses(classesData);
        setAssignments(assignmentsData);
      } catch (err) {
        console.error("Failed to load student dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [profile]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
        <div className="w-16 h-16 bg-indigo-50 rounded-full animate-pulse flex items-center justify-center">
            <GraduationCap className="w-8 h-8 text-indigo-600 animate-bounce" />
        </div>
        <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Assembling your academic profile...</p>
      </div>
    );
  }

  const STUDENT_STATS = [
    { label: "Overall GPA", value: "TBD", icon: Star, color: "indigo" },
    { label: "Attendance", value: "N/A", icon: Calendar, color: "emerald" },
    { label: "Assignments", value: assignments.length.toString() || "0 Due", icon: FileText, color: "amber" },
    { label: "Courses", value: classes.length.toString(), icon: BookOpen, color: "blue" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12 relative">
      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-100 rounded-full blur-[100px] opacity-30 -z-10" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-100 rounded-full blur-[100px] opacity-30 -z-10" />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-indigo-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter mb-4 shadow-lg shadow-indigo-200">
            Student Profile
          </div>
          <h2 className="text-4xl font-black text-slate-900 font-display tracking-tight leading-none">Welcome back, <span className="text-indigo-600">{profile.displayName}</span></h2>
          <p className="text-slate-500 mt-2 font-medium">Your personalized learning environment and progress tracker.</p>
        </div>
        <div className="bg-white/70 backdrop-blur-md px-4 py-2 rounded-2xl border border-indigo-100 flex items-center gap-3 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-xs font-black text-slate-600 uppercase tracking-widest">ID: {profile.systemId}</span>
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
            <Card3D className="bg-white/80 backdrop-blur-md p-6 border border-white shadow-xl shadow-slate-200/30 flex items-center gap-5 rounded-[2rem] group">
              <div className={`w-14 h-14 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center shadow-inner group-hover:bg-${stat.color}-600 group-hover:text-white transition-colors duration-500`}>
                <stat.icon className="w-7 h-7" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
              </div>
            </Card3D>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-slate-900 font-display uppercase tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg">
                <GraduationCap className="w-5 h-5" />
              </div>
              My Learning Path
            </h3>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">Current Term</span>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            {classes.length > 0 ? (
              classes.map((course) => (
                <Card3D key={course.id} className="bg-white/70 backdrop-blur-md p-8 border border-white shadow-xl shadow-slate-200/30 rounded-[2.5rem] group overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity -mr-10 -mt-10" />
                  
                  <div className="flex justify-between items-start mb-8 relative z-10">
                    <div>
                      <h4 className="font-black text-slate-900 text-2xl tracking-tight group-hover:text-indigo-600 transition-colors">{course.name}</h4>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Instructor: {course.teacherId}</p>
                      </div>
                    </div>
                    <div className="bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100">
                      <span className="text-xl font-black text-indigo-600">Pending</span>
                    </div>
                  </div>
                  <div className="space-y-4 relative z-10">
                    <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      <span>Course Progress</span>
                      <span>0% Complete</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-50 shadow-inner">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "0%" }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-indigo-600 rounded-full shadow-lg"
                      />
                    </div>
                  </div>
                </Card3D>
              ))
            ) : (
              <div className="p-16 text-center bg-white/50 backdrop-blur-sm rounded-[3rem] border border-white shadow-inner">
                <BookOpen className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-black uppercase tracking-widest text-sm">No Active Enrolments</p>
                <p className="text-xs text-slate-400 mt-2">Your curriculum will appear here once assigned.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <h3 className="text-2xl font-black text-slate-900 font-display uppercase tracking-tight flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-100">
                <FileText className="w-5 h-5" />
              </div>
              Tasks
          </h3>
          <div className="bg-white/70 backdrop-blur-md rounded-[3rem] border border-white shadow-xl shadow-slate-200/30 overflow-hidden p-8 space-y-8">
            {assignments.length > 0 ? (
              assignments.map((task) => (
                <div key={task.id} className="flex gap-5 group cursor-pointer relative">
                  <div className="flex flex-col items-center relative z-10">
                    <div className="w-3 h-3 rounded-full border-2 border-indigo-600 bg-white group-hover:bg-indigo-600 transition-colors" />
                    <div className="w-[1.5px] flex-1 bg-slate-100 my-2" />
                  </div>
                  <div className="pb-4">
                    <h4 className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{task.title}</h4>
                    <div className="flex items-center gap-2 mt-2">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Awaiting Submission</p>
                    </div>
                    <span className="inline-block mt-3 text-[9px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase border border-indigo-100">
                      {task.type || "Academic Task"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-slate-200" />
                </div>
                <p className="text-xs text-slate-400 font-black uppercase tracking-widest leading-relaxed">No pending assignments<br/>Excellent work!</p>
              </div>
            )}
            
            {assignments.length > 0 && (
              <button className="w-full py-4 mt-4 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all hover:scale-[1.02] active:scale-[0.98]">
                View All Assignments
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
