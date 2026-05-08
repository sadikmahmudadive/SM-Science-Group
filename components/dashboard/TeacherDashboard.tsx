"use client";

import { motion } from "motion/react";
import { BookOpen, Users, ClipboardCheck, Layout, MessageSquare, Plus, Loader2 } from "lucide-react";
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
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="text-slate-500 font-medium uppercase tracking-widest text-sm">Syncing your classroom data...</p>
      </div>
    );
  }

  const TEACHER_STATS = [
    { label: "My Classes", value: classes.length.toString(), icon: Layout, color: "blue" },
    { label: "Total Students", value: classes.reduce((acc, c) => acc + c.studentCount, 0).toString(), icon: Users, color: "indigo" },
    { label: "Recent Submissions", value: submissions.length.toString(), icon: ClipboardCheck, color: "amber" },
    { label: "Messages", value: "0", icon: MessageSquare, color: "emerald" }, // Stubbed until messaging is built
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 font-display">Welcome, Teacher {profile.displayName}</h2>
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
            {classes.length > 0 ? (
              classes.map((cls, idx) => (
                <Card3D key={cls.id} className="bg-white p-5 border border-slate-100 shadow-sm hover:border-indigo-200 transition-colors group cursor-pointer">
                  <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{cls.name}</h4>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span className="text-xs font-bold text-slate-500">{cls.studentCount} Students</span>
                    </div>
                    <span className="text-xs font-bold text-slate-400">{cls.schedule}</span>
                  </div>
                </Card3D>
              ))
            ) : (
              <div className="col-span-2 p-8 text-center bg-white rounded-3xl border border-slate-100 border-dashed">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No classes assigned yet.</p>
                <p className="text-xs text-slate-400 mt-1">Contact administration to be assigned to a class.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-indigo-600" /> Recent Submissions
          </h3>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-5 space-y-4">
              {submissions.length > 0 ? (
                submissions.map((sub) => (
                  <div key={sub.id} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs uppercase">
                      {sub.studentName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{sub.studentName}</p>
                      <p className="text-xs text-slate-500 truncate">{sub.assignmentTitle}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center">
                  <ClipboardCheck className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                  <p className="text-sm text-slate-400 font-medium">No recent submissions</p>
                </div>
              )}
            </div>
            {submissions.length > 0 && (
              <button className="w-full py-3 bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-widest hover:bg-slate-100 transition-colors">
                View All Submissions
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
