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
      // If student profile has a classCode, fetch related data
      // For now, since students are just being assigned classes, we use their profile.classCode
      const classCode = (profile as any).classCode || "00"; // fallback for testing

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
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="text-slate-500 font-medium uppercase tracking-widest text-sm">Loading your academic profile...</p>
      </div>
    );
  }

  const STUDENT_STATS = [
    { label: "Overall GPA", value: "TBD", icon: Star, color: "indigo" }, // Dynamic GPA requires a grade collection
    { label: "Attendance", value: "N/A", icon: Calendar, color: "emerald" }, // Requires attendance tracking
    { label: "Assignments", value: assignments.length.toString() || "0 Due", icon: FileText, color: "amber" },
    { label: "Enrolled Courses", value: classes.length.toString(), icon: BookOpen, color: "blue" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 font-display">Welcome back, {profile.displayName}</h2>
          <p className="text-slate-500 mt-1">Track your academic progress and upcoming deadlines.</p>
          <div className="mt-2 inline-flex items-center gap-2 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
             <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
             <span className="text-xs font-bold text-indigo-700 uppercase tracking-widest">ID: {profile.systemId}</span>
          </div>
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
            {classes.length > 0 ? (
              classes.map((course) => (
                <Card3D key={course.id} className="bg-white p-6 border border-slate-100 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-slate-900 text-lg">{course.name}</h4>
                      <p className="text-xs text-slate-500">Instructor ID: {course.teacherId}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-indigo-600">-</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-tighter">
                      <span>Course Progress</span>
                      <span>0%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "0%" }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-indigo-600 rounded-full"
                      />
                    </div>
                  </div>
                </Card3D>
              ))
            ) : (
              <div className="p-10 text-center bg-white rounded-3xl border border-slate-100 border-dashed">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No courses currently enrolled.</p>
                <p className="text-xs text-slate-400 mt-1">Check back later or contact administration.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" /> Upcoming Tasks
          </h3>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-6 space-y-6">
            {assignments.length > 0 ? (
              assignments.map((task) => (
                <div key={task.id} className="flex gap-4 group cursor-pointer">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-indigo-600 group-hover:scale-150 transition-transform" />
                    <div className="w-px flex-1 bg-slate-100 my-1" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{task.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">Due soon</p>
                    <span className="inline-block mt-2 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase">
                      {task.type || "Assignment"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center">
                <FileText className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-400 font-medium">You're all caught up!</p>
              </div>
            )}
            
            {assignments.length > 0 && (
              <button className="w-full py-3 mt-4 rounded-xl border-2 border-indigo-50 text-indigo-600 font-bold text-sm hover:bg-indigo-50 transition-colors">
                Go to Assignments
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
