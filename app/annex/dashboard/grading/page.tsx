"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, BookOpen, Users, Edit2, Trash2, X, Search, 
  Loader2, ClipboardCheck, ChevronLeft, Save, CheckCircle2, XCircle, 
  FileText, Award
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getUserProfile, UserProfile } from "@/lib/users";
import { 
  getTeacherClasses, getAllClasses, ClassData,
  createExam, getExamsByTeacher, getAllExams, deleteExam, Exam,
  submitGrades, getGradesByExam, Grade,
  getStudentsByClassCode, getAllStudents
} from "@/lib/dashboard-data";
import { Card3D } from "@/components/ui/Card3D";
import { DatePicker } from "@/components/ui/DatePicker";

const EXAM_TYPES = [
  { value: 'quiz', label: 'Quiz', color: 'blue' },
  { value: 'midterm', label: 'Midterm', color: 'indigo' },
  { value: 'final', label: 'Final', color: 'purple' },
  { value: 'assignment', label: 'Assignment', color: 'emerald' },
  { value: 'classwork', label: 'Classwork', color: 'amber' },
];

type View = 'list' | 'create' | 'grade';

export default function GradingPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [view, setView] = useState<View>('list');
  const [searchTerm, setSearchTerm] = useState("");

  // Create exam form
  const [examForm, setExamForm] = useState({
    title: "", classId: "", type: "quiz" as Exam['type'], totalMarks: 100, date: new Date().toISOString().split('T')[0]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Grade entry
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [gradeMap, setGradeMap] = useState<Record<string, { marks: number; remarks: string }>>({});
  const [savingGrades, setSavingGrades] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super-admin';

  useEffect(() => {
    async function loadData() {
      if (!user?.uid) return;
      try {
        const p = await getUserProfile(user.uid);
        setProfile(p);
        if (p?.role === 'admin' || p?.role === 'super-admin') {
          const [cls, exm] = await Promise.all([getAllClasses(), getAllExams()]);
          setClasses(cls);
          setExams(exm);
        } else if (p?.role === 'teacher') {
          const [cls, exm] = await Promise.all([getTeacherClasses(user.uid), getExamsByTeacher(user.uid)]);
          setClasses(cls);
          setExams(exm);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user?.uid]);

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    setIsSubmitting(true);
    try {
      const cls = classes.find(c => c.id === examForm.classId);
      if (!cls) throw new Error("Class not found");
      const id = await createExam({
        title: examForm.title,
        classId: examForm.classId,
        classCode: cls.classCode,
        className: cls.name,
        teacherId: user.uid,
        teacherName: profile.displayName,
        type: examForm.type,
        totalMarks: examForm.totalMarks,
        date: examForm.date,
      });
      setExams([{ id, ...examForm, classCode: cls.classCode, className: cls.name, teacherId: user.uid, teacherName: profile.displayName } as Exam, ...exams]);
      setView('list');
      setExamForm({ title: "", classId: "", type: "quiz", totalMarks: 100, date: new Date().toISOString().split('T')[0] });
    } catch (err) {
      console.error(err);
      alert("Failed to create exam.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExam = async (id: string) => {
    if (!confirm("Delete this exam and all its grades?")) return;
    try {
      await deleteExam(id);
      setExams(exams.filter(e => e.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenGrading = async (exam: Exam) => {
    setSelectedExam(exam);
    setView('grade');
    setLoading(true);
    try {
      const [studentList, existingGrades] = await Promise.all([
        getStudentsByClassCode(exam.classCode),
        getGradesByExam(exam.id)
      ]);
      setStudents(studentList);
      const map: Record<string, { marks: number; remarks: string }> = {};
      studentList.forEach(s => {
        const existing = existingGrades.find(g => g.studentId === s.uid);
        map[s.uid] = {
          marks: existing ? existing.obtainedMarks : 0,
          remarks: existing ? existing.remarks || '' : ''
        };
      });
      setGradeMap(map);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGrades = async () => {
    if (!selectedExam) return;
    setSavingGrades(true);
    setMessage(null);
    try {
      const grades = students.map(s => ({
        examId: selectedExam.id,
        studentId: s.uid,
        studentName: s.displayName,
        obtainedMarks: gradeMap[s.uid]?.marks || 0,
        totalMarks: selectedExam.totalMarks,
        remarks: gradeMap[s.uid]?.remarks || ''
      }));
      await submitGrades(selectedExam.id, grades);
      setMessage({ type: 'success', text: 'Grades saved successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save grades.' });
    } finally {
      setSavingGrades(false);
    }
  };

  const filteredExams = exams.filter(e =>
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.className.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeStyle = (type: string) => {
    const t = EXAM_TYPES.find(e => e.value === type);
    if (!t) return 'bg-slate-50 text-slate-600 border-slate-200';
    return `bg-${t.color}-50 text-${t.color}-600 border-${t.color}-200`;
  };

  if (loading && view !== 'grade') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="text-slate-500 font-medium uppercase tracking-widest text-sm">Loading grading center...</p>
      </div>
    );
  }

  // ====== GRADE ENTRY VIEW ======
  if (view === 'grade' && selectedExam) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 pb-20 relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-100 rounded-full blur-[150px] opacity-30 -z-10" />

        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <button onClick={() => setView('list')} className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all shadow-xl shadow-slate-200/50 hover:scale-110 active:scale-95">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-4xl font-black text-slate-900 font-display uppercase tracking-tight leading-none">{selectedExam.title}</h1>
              <p className="text-slate-500 font-medium text-sm mt-2 flex items-center gap-2">
                <span className="text-indigo-600 font-bold">{selectedExam.className}</span> • {selectedExam.type.toUpperCase()} • Total: {selectedExam.totalMarks}
              </p>
              {isAdmin && (
                <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest border border-amber-200">
                  View Only
                </span>
              )}
            </div>
          </div>

          {!isAdmin && (
            <button 
              onClick={handleSaveGrades}
              disabled={savingGrades}
              className="flex items-center gap-3 bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
            >
              {savingGrades ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save All Grades
            </button>
          )}
        </div>

        <AnimatePresence>
          {message && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`p-4 rounded-2xl flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}
            >
              {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              <p className="text-xs font-black uppercase tracking-tight">{message.text}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Loading students...</p>
          </div>
        ) : (
          <div className="bg-white/70 backdrop-blur-md border border-white shadow-2xl shadow-slate-200/40 rounded-[2.5rem] overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                  <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Marks ({selectedExam.totalMarks})</th>
                  <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Percentage</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {students.length > 0 ? students.map(student => {
                  const marks = gradeMap[student.uid]?.marks || 0;
                  const pct = selectedExam.totalMarks > 0 ? Math.round((marks / selectedExam.totalMarks) * 100) : 0;
                  return (
                    <motion.tr layout key={student.uid} className="group hover:bg-white transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-500">
                            {student.displayName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{student.displayName}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center">
                        {isAdmin ? (
                          <span className="text-lg font-black text-slate-900">{marks}</span>
                        ) : (
                          <input 
                            type="number" min="0" max={selectedExam.totalMarks}
                            value={marks}
                            onChange={e => setGradeMap({ ...gradeMap, [student.uid]: { ...gradeMap[student.uid], marks: Math.min(parseInt(e.target.value) || 0, selectedExam.totalMarks) } })}
                            className="w-20 text-center px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                          />
                        )}
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          pct >= 80 ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                          pct >= 60 ? 'bg-blue-50 text-blue-600 border-blue-200' :
                          pct >= 40 ? 'bg-amber-50 text-amber-600 border-amber-200' :
                          'bg-red-50 text-red-600 border-red-200'
                        }`}>{pct}%</span>
                      </td>
                      <td className="px-8 py-5">
                        {isAdmin ? (
                          <span className="text-xs text-slate-500">{gradeMap[student.uid]?.remarks || '—'}</span>
                        ) : (
                          <input 
                            type="text"
                            placeholder="Optional"
                            value={gradeMap[student.uid]?.remarks || ''}
                            onChange={e => setGradeMap({ ...gradeMap, [student.uid]: { ...gradeMap[student.uid], remarks: e.target.value } })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                          />
                        )}
                      </td>
                    </motion.tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center">
                      <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                      <p className="text-xs text-slate-400 font-black uppercase tracking-widest">No students enrolled in this class</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // ====== CREATE EXAM VIEW ======
  if (view === 'create') {
    return (
      <div className="max-w-2xl mx-auto space-y-8 pb-20 relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-100 rounded-full blur-[150px] opacity-30 -z-10" />

        <div className="flex items-center gap-6">
          <button onClick={() => setView('list')} className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all shadow-xl shadow-slate-200/50 hover:scale-110 active:scale-95">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-4xl font-black text-slate-900 font-display uppercase tracking-tight leading-none">Create Exam</h1>
            <p className="text-slate-500 font-medium text-sm mt-2">Set up a new exam, quiz, or assignment for grading.</p>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-md border border-white shadow-2xl shadow-slate-200/40 rounded-[2.5rem] p-8">
          <form onSubmit={handleCreateExam} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">Exam Title</label>
              <input type="text" required value={examForm.title} onChange={e => setExamForm({ ...examForm, title: e.target.value })}
                placeholder="e.g. Chapter 5 Quiz - Physics"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-indigo-500 focus:border-indigo-500 text-sm" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">Class</label>
                <select required value={examForm.classId} onChange={e => setExamForm({ ...examForm, classId: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-indigo-500 focus:border-indigo-500 text-sm">
                  <option value="" disabled>Select class...</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">Type</label>
                <select value={examForm.type} onChange={e => setExamForm({ ...examForm, type: e.target.value as Exam['type'] })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-indigo-500 focus:border-indigo-500 text-sm">
                  {EXAM_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">Total Marks</label>
                <input type="number" required min="1" value={examForm.totalMarks} onChange={e => setExamForm({ ...examForm, totalMarks: parseInt(e.target.value) || 100 })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-indigo-500 focus:border-indigo-500 text-sm" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">Date</label>
                <DatePicker value={examForm.date} onChange={d => setExamForm({ ...examForm, date: d })} />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button type="submit" disabled={isSubmitting}
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]">
                {isSubmitting ? "Creating..." : "Create Exam"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ====== EXAM LIST VIEW ======
  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-100 rounded-full blur-[150px] opacity-30 -z-10" />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-indigo-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter mb-4 shadow-lg shadow-indigo-200">
            {isAdmin ? 'Admin Panel' : 'Faculty Panel'}
          </div>
          <h1 className="text-4xl font-black text-slate-900 font-display uppercase tracking-tight leading-none">Grading Center</h1>
          <p className="text-slate-500 font-medium text-sm mt-2">
            {isAdmin ? 'View all exams and grades across the institution.' : 'Create exams, assign marks, and track student performance.'}
          </p>
        </div>
        {!isAdmin && (
          <button onClick={() => setView('create')}
            className="flex items-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 hover:scale-[1.02] active:scale-[0.98]">
            <Plus className="w-4 h-4" /> New Exam
          </button>
        )}
      </div>

      <div className="relative group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
        <input type="text" placeholder="Search exams by title or class..."
          value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-14 pr-6 py-5 bg-white border border-slate-100 rounded-[2rem] text-sm font-medium focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-600 transition-all shadow-xl shadow-slate-200/20 outline-none" />
      </div>

      {filteredExams.length === 0 ? (
        <div className="py-20 text-center bg-white/50 backdrop-blur-sm rounded-[3rem] border border-white shadow-inner">
          <Award className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-400 font-black uppercase tracking-widest text-sm">No Exams Found</p>
          <p className="text-xs text-slate-400 mt-2">
            {isAdmin ? 'No exams have been created yet.' : "Click 'New Exam' to create your first exam."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.map(exam => (
            <Card3D key={exam.id} className="bg-white/70 backdrop-blur-md p-6 border border-white shadow-xl shadow-slate-200/30 rounded-[2.5rem] group relative overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity -mr-10 -mt-10" />
              
              <div className="relative z-10 flex-1">
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                    exam.type === 'quiz' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                    exam.type === 'midterm' ? 'bg-indigo-50 text-indigo-600 border-indigo-200' :
                    exam.type === 'final' ? 'bg-purple-50 text-purple-600 border-purple-200' :
                    exam.type === 'assignment' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                    'bg-amber-50 text-amber-600 border-amber-200'
                  }`}>{exam.type}</span>
                  {!isAdmin && (
                    <button onClick={() => handleDeleteExam(exam.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <h3 className="text-lg font-black text-slate-900 mb-1 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{exam.title}</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{exam.className}</p>

                <div className="space-y-2 text-xs text-slate-500">
                  <div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg">
                    <span className="font-bold uppercase tracking-widest">Total Marks</span>
                    <span className="font-black text-slate-900">{exam.totalMarks}</span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg">
                    <span className="font-bold uppercase tracking-widest">Date</span>
                    <span className="font-black text-slate-900">{exam.date}</span>
                  </div>
                  {isAdmin && (
                    <div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg">
                      <span className="font-bold uppercase tracking-widest">Teacher</span>
                      <span className="font-black text-slate-900 truncate max-w-[120px]">{exam.teacherName}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="relative z-10 mt-6">
                <button onClick={() => handleOpenGrading(exam)}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                  <ClipboardCheck className="w-3.5 h-3.5" />
                  {isAdmin ? 'View Grades' : 'Enter Grades'}
                </button>
              </div>
            </Card3D>
          ))}
        </div>
      )}
    </div>
  );
}
