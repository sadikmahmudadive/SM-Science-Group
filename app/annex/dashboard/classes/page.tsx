"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { Plus, BookOpen, Users, Clock, Edit2, Trash2, X, Search, Check, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getUserProfile, UserProfile, getUsers } from "@/lib/users";
import { getAllClasses, createClass, updateClass, deleteClass, getTeacherClasses, ClassData } from "@/lib/dashboard-data";
import { Card3D } from "@/components/ui/Card3D";

const CLASSES_LIST = [
  { value: "00", label: "KG" },
  { value: "01", label: "Play" },
  { value: "02", label: "Nursery" },
  { value: "03", label: "Class-1" },
  { value: "04", label: "Class-2" },
  { value: "05", label: "Class-3" },
  { value: "06", label: "Class-4" },
  { value: "07", label: "Class-5" },
  { value: "08", label: "Class-6" },
  { value: "09", label: "Class-7" },
  { value: "10", label: "Class-8" },
  { value: "11", label: "Class-9" },
  { value: "12", label: "Class-10" },
];

export default function ClassesPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Data states
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [teachers, setTeachers] = useState<UserProfile[]>([]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    classCode: "00",
    teacherId: "",
    routineDays: [] as string[],
    routineStartTime: "10:00",
    routineEndTime: "11:30",
    studentCount: 0
  });

  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  useEffect(() => {
    async function loadData() {
      if (!user?.uid) return;
      try {
        setLoading(true);
        const p = await getUserProfile(user.uid);
        setProfile(p);

        if (p?.role === 'admin' || p?.role === 'super-admin') {
          const [classesData, teachersData] = await Promise.all([
            getAllClasses(),
            getUsers('teacher')
          ]);
          setClasses(classesData);
          setTeachers(teachersData);
        } else if (p?.role === 'teacher') {
          const classesData = await getTeacherClasses(user.uid);
          setClasses(classesData);
        }
      } catch (err) {
        console.error("Failed to load classes:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user?.uid]);

  const handleOpenModal = (cls?: ClassData) => {
    if (cls) {
      setEditingClass(cls);
      
      let routineDays: string[] = [];
      let routineStartTime = "10:00";
      let routineEndTime = "11:30";
      
      if (cls.schedule && cls.schedule.includes("|")) {
        const [daysPart, timePart] = cls.schedule.split("|").map(s => s.trim());
        routineDays = daysPart.split(",").map(s => s.trim());
        if (timePart && timePart.includes("-")) {
          const [startStr, endStr] = timePart.split("-").map(s => s.trim());
          const parseTime = (timeStr: string) => {
            if (!timeStr) return "";
            const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
            if (match) {
              let h = parseInt(match[1], 10);
              const m = match[2];
              const ampm = match[3].toUpperCase();
              if (ampm === "PM" && h < 12) h += 12;
              if (ampm === "AM" && h === 12) h = 0;
              return `${h.toString().padStart(2, '0')}:${m}`;
            }
            return timeStr;
          };
          routineStartTime = parseTime(startStr) || "10:00";
          routineEndTime = parseTime(endStr) || "11:30";
        }
      }

      setFormData({
        name: cls.name,
        classCode: cls.classCode,
        teacherId: cls.teacherId,
        routineDays,
        routineStartTime,
        routineEndTime,
        studentCount: cls.studentCount
      });
    } else {
      setEditingClass(null);
      setFormData({
        name: "",
        classCode: "00",
        teacherId: teachers.length > 0 ? teachers[0].uid : "",
        routineDays: [],
        routineStartTime: "10:00",
        routineEndTime: "11:30",
        studentCount: 0
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formatTime = (time24: string) => {
         if (!time24) return "";
         const [h, m] = time24.split(":");
         let hour = parseInt(h, 10);
         const ampm = hour >= 12 ? "PM" : "AM";
         hour = hour % 12;
         if (hour === 0) hour = 12;
         return `${hour}:${m} ${ampm}`;
      };

      const finalSchedule = `${formData.routineDays.length > 0 ? formData.routineDays.join(", ") : "TBA"} | ${formatTime(formData.routineStartTime)} - ${formatTime(formData.routineEndTime)}`;
      
      const payload = {
        name: formData.name,
        classCode: formData.classCode,
        teacherId: formData.teacherId,
        schedule: finalSchedule,
        studentCount: formData.studentCount
      };

      if (editingClass) {
        await updateClass(editingClass.id, payload);
        setClasses(classes.map(c => c.id === editingClass.id ? { ...c, ...payload } : c));
      } else {
        const id = await createClass(payload);
        setClasses([...classes, { id, ...payload }]);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to save class:", err);
      alert("Error saving class.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this class? This cannot be undone.")) return;
    try {
      await deleteClass(id);
      setClasses(classes.filter(c => c.id !== id));
    } catch (err) {
      console.error("Failed to delete class:", err);
      alert("Error deleting class.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="text-slate-500 font-medium uppercase tracking-widest text-sm">Loading classroom data...</p>
      </div>
    );
  }

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super-admin';

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 font-display">
            {isAdmin ? "Manage Classes & Routines" : "My Classes"}
          </h2>
          <p className="text-slate-500 mt-1">
            {isAdmin ? "Create classes, set schedules, and assign teachers." : "View your assigned classes and schedules."}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
          >
            <Plus className="w-4 h-4" /> Add New Class
          </button>
        )}
      </div>

      {classes.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 border-dashed">
          <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-700">No Classes Found</h3>
          <p className="text-slate-500 mt-2">
            {isAdmin ? "Click 'Add New Class' to create your first classroom." : "You have not been assigned to any classes yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map(cls => {
            const teacher = teachers.find(t => t.uid === cls.teacherId);
            const classNameLabel = CLASSES_LIST.find(c => c.value === cls.classCode)?.label || "Unknown Class";

            return (
              <Card3D key={cls.id} className="bg-white p-6 border border-slate-200 shadow-sm flex flex-col h-full relative group overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity -mr-8 -mt-8" />
                
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xl shadow-sm border border-indigo-100">
                    {cls.classCode}
                  </div>
                  {isAdmin && (
                    <div className="flex gap-2">
                      <button onClick={() => handleOpenModal(cls)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(cls.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-1 relative z-10">{cls.name}</h3>
                <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-6 relative z-10">{classNameLabel}</p>

                <div className="space-y-4 flex-1 relative z-10">
                  <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="font-medium line-clamp-2">{cls.schedule || "Schedule not set"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <Users className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="font-medium">{cls.studentCount} Students Enrolled</span>
                  </div>
                </div>

                {isAdmin && (
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between relative z-10">
                    <span className="text-xs text-slate-500 font-medium">Assigned Teacher</span>
                    <span className="text-sm font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-full">{teacher ? teacher.displayName : "Unassigned"}</span>
                  </div>
                )}
              </Card3D>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && isAdmin && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-xl font-bold text-slate-900 font-display">
                  {editingClass ? "Edit Class" : "Create New Class"}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white p-1 rounded-full shadow-sm">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700">Class Name / Subject</label>
                  <input
                    type="text" required
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Advanced Physics Part 1"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700">Class Level</label>
                    <select
                      value={formData.classCode}
                      onChange={e => setFormData({...formData, classCode: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    >
                      {CLASSES_LIST.map((cls) => (
                        <option key={cls.value} value={cls.value}>{cls.label} ({cls.value})</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700">Capacity</label>
                    <input
                      type="number" min="0"
                      value={formData.studentCount} onChange={e => setFormData({...formData, studentCount: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700">Assign Teacher</label>
                  <select
                    required
                    value={formData.teacherId}
                    onChange={e => setFormData({...formData, teacherId: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  >
                    <option value="" disabled>Select a teacher...</option>
                    {teachers.map((t) => (
                      <option key={t.uid} value={t.uid}>{t.displayName} ({t.systemId})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-4 border border-slate-200 p-4 rounded-xl bg-slate-50/50">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700">Days of the Week</label>
                    <div className="flex flex-wrap gap-2">
                      {DAYS.map(day => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            if (formData.routineDays.includes(day)) {
                              setFormData({...formData, routineDays: formData.routineDays.filter(d => d !== day)});
                            } else {
                              setFormData({...formData, routineDays: [...formData.routineDays, day]});
                            }
                          }}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                            formData.routineDays.includes(day)
                              ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                              : "bg-white text-slate-600 border-slate-300 hover:border-indigo-300"
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-700">Start Time</label>
                      <input
                        type="time" required
                        value={formData.routineStartTime} onChange={e => setFormData({...formData, routineStartTime: e.target.value})}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-700">End Time</label>
                      <input
                        type="time" required
                        value={formData.routineEndTime} onChange={e => setFormData({...formData, routineEndTime: e.target.value})}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? "Saving..." : editingClass ? "Save Changes" : "Create Class"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
