"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Suspense } from "react";
import { Megaphone, Plus, Trash2, Calendar, User, Edit2, Clock, Target, FileText, X } from "lucide-react";
import { Announcement, subscribeToAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement, UserRole, AnnouncementStatus } from "@/lib/announcements";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { useAuth } from "@/lib/auth-context";
import { RichTextEditor } from "@/components/RichTextEditor";
import { DateTimePicker } from "@/components/DateTimePicker";

function AnnouncementsContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "admin";
  const isAdmin = role === "admin" || user?.role === "admin" || user?.role === "super-admin";

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [richContent, setRichContent] = useState("");
  const [status, setStatus] = useState<AnnouncementStatus>("published");
  const [scheduledFor, setScheduledFor] = useState("");
  const [targetRoles, setTargetRoles] = useState<UserRole[]>(["admin", "teacher", "student"]);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToAnnouncements((data) => {
      setAnnouncements(data);
    }, isAdmin ? "admin" : role as UserRole);
    return () => unsubscribe();
  }, [isAdmin, role]);

  const resetForm = () => {
    setTitle("");
    setContent("");
    setRichContent("");
    setStatus("published");
    setScheduledFor("");
    setTargetRoles(["admin", "teacher", "student"]);
    setAttachments([]);
    setEditingId(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || (!content && !richContent)) return;

    setIsSubmitting(true);
    try {
      if (editingId) {
        await updateAnnouncement(editingId, {
          title,
          content,
          richContent,
          status,
          scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
          targetRoles,
          attachments: attachments.map((url, idx) => ({
            url,
            name: `attachment-${idx}`,
            type: "file",
            uploadedAt: new Date()
          })),
          editedBy: user?.displayName || "Admin"
        });
      } else {
        await createAnnouncement({
          title,
          content,
          richContent,
          status,
          scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
          targetRoles,
          attachments: attachments.map((url, idx) => ({
            url,
            name: `attachment-${idx}`,
            type: "file",
            uploadedAt: new Date()
          })),
          authorId: user?.uid || "admin",
          authorName: user?.displayName || "Admin"
        });
      }
      resetForm();
      setShowCreateForm(false);
    } catch (error) {
      console.error("Failed to save announcement:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAnnouncement(id);
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Failed to delete announcement:", error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await uploadImageToCloudinary(file);
      setAttachments([...attachments, url]);
    } catch (error) {
      console.error("Failed to upload file:", error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Megaphone className="w-8 h-8 text-indigo-600" />
            ANNOUNCEMENTS
          </h1>
          <p className="text-slate-500 mt-2">Manage campus communications and updates</p>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              resetForm();
              setShowCreateForm(!showCreateForm);
            }}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
          >
            {showCreateForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {showCreateForm ? "Cancel" : "New Announcement"}
          </button>
        )}
      </div>

      <AnimatePresence>
        {showCreateForm && isAdmin && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-8"
          >
            <form 
              onSubmit={handleCreate}
              className="bg-white p-8 rounded-2xl border-2 border-indigo-100 shadow-lg space-y-6"
            >
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Announcement title"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                  Content (with formatting)
                </label>
                <RichTextEditor value={content} onChange={setContent} placeholder="Enter announcement content" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as AnnouncementStatus)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Publish Now</option>
                    <option value="scheduled">Schedule for Later</option>
                    <option value="archived">Archive</option>
                  </select>
                </div>

                {status === "scheduled" && (
                  <DateTimePicker value={scheduledFor} onChange={setScheduledFor} label="Schedule For" />
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">
                  <Target className="w-4 h-4" /> Target Roles
                </label>
                <div className="flex flex-wrap gap-3">
                  {(["admin", "teacher", "student"] as UserRole[]).map(r => (
                    <label key={r} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={targetRoles.includes(r)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setTargetRoles([...targetRoles, r]);
                          } else {
                            setTargetRoles(targetRoles.filter(role => role !== r));
                          }
                        }}
                        className="w-4 h-4 rounded border-slate-300"
                      />
                      <span className="text-sm font-medium text-slate-700 capitalize">{r}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                  <FileText className="w-4 h-4" /> Attachments
                </label>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                />
                {attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {attachments.map((url, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
                        <span className="text-sm text-slate-600 truncate">{url.split("/").pop()}</span>
                        <button
                          type="button"
                          onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowCreateForm(false);
                  }}
                  className="px-6 py-3 rounded-xl border border-slate-200 font-bold hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  disabled={isSubmitting}
                  className={`px-8 py-3 rounded-xl font-bold text-white ${isSubmitting ? 'opacity-50 cursor-not-allowed bg-indigo-500' : 'bg-indigo-600 hover:bg-indigo-700'} transition-all shadow-lg shadow-indigo-100`}
                >
                  {isSubmitting ? "Saving..." : editingId ? "Update" : "Post"}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        {announcements.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Megaphone className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">No announcements yet</h3>
            <p className="text-slate-500 max-w-xs mx-auto mt-2">
              Check back later for campus-wide announcements.
            </p>
          </div>
        ) : (
          announcements.map((announcement, index) => (
            <motion.div
              key={announcement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50 transition-all duration-300"
            >
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {announcement.title}
                    </h2>
                    {announcement.richContent && (
                      <div className="mt-3 prose prose-sm max-w-none text-slate-600">
                        {announcement.content && <p>{announcement.content}</p>}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                      announcement.status === 'published' ? 'bg-green-50 text-green-600' :
                      announcement.status === 'scheduled' ? 'bg-blue-50 text-blue-600' :
                      announcement.status === 'draft' ? 'bg-yellow-50 text-yellow-600' :
                      'bg-slate-50 text-slate-600'
                    }`}>
                      {announcement.status}
                    </div>
                  </div>
                </div>
                
                {announcement.scheduledFor && (
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>Scheduled for {new Date(announcement.scheduledFor.toDate?.()).toLocaleString()}</span>
                  </div>
                )}

                {announcement.targetRoles.length > 0 && (
                  <div className="flex items-center gap-2 text-slate-500 text-sm flex-wrap">
                    <Target className="w-4 h-4" />
                    <span>{announcement.targetRoles.join(", ")}</span>
                  </div>
                )}

                {announcement.attachments.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {announcement.attachments.map((att, idx) => (
                      <a
                        key={idx}
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors"
                      >
                        <FileText className="w-3 h-3" />
                        {att.name}
                      </a>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-3 text-slate-400 text-xs">
                    <User className="w-3 h-3" />
                    <span className="font-bold">{announcement.authorName || announcement.authorId}</span>
                    <span>•</span>
                    <Calendar className="w-3 h-3" />
                    <span>{announcement.createdAt?.toDate?.() ? 
                      new Date(announcement.createdAt.toDate()).toLocaleDateString() : 
                      'Today'}</span>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingId(announcement.id);
                          setTitle(announcement.title);
                          setContent(announcement.content);
                          setRichContent(announcement.richContent || "");
                          setStatus(announcement.status);
                          setScheduledFor(announcement.scheduledFor ? new Date(announcement.scheduledFor.toDate?.()).toISOString().slice(0, 16) : "");
                          setTargetRoles(
                            announcement.targetRoles.includes("all")
                              ? (["admin", "teacher", "student"] as UserRole[])
                              : (announcement.targetRoles as UserRole[])
                          );
                          setAttachments(announcement.attachments.map(a => a.url));
                          setShowCreateForm(true);
                        }}
                        className="p-2 hover:bg-indigo-50 rounded-lg transition-colors text-slate-600 hover:text-indigo-600"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(announcement.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors text-slate-600 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <AnimatePresence>
                {deleteConfirm === announcement.id && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center p-4"
                  >
                    <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full">
                      <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Announcement?</h3>
                      <p className="text-slate-600 mb-6">This action cannot be undone.</p>
                      <div className="flex gap-3 justify-end">
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-4 py-2 rounded-lg border border-slate-200 font-bold hover:bg-slate-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDelete(announcement.id)}
                          className="px-4 py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

export default function AnnouncementsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading announcements...</div>}>
      <AnnouncementsContent />
    </Suspense>
  );
}
