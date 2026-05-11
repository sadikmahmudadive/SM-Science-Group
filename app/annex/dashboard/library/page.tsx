"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, Book, Search, Loader2, Trash2, Edit2, 
  ChevronLeft, BookOpen, Bookmark, Hash, MapPin, 
  Layers, CheckCircle2, X
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getUserProfile, UserProfile } from "@/lib/users";
import { 
  getAllBooks, createBook, updateBook, deleteBook, Book as BookType
} from "@/lib/dashboard-data";
import { Card3D } from "@/components/ui/Card3D";

type View = 'list' | 'create' | 'edit';

export default function LibraryPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState<BookType[]>([]);
  const [view, setView] = useState<View>('list');
  const [searchTerm, setSearchTerm] = useState("");
  
  // Form state
  const [form, setForm] = useState({
    title: "", author: "", category: "General", status: "available" as BookType['status'], 
    totalCopies: 1, availableCopies: 1, location: "", isbn: ""
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super-admin';

  useEffect(() => {
    async function loadData() {
      if (!user?.uid) return;
      try {
        const [p, booksData] = await Promise.all([
          getUserProfile(user.uid),
          getAllBooks()
        ]);
        setProfile(p);
        setBooks(booksData);
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
    setIsSubmitting(true);
    try {
      if (view === 'create') {
        const id = await createBook(form);
        setBooks([{ id, ...form }, ...books]);
      } else if (editingId) {
        await updateBook(editingId, form);
        setBooks(books.map(b => b.id === editingId ? { ...b, ...form } : b));
      }
      setView('list');
      setForm({ title: "", author: "", category: "General", status: "available", totalCopies: 1, availableCopies: 1, location: "", isbn: "" });
    } catch (err) {
      console.error(err);
      alert("Failed to save book.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this book from the library?")) return;
    try {
      await deleteBook(id);
      setBooks(books.filter(b => b.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (book: BookType) => {
    setEditingId(book.id);
    setForm({
      title: book.title,
      author: book.author,
      category: book.category,
      status: book.status,
      totalCopies: book.totalCopies,
      availableCopies: book.availableCopies,
      location: book.location || "",
      isbn: book.isbn || ""
    });
    setView('edit');
  };

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="text-slate-500 font-medium uppercase tracking-widest text-sm">Organizing library collection...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100 rounded-full blur-[150px] opacity-30 -z-10" />

      {view === 'list' ? (
        <>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter mb-4 shadow-lg shadow-emerald-200">
                Resource Management
              </div>
              <h1 className="text-4xl font-black text-slate-900 font-display uppercase tracking-tight leading-none">Library Vault</h1>
              <p className="text-slate-500 font-medium text-sm mt-2">
                {isAdmin ? 'Manage institutional books, resources, and availability.' : 'Explore and reserve available learning materials.'}
              </p>
            </div>
            {isAdmin && (
              <button 
                onClick={() => {
                  setView('create');
                  setForm({ title: "", author: "", category: "General", status: "available", totalCopies: 1, availableCopies: 1, location: "", isbn: "" });
                }}
                className="flex items-center gap-3 bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" /> Add Book
              </button>
            )}
          </div>

          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-emerald-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Search by title, author, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-5 bg-white border border-slate-100 rounded-[2rem] text-sm font-medium focus:ring-4 focus:ring-emerald-50/50 focus:border-emerald-600 transition-all shadow-xl shadow-slate-200/20 outline-none" 
            />
          </div>

          {filteredBooks.length === 0 ? (
            <div className="py-20 text-center bg-white/50 backdrop-blur-sm rounded-[3rem] border border-white shadow-inner">
              <Book className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 font-black uppercase tracking-widest text-sm">No Books Found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBooks.map(b => (
                <Card3D key={b.id} className="bg-white/70 backdrop-blur-md p-6 border border-white shadow-xl shadow-slate-200/30 rounded-[2.5rem] group relative overflow-hidden flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-500">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    {isAdmin && (
                      <div className="flex items-center gap-2">
                        <button onClick={() => startEdit(b)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(b.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-1">{b.title}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Bookmark className="w-3 h-3 text-emerald-600" /> {b.author}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-slate-50 p-3 rounded-xl">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Layers className="w-2.5 h-2.5" /> Category</p>
                            <p className="text-xs font-black text-slate-900">{b.category}</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><MapPin className="w-2.5 h-2.5" /> Location</p>
                            <p className="text-xs font-black text-slate-900">{b.location || 'N/A'}</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between bg-slate-50 px-4 py-3 rounded-xl">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Availability</span>
                            <span className="text-xs font-black text-slate-900">{b.availableCopies} / {b.totalCopies} Copies</span>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                            b.status === 'available' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                            b.status === 'borrowed' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                            'bg-red-50 text-red-600 border-red-200'
                        }`}>{b.status}</span>
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
            <button onClick={() => setView('list')} className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-all shadow-xl shadow-slate-200/50 hover:scale-110 active:scale-95">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-4xl font-black text-slate-900 font-display uppercase tracking-tight leading-none">
                {view === 'create' ? 'Add Resource' : 'Update Resource'}
              </h1>
              <p className="text-slate-500 font-medium text-sm mt-2">Enter book details to update the institutional inventory.</p>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-md border border-white shadow-2xl shadow-slate-200/40 rounded-[2.5rem] p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Book Title</label>
                <input 
                  type="text" required value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-emerald-50/50 focus:border-emerald-600 transition-all outline-none"
                  placeholder="e.g. Advanced Mathematics Vol. 1"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Author Name</label>
                  <input 
                    type="text" required value={form.author} onChange={e => setForm({...form, author: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-emerald-50/50 focus:border-emerald-600 transition-all outline-none"
                    placeholder="e.g. Dr. Sadik Mahmud"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                  <input 
                    type="text" required value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-emerald-50/50 focus:border-emerald-600 transition-all outline-none"
                    placeholder="e.g. Science, Fiction, etc."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Total Copies</label>
                  <input 
                    type="number" min="1" required value={form.totalCopies} onChange={e => setForm({...form, totalCopies: parseInt(e.target.value) || 1, availableCopies: parseInt(e.target.value) || 1})}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-emerald-50/50 focus:border-emerald-600 transition-all outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                  <select 
                    value={form.status} onChange={e => setForm({...form, status: e.target.value as BookType['status']})}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-emerald-50/50 focus:border-emerald-600 transition-all outline-none"
                  >
                    <option value="available">Available</option>
                    <option value="borrowed">Borrowed</option>
                    <option value="reserved">Reserved</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Location / Shelf</label>
                  <input 
                    type="text" value={form.location} onChange={e => setForm({...form, location: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-emerald-50/50 focus:border-emerald-600 transition-all outline-none"
                    placeholder="e.g. Shelf B-4"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (view === 'create' ? 'Add to Vault' : 'Update Details')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
