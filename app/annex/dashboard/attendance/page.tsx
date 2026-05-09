"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, 
  Calendar, 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Save, 
  Loader2,
  Search,
  ChevronLeft
} from "lucide-react";
import { 
  getStudentsByClassCode, 
  getAllStudents,
  getTeacherClasses,
  submitAttendance, 
  getAttendanceByDate, 
  AttendanceRecord, 
  AttendanceStatus,
  ClassData
} from "@/lib/dashboard-data";
import { useAuth } from "@/lib/auth-context";
import { Card3D } from "@/components/ui/Card3D";

export default function AttendancePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [selectedClassId, setSelectedClassId] = useState<string>(searchParams.get("classId") || "");
  const [selectedClassCode, setSelectedClassCode] = useState<string>(searchParams.get("classCode") || "global");
  const [teacherClasses, setTeacherClasses] = useState<ClassData[]>([]);
  
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    async function loadClasses() {
      if (!user?.uid) return;
      const classes = await getTeacherClasses(user.uid);
      setTeacherClasses(classes);
    }
    loadClasses();
  }, [user?.uid]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        let studentList = [];
        if (selectedClassCode === "global") {
          studentList = await getAllStudents();
        } else {
          studentList = await getStudentsByClassCode(selectedClassCode);
        }
        
        const existingAttendance = await getAttendanceByDate(selectedClassId || "global", date);
        
        setStudents(studentList);
        
        if (existingAttendance) {
          const attendanceMap: Record<string, AttendanceStatus> = {};
          existingAttendance.students.forEach(s => {
            attendanceMap[s.studentId] = s.status;
          });
          setAttendance(attendanceMap);
        } else {
          const defaultMap: Record<string, AttendanceStatus> = {};
          studentList.forEach(s => {
            defaultMap[s.uid] = 'present';
          });
          setAttendance(defaultMap);
        }
      } catch (err) {
        console.error("Failed to load attendance data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [selectedClassCode, selectedClassId, date]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSave = async () => {
    if (!user || !selectedClassCode) return;
    
    setSaving(true);
    setMessage(null);
    
    const record: AttendanceRecord = {
      classId: selectedClassId || "global",
      classCode: selectedClassCode,
      date,
      teacherId: user.uid,
      students: students.map(s => ({
        studentId: s.uid,
        studentName: s.displayName,
        status: attendance[s.uid] || 'absent'
      }))
    };

    try {
      await submitAttendance(record);
      setMessage({ type: 'success', text: 'Attendance registry updated successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save attendance. Please verify your connection.' });
    } finally {
      setSaving(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.systemId && s.systemId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const stats = {
    present: Object.values(attendance).filter(s => s === 'present').length,
    absent: Object.values(attendance).filter(s => s === 'absent').length,
    late: Object.values(attendance).filter(s => s === 'late').length,
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-16 h-16 bg-indigo-50 rounded-full animate-pulse flex items-center justify-center">
            <Users className="w-8 h-8 text-indigo-600 animate-bounce" />
        </div>
        <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Loading Student Registry...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 relative">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-100 rounded-full blur-[150px] opacity-30 -z-10" />

      {/* Header Section */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => router.back()}
            className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all shadow-xl shadow-slate-200/50 hover:scale-110 active:scale-95"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-4xl font-black text-slate-900 font-display uppercase tracking-tight leading-none">Attendance Manager</h1>
            <p className="text-slate-500 font-medium text-sm mt-2 flex items-center gap-2">
              <span className="text-indigo-600 font-bold">Institutional Registry</span> • Mark attendance for all registered students
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center bg-white p-2 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/40">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                <Users className="w-4 h-4 text-slate-400" />
                <select 
                    value={selectedClassCode}
                    onChange={(e) => {
                        const code = e.target.value;
                        setSelectedClassCode(code);
                        const cls = teacherClasses.find(c => c.classCode === code);
                        setSelectedClassId(cls ? cls.id : "");
                    }}
                    className="bg-transparent text-xs font-black uppercase tracking-widest text-slate-700 outline-none cursor-pointer"
                >
                    <option value="global">Global Registry</option>
                    {teacherClasses.map(c => (
                        <option key={c.id} value={c.classCode}>{c.name} ({c.classCode})</option>
                    ))}
                </select>
            </div>

            <div className="h-10 w-px bg-slate-100 mx-2" />

            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                <Calendar className="w-4 h-4 text-slate-400" />
                <input 
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-transparent text-xs font-black uppercase tracking-widest text-slate-700 outline-none cursor-pointer"
                />
            </div>
          </div>

          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-3 bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Daily Record
          </button>
        </div>
      </div>

      {/* Stats and Search */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card3D className="bg-white/80 backdrop-blur-md p-6 border border-white shadow-xl shadow-slate-200/30 lg:col-span-1 rounded-[2rem]">
          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Daily Statistics</p>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">Present</span>
                  </div>
                  <span className="text-sm font-black text-slate-900">{stats.present}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">Absent</span>
                  </div>
                  <span className="text-sm font-black text-slate-900">{stats.absent}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">Late</span>
                  </div>
                  <span className="text-sm font-black text-slate-900">{stats.late}</span>
                </div>
              </div>
            </div>
            
            <div className="pt-6 border-t border-slate-100">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Total Students</p>
               <p className="text-2xl font-black text-slate-900">{students.length}</p>
            </div>
          </div>
        </Card3D>

        <div className="lg:col-span-3 space-y-6">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Search students by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-5 bg-white border border-slate-100 rounded-[2rem] text-sm font-medium focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-600 transition-all shadow-xl shadow-slate-200/20 outline-none"
            />
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

          <div className="bg-white/70 backdrop-blur-md border border-white shadow-2xl shadow-slate-200/40 rounded-[2.5rem] overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Information</th>
                  <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <motion.tr 
                      layout
                      key={student.uid}
                      className="group hover:bg-white transition-colors"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-500">
                            {student.displayName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{student.displayName}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div className="inline-flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100 shadow-inner">
                          <button 
                            onClick={() => handleStatusChange(student.uid, 'present')}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${attendance[student.uid] === 'present' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 scale-105' : 'text-slate-400 hover:text-slate-600'}`}
                          >
                            Present
                          </button>
                          <button 
                            onClick={() => handleStatusChange(student.uid, 'absent')}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${attendance[student.uid] === 'absent' ? 'bg-red-500 text-white shadow-lg shadow-red-200 scale-105' : 'text-slate-400 hover:text-slate-600'}`}
                          >
                            Absent
                          </button>
                          <button 
                            onClick={() => handleStatusChange(student.uid, 'late')}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${attendance[student.uid] === 'late' ? 'bg-amber-500 text-white shadow-lg shadow-amber-200 scale-105' : 'text-slate-400 hover:text-slate-600'}`}
                          >
                            Late
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="px-8 py-20 text-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                          <Users className="w-8 h-8 text-slate-200" />
                      </div>
                      <p className="text-xs text-slate-400 font-black uppercase tracking-widest">No students found matching your search</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
