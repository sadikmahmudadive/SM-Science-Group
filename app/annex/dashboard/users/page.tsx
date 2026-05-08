"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { Plus, User, Mail, ShieldAlert, GraduationCap, X, Check, Search, Edit2, Trash2 } from "lucide-react";
import { UserProfile, subscribeToUsers, createUserProfile, updateUserProfile, deleteUserProfile } from "@/lib/users";

const CLASSES = [
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

export default function ManageUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  const [newUser, setNewUser] = useState({ 
    name: "", 
    email: "", 
    role: "student" as "student" | "teacher" | "admin" | "super-admin",
    studentType: "S",
    studentYear: new Date().getFullYear().toString(),
    studentClass: "00"
  });
  const [editUser, setEditUser] = useState({ name: "", email: "", role: "student" as "student" | "teacher" | "admin" | "super-admin", status: "pending" as "active" | "pending" });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToUsers((data) => {
      setUsers(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let systemId = "";
      if (newUser.role === "student") {
        const prefix = `${newUser.studentType}${newUser.studentYear}${newUser.studentClass}`;
        
        // Find highest serial for this prefix
        const existingUsers = users.filter(u => u.systemId && u.systemId.startsWith(prefix));
        let maxSerial = 0;
        existingUsers.forEach(u => {
          const serialStr = u.systemId.substring(prefix.length);
          const serial = parseInt(serialStr, 10);
          if (!isNaN(serial) && serial > maxSerial) {
            maxSerial = serial;
          }
        });
        
        const nextSerial = (maxSerial + 1).toString().padStart(2, '0');
        systemId = `${prefix}${nextSerial}`;
      } else {
        const idPrefix = "TCH";
        systemId = `${idPrefix}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      }

      const tempUid = `user_${Date.now()}`;
      const generatedEmail = `${systemId.toLowerCase()}@sms.com`;

      const userPayload: any = {
        uid: tempUid,
        email: generatedEmail,
        displayName: newUser.name,
        role: newUser.role,
        status: "pending",
        systemId: systemId
      };

      if (newUser.role === "student") {
        userPayload.studentType = newUser.studentType;
        userPayload.enrollmentYear = newUser.studentYear;
        userPayload.classCode = newUser.studentClass;
      }

      await createUserProfile(userPayload);

      setIsModalOpen(false);
      setNewUser({ 
        name: "", email: "", role: "student", 
        studentType: "S", studentYear: new Date().getFullYear().toString(), studentClass: "00" 
      });
    } catch (error) {
      console.error("Failed to create user:", error);
      alert("Error creating user.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsSubmitting(true);
    try {
      await updateUserProfile(currentUser.uid, {
        displayName: editUser.name,
        email: editUser.email,
        role: editUser.role,
        status: editUser.status
      });
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Failed to update user:", error);
      alert("Error updating user.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (uid: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    try {
      await deleteUserProfile(uid);
    } catch (error) {
      console.error("Failed to delete user:", error);
      alert("Error deleting user.");
    }
  };

  const openEditModal = (user: UserProfile) => {
    setCurrentUser(user);
    setEditUser({
      name: user.displayName,
      email: user.email,
      role: user.role,
      status: user.status
    });
    setIsEditModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-400 font-bold uppercase tracking-widest animate-pulse">
        Loading User Registry...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 font-display">Manage Users</h2>
          <p className="text-slate-500 mt-1">Create and manage access for teachers and students.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add New User
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white border-b border-slate-200">
              <tr className="text-slate-500">
                <th className="p-4 text-xs font-bold uppercase tracking-widest">User Details</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest">Role</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest">System ID</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest">Status</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.uid} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${user.role === 'teacher' ? 'bg-amber-500' : 'bg-emerald-500'}`}>
                        {user.displayName.charAt(0)}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-bold text-slate-900 truncate">{user.displayName}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                      user.role === 'teacher' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    }`}>
                      {user.role === 'teacher' ? <GraduationCap className="w-3 h-3" /> : <User className="w-3 h-3" />}
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4 text-sm font-mono text-slate-600">{user.systemId}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                      user.status === 'active' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {user.status === 'active' ? <Check className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                     <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="text-indigo-600 hover:text-indigo-800 p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition-colors"
                          title="Edit User"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.uid)}
                          className="text-red-600 hover:text-red-800 p-2 rounded-lg bg-red-50 hover:bg-red-100 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-xl font-bold text-slate-900 font-display">Create New User</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white p-1 rounded-full shadow-sm">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="p-6 space-y-5">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700">Role</label>
                  <div className="flex gap-4">
                    <label className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-colors ${newUser.role === 'student' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                      <input type="radio" name="role" value="student" checked={newUser.role === 'student'} onChange={() => setNewUser({...newUser, role: 'student'})} className="sr-only" />
                      <User className={`w-6 h-6 mb-2 ${newUser.role === 'student' ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <span className={`text-sm font-bold ${newUser.role === 'student' ? 'text-emerald-900' : 'text-slate-600'}`}>Student</span>
                    </label>
                    <label className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-colors ${newUser.role === 'teacher' ? 'border-amber-500 bg-amber-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                      <input type="radio" name="role" value="teacher" checked={newUser.role === 'teacher'} onChange={() => setNewUser({...newUser, role: 'teacher'})} className="sr-only" />
                      <GraduationCap className={`w-6 h-6 mb-2 ${newUser.role === 'teacher' ? 'text-amber-600' : 'text-slate-400'}`} />
                      <span className={`text-sm font-bold ${newUser.role === 'teacher' ? 'text-amber-900' : 'text-slate-600'}`}>Teacher</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text" required
                      value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      placeholder="Enter full name"
                    />
                  </div>
                </div>

                {newUser.role === 'student' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 pt-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700">Student Type</label>
                        <select
                          value={newUser.studentType}
                          onChange={(e) => setNewUser({...newUser, studentType: e.target.value})}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        >
                          <option value="S">School (S)</option>
                          <option value="C">Coaching (C)</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700">Year</label>
                        <input
                          type="number"
                          value={newUser.studentYear}
                          onChange={(e) => setNewUser({...newUser, studentYear: e.target.value})}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-700">Class Assignment</label>
                      <select
                        value={newUser.studentClass}
                        onChange={(e) => setNewUser({...newUser, studentClass: e.target.value})}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      >
                        {CLASSES.map((cls) => (
                          <option key={cls.value} value={cls.value}>{cls.label} ({cls.value})</option>
                        ))}
                      </select>
                    </div>
                  </motion.div>
                )}

                <div className="pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? "Creating..." : `Create ${newUser.role === 'student' ? 'Student' : 'Teacher'} Account`}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit User Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-xl font-bold text-slate-900 font-display">Update User Profile</h3>
                <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white p-1 rounded-full shadow-sm">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditUser} className="p-6 space-y-5">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700">Role</label>
                  <div className="flex gap-4">
                    <label className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-colors ${editUser.role === 'student' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                      <input type="radio" name="role" value="student" checked={editUser.role === 'student'} onChange={() => setEditUser({...editUser, role: 'student'})} className="sr-only" />
                      <User className={`w-6 h-6 mb-2 ${editUser.role === 'student' ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <span className={`text-sm font-bold ${editUser.role === 'student' ? 'text-emerald-900' : 'text-slate-600'}`}>Student</span>
                    </label>
                    <label className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-colors ${editUser.role === 'teacher' ? 'border-amber-500 bg-amber-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                      <input type="radio" name="role" value="teacher" checked={editUser.role === 'teacher'} onChange={() => setEditUser({...editUser, role: 'teacher'})} className="sr-only" />
                      <GraduationCap className={`w-6 h-6 mb-2 ${editUser.role === 'teacher' ? 'text-amber-600' : 'text-slate-400'}`} />
                      <span className={`text-sm font-bold ${editUser.role === 'teacher' ? 'text-amber-900' : 'text-slate-600'}`}>Teacher</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text" required
                      value={editUser.name} onChange={(e) => setEditUser({...editUser, name: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email" required
                      value={editUser.email} onChange={(e) => setEditUser({...editUser, email: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700">Account Status</label>
                  <div className="flex gap-4">
                    <label className={`flex-1 flex items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-colors ${editUser.status === 'active' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                      <input type="radio" name="status" value="active" checked={editUser.status === 'active'} onChange={() => setEditUser({...editUser, status: 'active'})} className="sr-only" />
                      <span className={`text-sm font-bold ${editUser.status === 'active' ? 'text-blue-700' : 'text-slate-600'}`}>Active</span>
                    </label>
                    <label className={`flex-1 flex items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-colors ${editUser.status === 'pending' ? 'border-slate-500 bg-slate-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                      <input type="radio" name="status" value="pending" checked={editUser.status === 'pending'} onChange={() => setEditUser({...editUser, status: 'pending'})} className="sr-only" />
                      <span className={`text-sm font-bold ${editUser.status === 'pending' ? 'text-slate-700' : 'text-slate-600'}`}>Pending</span>
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? "Updating..." : "Save Changes"}
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
