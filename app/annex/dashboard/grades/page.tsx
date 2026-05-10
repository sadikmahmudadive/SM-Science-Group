"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { GraduationCap, Award, BookOpen, Loader2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getUserProfile, UserProfile } from "@/lib/users";
import { getGradesByStudent, Grade, Exam, getAllExams } from "@/lib/dashboard-data";
import { Card3D } from "@/components/ui/Card3D";

export default function StudentGradesPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user?.uid) return;
      try {
        const p = await getUserProfile(user.uid);
        setProfile(p);
        const [gradesData, examsData] = await Promise.all([
          getGradesByStudent(user.uid),
          getAllExams()
        ]);
        setGrades(gradesData);
        setExams(examsData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user?.uid]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="text-slate-500 font-medium uppercase tracking-widest text-sm">Loading your grades...</p>
      </div>
    );
  }

  const gradeWithExam = grades.map(g => {
    const exam = exams.find(e => e.id === g.examId);
    return { ...g, exam };
  }).filter(g => g.exam);

  const overallPct = gradeWithExam.length > 0
    ? Math.round(gradeWithExam.reduce((acc, g) => acc + (g.obtainedMarks / g.totalMarks) * 100, 0) / gradeWithExam.length)
    : 0;

  const getGradeLabel = (pct: number) => {
    if (pct >= 90) return { label: 'A+', color: 'emerald' };
    if (pct >= 80) return { label: 'A', color: 'emerald' };
    if (pct >= 70) return { label: 'B+', color: 'blue' };
    if (pct >= 60) return { label: 'B', color: 'blue' };
    if (pct >= 50) return { label: 'C', color: 'amber' };
    if (pct >= 40) return { label: 'D', color: 'amber' };
    return { label: 'F', color: 'red' };
  };

  const overallGrade = getGradeLabel(overallPct);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-100 rounded-full blur-[150px] opacity-30 -z-10" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-100 rounded-full blur-[100px] opacity-30 -z-10" />

      <div>
        <div className="inline-flex items-center gap-2 bg-indigo-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter mb-4 shadow-lg shadow-indigo-200">
          Student Portal
        </div>
        <h1 className="text-4xl font-black text-slate-900 font-display uppercase tracking-tight leading-none">My Grades</h1>
        <p className="text-slate-500 font-medium text-sm mt-2">Track your academic performance across all exams and assessments.</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <Card3D className="bg-white/80 backdrop-blur-md p-6 border border-white shadow-xl shadow-slate-200/30 rounded-[2rem] text-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
              <BookOpen className="w-7 h-7" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Exams</p>
            <p className="text-3xl font-black text-slate-900 tracking-tighter">{gradeWithExam.length}</p>
          </Card3D>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card3D className="bg-white/80 backdrop-blur-md p-6 border border-white shadow-xl shadow-slate-200/30 rounded-[2rem] text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
              <TrendingUp className="w-7 h-7" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Average Score</p>
            <p className="text-3xl font-black text-slate-900 tracking-tighter">{overallPct}%</p>
          </Card3D>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card3D className="bg-white/80 backdrop-blur-md p-6 border border-white shadow-xl shadow-slate-200/30 rounded-[2rem] text-center">
            <div className={`w-14 h-14 rounded-2xl bg-${overallGrade.color}-50 text-${overallGrade.color}-600 flex items-center justify-center mx-auto mb-3 shadow-inner`}>
              <Award className="w-7 h-7" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Overall Grade</p>
            <p className="text-3xl font-black text-slate-900 tracking-tighter">{overallGrade.label}</p>
          </Card3D>
        </motion.div>
      </div>

      {/* Grades Table */}
      {gradeWithExam.length === 0 ? (
        <div className="py-20 text-center bg-white/50 backdrop-blur-sm rounded-[3rem] border border-white shadow-inner">
          <GraduationCap className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-400 font-black uppercase tracking-widest text-sm">No Grades Yet</p>
          <p className="text-xs text-slate-400 mt-2">Your grades will appear here once teachers submit them.</p>
        </div>
      ) : (
        <div className="bg-white/70 backdrop-blur-md border border-white shadow-2xl shadow-slate-200/40 rounded-[2.5rem] overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Exam</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Class</th>
                <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Marks</th>
                <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Grade</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {gradeWithExam.map((g, idx) => {
                const pct = g.totalMarks > 0 ? Math.round((g.obtainedMarks / g.totalMarks) * 100) : 0;
                const grade = getGradeLabel(pct);
                return (
                  <motion.tr 
                    layout key={g.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group hover:bg-white transition-colors"
                  >
                    <td className="px-8 py-5">
                      <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{g.exam?.title}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{g.exam?.date}</p>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs font-bold text-slate-600">{g.exam?.className}</span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        g.exam?.type === 'quiz' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                        g.exam?.type === 'midterm' ? 'bg-indigo-50 text-indigo-600 border-indigo-200' :
                        g.exam?.type === 'final' ? 'bg-purple-50 text-purple-600 border-purple-200' :
                        g.exam?.type === 'assignment' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                        'bg-amber-50 text-amber-600 border-amber-200'
                      }`}>{g.exam?.type}</span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className="text-lg font-black text-slate-900">{g.obtainedMarks}</span>
                      <span className="text-xs text-slate-400 font-bold">/{g.totalMarks}</span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={`inline-flex w-10 h-10 rounded-xl items-center justify-center font-black text-sm bg-${grade.color}-50 text-${grade.color}-600 border border-${grade.color}-200 shadow-inner`}>
                        {grade.label}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs text-slate-500">{g.remarks || '—'}</span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
