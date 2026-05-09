"use client";

import { motion } from "motion/react";
import { BookOpen, Users, ClipboardCheck, Layout, MessageSquare, Plus, Loader2, Calendar } from "lucide-react";
import { Card3D } from "@/components/ui/Card3D";
import { UserProfile } from "@/lib/users";
import { useState, useEffect } from "react";
import { getTeacherClasses, getTeacherSubmissions, ClassData, Submission } from "@/lib/dashboard-data";

export function TeacherDashboard({ profile }: { profile: UserProfile }) {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!profile.uid) return;
      try {
        const [classesData, submissionsData] = await Promise.all([
          getTeacherClasses(profile.uid),
          getTeacherSubmissions(profile.uid)
        ]);
        setClasses(classesData);
        setSubmissions(submissionsData);
      } catch (err) {
        console.error("Failed to load teacher dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [profile.uid]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
        <div className="w-16 h-16 bg-indigo-50 rounded-full animate-pulse flex items-center justify-center">
            <Layout className="w-8 h-8 text-indigo-600 animate-bounce" />
        </div>
        <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Syncing your classroom workspace...</p>
      </div>
    );
  }

  const TEACHER_STATS = [
    { label: "My Classes", value: classes.length.toString(), icon: Layout, color: "blue" },
    { label: "Students", value: classes.reduce((acc, c) => acc + c.studentCount, 0).toString(), icon: Users, color: "indigo" },
    { label: "Submissions", value: submissions.length.toString(), icon: ClipboardCheck, color: "amber" },
    { label: "Messages", value: "0", icon: MessageSquare, color: "emerald" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12 relative">
      {/* Background Blobs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100 rounded-full blur-[100px] opacity-30 -z-10" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-100 rounded-full blur-[100px] opacity-30 -z-10" />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-indigo-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter mb-4 shadow-lg shadow-indigo-200">
            Faculty Portal
          </div>
          <h2 className="text-4xl font-black text-slate-900 font-display tracking-tight leading-none">Welcome, <span className="text-indigo-600">Teacher {profile.displayName}</span></h2>
          <p className="text-slate-500 mt-2 font-medium">Manage your classrooms, track student performance, and share resources.</p>
        </div>
        <button className="flex items-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 hover:scale-[1.02] active:scale-[0.98]">
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
                <BookOpen className="w-5 h-5" />
              </div>
              Active Classrooms
            </h3>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">Academic Year 2026</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {classes.length > 0 ? (
              classes.map((cls, idx) => (
                <Card3D key={cls.id} className="bg-white/70 backdrop-blur-md p-6 border border-white shadow-xl shadow-slate-200/30 rounded-[2.5rem] group cursor-pointer relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity -mr-10 -mt-10" />
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                        <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase border border-indigo-100">{cls.schedule}</span>
                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                            <Plus className="w-4 h-4" />
                        </div>
                    </div>
                    <h4 className="font-black text-slate-900 text-xl tracking-tight group-hover:text-indigo-600 transition-colors mb-4">{cls.name}</h4>
                    <div className="flex items-center gap-4 text-slate-500">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-widest">{cls.studentCount} Registered</span>
                      </div>
                    </div>
                    <div className="mt-6">
                        <a href={`/annex/dashboard/attendance?classId=${cls.id}&classCode=${cls.classCode}`} className="flex items-center justify-center gap-2 w-full py-3 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                            <Calendar className="w-3.5 h-3.5" />
                            Mark Attendance
                        </a>
                    </div>
                  </div>
                </Card3D>
              ))
            ) : (
              <div className="col-span-2 p-16 text-center bg-white/50 backdrop-blur-sm rounded-[3rem] border border-white shadow-inner">
                <BookOpen className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-black uppercase tracking-widest text-sm">No Assigned Classes</p>
                <p className="text-xs text-slate-400 mt-2">Check with the academic department for your schedule.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <h3 className="text-2xl font-black text-slate-900 font-display uppercase tracking-tight flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-100">
                <ClipboardCheck className="w-5 h-5" />
              </div>
              Grading Queue
          </h3>
          <div className="bg-white/70 backdrop-blur-md rounded-[3rem] border border-white shadow-xl shadow-slate-200/30 overflow-hidden p-8 space-y-6">
            {submissions.length > 0 ? (
              submissions.map((sub) => (
                <div key={sub.id} className="flex items-center gap-4 p-4 rounded-3xl hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all cursor-pointer group border border-transparent hover:border-slate-100">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm uppercase shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-500">
                    {sub.studentName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-slate-900 truncate uppercase tracking-tight">{sub.studentName}</p>
                    <p className="text-[10px] font-bold text-slate-400 truncate uppercase tracking-widest mt-1">{sub.assignmentTitle}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <ClipboardCheck className="w-8 h-8 text-slate-200" />
                </div>
                <p className="text-xs text-slate-400 font-black uppercase tracking-widest leading-relaxed">No pending submissions<br/>Queue is clear!</p>
              </div>
            )}
            
            {submissions.length > 0 && (
              <button className="w-full py-4 mt-4 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all hover:scale-[1.02] active:scale-[0.98]">
                Open Grading Center
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
