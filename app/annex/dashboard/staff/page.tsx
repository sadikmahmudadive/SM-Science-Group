"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Edit2, Trash2, X, Image as ImageIcon, Briefcase, Mail, Phone, BookOpen, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getUserProfile, UserProfile } from "@/lib/users";
import { getPublicTeachers, createPublicTeacher, updatePublicTeacher, deletePublicTeacher, PublicTeacherProfile } from "@/lib/dashboard-data";
import { Card3D } from "@/components/ui/Card3D";

export default function ManageStaffPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [staff, setStaff] = useState<PublicTeacherProfile[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<PublicTeacherProfile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<Omit<PublicTeacherProfile, 'id'>>({
    name: "",
    subject: "",
    role: "",
    experience: "",
    phone: "",
    email: "",
    image: "",
    specialization: "",
    category: "school",
    section: ""
  });

  useEffect(() => {
    async function loadData() {
      if (!user?.uid) return;
      try {
        const p = await getUserProfile(user.uid);
        setProfile(p);
        
        if (p?.role === 'admin' || p?.role === 'super-admin') {
          const data = await getPublicTeachers();
          setStaff(data);
        }
      } catch (err) {
        console.error("Failed to load staff:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user?.uid]);

  const handleOpenModal = (s?: PublicTeacherProfile) => {
    if (s) {
      setEditingStaff(s);
      setFormData({ ...s });
    } else {
      setEditingStaff(null);
      setFormData({
        name: "",
        subject: "",
        role: "",
        experience: "",
        phone: "",
        email: "",
        image: "https://picsum.photos/seed/new/400/400",
        specialization: "",
        category: "school",
        section: "Class 1-2"
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingStaff) {
        await updatePublicTeacher(editingStaff.id, formData);
        setStaff(staff.map(s => s.id === editingStaff.id ? { id: editingStaff.id, ...formData } : s));
      } else {
        const id = await createPublicTeacher(formData);
        setStaff([...staff, { id, ...formData }]);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error saving profile:", err);
      alert("Failed to save profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this public profile?")) return;
    try {
      await deletePublicTeacher(id);
      setStaff(staff.filter(s => s.id !== id));
    } catch (err) {
      console.error("Error deleting profile:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
        <p className="text-slate-500 font-medium">Loading public profiles...</p>
      </div>
    );
  }

  if (profile?.role !== 'admin' && profile?.role !== 'super-admin') {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-800">Access Denied</h2>
        <p className="text-slate-500 mt-2">You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 font-display">Manage Public Profiles</h2>
          <p className="text-slate-500 mt-1">Update the teacher and authority details displayed on the public website.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
        >
          <Plus className="w-4 h-4" /> Add Profile
        </button>
      </div>

      {staff.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 border-dashed">
          <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-700">No Profiles Found</h3>
          <p className="text-slate-500 mt-2">Click "Add Profile" to create public teacher profiles.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staff.map(member => (
            <Card3D key={member.id} className="bg-white p-6 border border-slate-200 shadow-sm flex flex-col h-full group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity -mr-10 -mt-10" />
              
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="flex items-center gap-4">
                  <img src={member.image} alt={member.name} className="w-16 h-16 rounded-full object-cover border-2 border-indigo-100 shadow-sm" />
                  <div>
                    <h3 className="font-bold text-slate-900 leading-tight">{member.name}</h3>
                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-wide mt-1">{member.role}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <button onClick={() => handleOpenModal(member)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(member.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 relative z-10 text-sm">
                <div className="flex items-center gap-3 text-slate-600">
                  <BookOpen className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{member.subject}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{member.email}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span>{member.phone}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between relative z-10">
                <span className="text-xs font-bold text-slate-400 uppercase">{member.category}</span>
                <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded">{member.section}</span>
              </div>
            </Card3D>
          ))}
        </div>
      )}

      {/* Form Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 flex-shrink-0">
                <h3 className="text-xl font-bold text-slate-900 font-display">
                  {editingStaff ? "Edit Profile" : "Create Public Profile"}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white p-1 rounded-full shadow-sm">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                <form id="profile-form" onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-700">Full Name</label>
                      <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-indigo-500 focus:border-indigo-500 text-sm" placeholder="e.g. Dr. Jane Doe" />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-700">Role</label>
                      <input type="text" required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-indigo-500 focus:border-indigo-500 text-sm" placeholder="e.g. Head of Science Dept." />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-700">Subject</label>
                      <input type="text" required value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-indigo-500 focus:border-indigo-500 text-sm" placeholder="e.g. Physics & Chemistry" />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-700">Specialization</label>
                      <input type="text" required value={formData.specialization} onChange={e => setFormData({...formData, specialization: e.target.value})} className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-indigo-500 focus:border-indigo-500 text-sm" placeholder="e.g. Organic Chemistry" />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-700">Experience</label>
                      <input type="text" required value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-indigo-500 focus:border-indigo-500 text-sm" placeholder="e.g. 10 years" />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-700">Image URL</label>
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-slate-400" />
                        <input type="url" required value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-indigo-500 focus:border-indigo-500 text-sm" placeholder="https://..." />
                      </div>
                    </div>
                  </div>

                  <hr className="border-slate-100" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-700">Email Contact</label>
                      <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-indigo-500 focus:border-indigo-500 text-sm" />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-700">Phone Contact</label>
                      <input type="text" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-indigo-500 focus:border-indigo-500 text-sm" />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-700">Category</label>
                      <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as 'school'|'academy'})} className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-indigo-500 focus:border-indigo-500 text-sm">
                        <option value="school">School Branch</option>
                        <option value="academy">Coaching Academy</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-700">Section Header</label>
                      <input type="text" required value={formData.section} onChange={e => setFormData({...formData, section: e.target.value})} className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-indigo-500 focus:border-indigo-500 text-sm" placeholder="e.g. Class 1-2 OR Science Coaching" />
                    </div>
                  </div>
                </form>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50 flex-shrink-0">
                <button
                  type="submit"
                  form="profile-form"
                  disabled={isSubmitting}
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : editingStaff ? "Save Changes" : "Create Profile"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
