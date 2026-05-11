"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, FileText, Calendar, Clock, Trash2, Edit2, 
  Search, Loader2, ChevronLeft, Save, CheckCircle2, 
  X, AlertCircle, BookOpen, GraduationCap
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getUserProfile, UserProfile } from "@/lib/users";
import { 
  createAssignment, deleteAssignment, updateAssignment, 
  getAssignmentsByTeacher, getAllAssignments,
  getAllClasses, getTeacherClasses, ClassData, Assignment
} from "@/lib/dashboard-data";
import { Card3D } from "@/components/ui/Card3D";
import { DatePicker } from "@/components/ui/DatePicker";

type View = 'list' | 'create' | 'edit';

export default function AssignmentsPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [view, setView] = useState<View>('list');
  const [searchTerm, setSearchTerm] = useState("");
  
  // Form state
  const [form, setForm] = useState({
    title: "", classId: "", type: "Homework", dueDate: new Date().toISOString().split('T')[0], description: ""
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isStaff = profile?.role === 'teacher' || profile?.role === 'admin' || profile?.role === 'super-admin';
  const isAdmin = profile?.role === 'admin' || profile?.role === 'super-admin';

  useEffect(() => {
    async function loadData() {
      if (!user?.uid) return;
      try {
        const p = await getUserProfile(user.uid);
        setProfile(p);
        
        let assignmentsData: Assignment[] = [];
        let classesData: ClassData[] = [];

        if (p?.role === 'admin' || p?.role === 'super-admin') {
          [assignmentsData, classesData] = await Promise.all([
            getAllAssignments(),
            getAllClasses()
          ]);
        } else if (p?.role === 'teacher') {
          [assignmentsData, classesData] = await Promise.all([
            getAssignmentsByTeacher(user.uid),
            getTeacherClasses(user.uid)
          ]);
        }
        
        setAssignments(assignmentsData);
        setClasses(classesData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user?.uid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    setIsSubmitting(true);
    try {
      const selectedClass = classes.find(c => c.id === form.classId);
      const data = {
        ...form,
        classCode: selectedClass?.classCode || "",
        className: selectedClass?.name || "",
        teacherId: user.uid,
        teacherName: profile.displayName,
        dueDate: new Date(form.dueDate)
      };

      if (view === 'create') {
        const id = await createAssignment(data as any);
        setAssignments([{ id, ...data } as any, ...assignments]);
      } else if (editingId) {
        await updateAssignment(editingId, data as any);
        setAssignments(assignments.map(a => a.id === editingId ? { ...a, ...data } as any : a));
      }

      setView('list');
      setForm({ title: "", classId: "", type: "Homework", dueDate: new Date().toISOString().split('T')[0], description: "" });
    } catch (err) {
      console.error(err);
      alert("Failed to save assignment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this assignment?")) return;
    try {
      await deleteAssignment(id);
      setAssignments(assignments.filter(a => a.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (assignment: Assignment) => {
    setEditingId(assignment.id);
    setForm({
      title: assignment.title,
      classId: assignment.classId,
      type: assignment.type,
      dueDate: assignment.dueDate?.seconds 
        ? new Date(assignment.dueDate.seconds * 1000).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      description: (assignment as any).description || ""
    });
    setView('edit');
  };

  const filteredAssignments = assignments.filter(a => 
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a as any).className?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="text-slate-500 font-medium uppercase tracking-widest text-sm">Syncing assignments...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-100 rounded-full blur-[150px] opacity-30 -z-10" />

      {view === 'list' ? (
        <>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-indigo-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter mb-4 shadow-lg shadow-indigo-200">
                Institutional Management
              </div>
              <h1 className="text-4xl font-black text-slate-900 font-display uppercase tracking-tight leading-none">Assignments</h1>
              <p className="text-slate-500 font-medium text-sm mt-2">
                {isStaff ? (isAdmin ? 'Monitoring all active assignments across departments.' : 'Create and manage assignments for your classes.') : 'Your current academic tasks and deadlines.'}
              </p>
            </div>
            {isStaff && !isAdmin && (
              <button 
                onClick={() => {
                  setView('create');
                  setForm({ title: "", classId: "", type: "Homework", dueDate: new Date().toISOString().split('T')[0], description: "" });
                }}
                className="flex items-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" /> New Assignment
              </button>
            )}
          </div>

          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Search assignments by title or class..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-5 bg-white border border-slate-100 rounded-[2rem] text-sm font-medium focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-600 transition-all shadow-xl shadow-slate-200/20 outline-none" 
            />
          </div>

          {filteredAssignments.length === 0 ? (
            <div className="py-20 text-center bg-white/50 backdrop-blur-sm rounded-[3rem] border border-white shadow-inner">
              <FileText className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 font-black uppercase tracking-widest text-sm">No Assignments Found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAssignments.map(a => (
                <Card3D key={a.id} className="bg-white/70 backdrop-blur-md p-6 border border-white shadow-xl shadow-slate-200/30 rounded-[2.5rem] group relative overflow-hidden flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-500">
                      <FileText className="w-6 h-6" />
                    </div>
                    {isStaff && !isAdmin && (
                      <div className="flex items-center gap-2">
                        <button onClick={() => startEdit(a)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(a.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-1">{a.title}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <BookOpen className="w-3 h-3" /> {(a as any).className || 'Unknown Class'}
                    </p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-xl">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Due Date</span>
                        <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-indigo-600" />
                          {a.dueDate?.seconds ? new Date(a.dueDate.seconds * 1000).toLocaleDateString() : 'No date'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-xl">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type</span>
                        <span className="text-[10px] font-black text-indigo-600 bg-indigo-50/50 px-2 py-0.5 rounded-full border border-indigo-100 uppercase tracking-widest">
                          {a.type}
                        </span>
                      </div>
                      {isAdmin && (
                        <div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-xl">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Teacher</span>
                          <span className="text-xs font-black text-slate-900 truncate max-w-[120px]">{(a as any).teacherName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card3D>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="flex items-center gap-6">
            <button onClick={() => setView('list')} className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all shadow-xl shadow-slate-200/50 hover:scale-110 active:scale-95">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-4xl font-black text-slate-900 font-display uppercase tracking-tight leading-none">
                {view === 'create' ? 'Create Assignment' : 'Edit Assignment'}
              </h1>
              <p className="text-slate-500 font-medium text-sm mt-2">Specify task details, deadlines, and learning objectives.</p>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-md border border-white shadow-2xl shadow-slate-200/40 rounded-[2.5rem] p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assignment Title</label>
                <input 
                  type="text" required value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-600 transition-all outline-none"
                  placeholder="e.g. Physics Chapter 3 Practice Problems"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Class</label>
                  <select 
                    required value={form.classId} onChange={e => setForm({...form, classId: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-600 transition-all outline-none"
                  >
                    <option value="" disabled>Select Class...</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name} ({c.classCode})</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Task Type</label>
                  <select 
                    value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-600 transition-all outline-none"
                  >
                    <option value="Homework">Homework</option>
                    <option value="Project">Project</option>
                    <option value="Quiz Prep">Quiz Prep</option>
                    <option value="Lab Report">Lab Report</option>
                    <option value="Reading">Reading</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Submission Deadline</label>
                <DatePicker value={form.dueDate} onChange={d => setForm({...form, dueDate: d})} />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description / Instructions</label>
                <textarea 
                  value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  rows={4}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-600 transition-all outline-none resize-none"
                  placeholder="Provide detailed instructions for the students..."
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (view === 'create' ? 'Publish Assignment' : 'Update Assignment')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
