"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Clock, CheckCircle2, XCircle, Search, Calendar, Check, X, ShieldAlert, Loader2 } from "lucide-react";
import { getAllTeacherAttendance, updateTeacherAttendanceStatus, TeacherSelfAttendanceRecord } from "@/lib/dashboard-data";
import { useAuth } from "@/lib/auth-context";
import { getUserProfile, UserProfile } from "@/lib/users";

export default function TeacherAttendanceAdminPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [records, setRecords] = useState<TeacherSelfAttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!user?.uid) return;
      try {
        const p = await getUserProfile(user.uid);
        setProfile(p);
        if (p?.role === 'admin' || p?.role === 'super-admin') {
          const data = await getAllTeacherAttendance();
          setRecords(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user?.uid]);

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    setUpdatingId(id);
    try {
      await updateTeacherAttendanceStatus(id, status);
      setRecords(records.map(r => r.id === id ? { ...r, status } : r));
    } catch (e) {
      console.error(e);
      alert("Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredRecords = records.filter(r => 
    r.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.date.includes(searchTerm)
  );

  const pendingCount = records.filter(r => r.status === 'pending').length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
        <p className="text-slate-500 font-medium uppercase tracking-widest text-sm">Loading attendance logs...</p>
      </div>
    );
  }

  if (profile?.role !== 'admin' && profile?.role !== 'super-admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 text-center">
        <ShieldAlert className="w-16 h-16 text-red-500" />
        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Access Restricted</h2>
        <p className="text-slate-500 font-medium">You do not have administrative privileges to view this page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100 rounded-full blur-[150px] opacity-30 -z-10" />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-emerald-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter mb-4 shadow-lg shadow-emerald-200">
            Admin Panel
          </div>
          <h1 className="text-4xl font-black text-slate-900 font-display uppercase tracking-tight leading-none">Teacher Attendance</h1>
          <p className="text-slate-500 font-medium text-sm mt-2">
            Review and validate faculty duty hours and class logs.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/40">
           <div className="px-6 py-3 bg-amber-50 rounded-xl border border-amber-100 text-center">
              <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Pending Review</p>
              <p className="text-2xl font-black text-amber-700">{pendingCount}</p>
           </div>
           <div className="h-10 w-px bg-slate-100 mx-2" />
           <div className="px-6 py-3 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Total Logs</p>
              <p className="text-2xl font-black text-emerald-700">{records.length}</p>
           </div>
        </div>
      </div>

      <div className="relative group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-emerald-600 transition-colors" />
        <input 
          type="text" 
          placeholder="Search by teacher name or date (YYYY-MM-DD)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-14 pr-6 py-5 bg-white border border-slate-100 rounded-[2rem] text-sm font-medium focus:ring-4 focus:ring-emerald-50/50 focus:border-emerald-600 transition-all shadow-xl shadow-slate-200/20 outline-none"
        />
      </div>

      <div className="bg-white/70 backdrop-blur-md border border-white shadow-2xl shadow-slate-200/40 rounded-[2.5rem] overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Teacher</th>
              <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
              <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Duty Hours</th>
              <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Classes</th>
              <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredRecords.length > 0 ? (
              filteredRecords.map((record) => (
                <motion.tr 
                  layout
                  key={record.id}
                  className="group hover:bg-white transition-colors"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-sm shadow-inner">
                        {record.teacherName.charAt(0)}
                      </div>
                      <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{record.teacherName}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {record.date}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                      <Clock className="w-4 h-4 text-slate-400" />
                      {record.startTime} - {record.endTime}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="inline-flex w-8 h-8 rounded-lg bg-slate-100 items-center justify-center font-black text-slate-700 text-sm">
                      {record.classesConducted}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    {record.status === 'pending' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest border border-amber-200">
                        Pending
                      </span>
                    )}
                    {record.status === 'approved' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Approved
                      </span>
                    )}
                    {record.status === 'rejected' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest border border-red-200">
                        <XCircle className="w-3 h-3" /> Rejected
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {updatingId === record.id ? (
                        <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                      ) : (
                        <>
                          {record.status !== 'approved' && (
                            <button 
                              onClick={() => handleUpdateStatus(record.id!, 'approved')}
                              className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl transition-colors shadow-sm"
                              title="Approve"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          {record.status !== 'rejected' && (
                            <button 
                              onClick={() => handleUpdateStatus(record.id!, 'rejected')}
                              className="p-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-colors shadow-sm"
                              title="Reject"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-8 py-20 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                      <Clock className="w-8 h-8 text-slate-200" />
                  </div>
                  <p className="text-xs text-slate-400 font-black uppercase tracking-widest">No attendance records found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
