"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Settings, 
  Save, 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube, 
  Calendar,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon
} from "lucide-react";
import { getGlobalSettings, updateGlobalSettings, GlobalSettings } from "@/lib/dashboard-data";
import { useAuth } from "@/lib/auth-context";
import { Card3D } from "@/components/ui/Card3D";

export default function SettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<GlobalSettings>({
    institutionName: "SM Science Group",
    tagline: "Empowering the Next Generation",
    email: "info@smsciencegroup.com",
    phone: "+880 1234 567890",
    address: "123 Education City, Road 4, Dhaka, Bangladesh",
    academicYear: "2026",
    socialLinks: {
      facebook: "",
      twitter: "",
      instagram: "",
      youtube: ""
    }
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await getGlobalSettings();
        if (data) setSettings(data);
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await updateGlobalSettings(settings);
      setMessage({ type: 'success', text: 'Global settings updated successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update settings. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-16 h-16 bg-indigo-50 rounded-full animate-pulse flex items-center justify-center">
            <Settings className="w-8 h-8 text-indigo-600 animate-spin-slow" />
        </div>
        <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Loading System Configuration...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 relative">
      {/* Background Blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-100 rounded-full blur-[120px] opacity-20 -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100 rounded-full blur-[120px] opacity-20 -z-10" />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 shadow-lg shadow-indigo-200">
            System Administration
          </div>
          <h1 className="text-4xl font-black text-slate-900 font-display tracking-tight leading-none uppercase">Global Settings</h1>
          <p className="text-slate-500 mt-3 font-medium">Manage institutional identity, contact information, and social presence.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Identity Section */}
          <Card3D className="bg-white/80 backdrop-blur-md p-8 border border-white shadow-2xl shadow-slate-200/40 rounded-[2.5rem]">
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-8 flex items-center gap-3">
                <Globe className="w-5 h-5 text-indigo-600" />
                Institutional Identity
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Institution Name</label>
                <input 
                  type="text"
                  value={settings.institutionName}
                  onChange={e => setSettings({...settings, institutionName: e.target.value})}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 transition-all outline-none"
                  placeholder="SM Science Group"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Academic Year</label>
                <div className="relative">
                  <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text"
                    value={settings.academicYear}
                    onChange={e => setSettings({...settings, academicYear: e.target.value})}
                    className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 transition-all outline-none"
                    placeholder="2026"
                    required
                  />
                </div>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tagline</label>
                <input 
                  type="text"
                  value={settings.tagline}
                  onChange={e => setSettings({...settings, tagline: e.target.value})}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 transition-all outline-none"
                  placeholder="Empowering the Next Generation"
                />
              </div>
            </div>
          </Card3D>

          {/* Contact Section */}
          <Card3D className="bg-white/80 backdrop-blur-md p-8 border border-white shadow-2xl shadow-slate-200/40 rounded-[2.5rem]">
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-8 flex items-center gap-3">
                <Phone className="w-5 h-5 text-indigo-600" />
                Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Public Email</label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="email"
                    value={settings.email}
                    onChange={e => setSettings({...settings, email: e.target.value})}
                    className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 transition-all outline-none"
                    placeholder="info@smsciencegroup.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text"
                    value={settings.phone}
                    onChange={e => setSettings({...settings, phone: e.target.value})}
                    className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 transition-all outline-none"
                    placeholder="+880 1234 567890"
                  />
                </div>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Physical Address</label>
                <div className="relative">
                  <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text"
                    value={settings.address}
                    onChange={e => setSettings({...settings, address: e.target.value})}
                    className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 transition-all outline-none"
                    placeholder="Dhaka, Bangladesh"
                  />
                </div>
              </div>
            </div>
          </Card3D>
        </div>

        <div className="space-y-8">
          {/* Social Links */}
          <Card3D className="bg-white/80 backdrop-blur-md p-8 border border-white shadow-2xl shadow-slate-200/40 rounded-[2.5rem]">
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-8">Social Presence</h3>
            <div className="space-y-5">
              {[
                { name: 'facebook', icon: Facebook, color: 'text-blue-600', bg: 'bg-blue-50' },
                { name: 'twitter', icon: Twitter, color: 'text-sky-500', bg: 'bg-sky-50' },
                { name: 'instagram', icon: Instagram, color: 'text-pink-600', bg: 'bg-pink-50' },
                { name: 'youtube', icon: Youtube, color: 'text-red-600', bg: 'bg-red-50' }
              ].map((social) => (
                <div key={social.name} className="space-y-2">
                  <div className="flex items-center gap-2 ml-1">
                    <div className={`w-6 h-6 rounded-lg ${social.bg} ${social.color} flex items-center justify-center`}>
                      <social.icon className="w-3.5 h-3.5" />
                    </div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{social.name}</label>
                  </div>
                  <input 
                    type="text"
                    value={(settings.socialLinks as any)[social.name] || ""}
                    onChange={e => setSettings({
                      ...settings, 
                      socialLinks: { ...settings.socialLinks, [social.name]: e.target.value }
                    })}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 transition-all outline-none"
                    placeholder={`https://${social.name}.com/...`}
                  />
                </div>
              ))}
            </div>
          </Card3D>

          {/* Action Card */}
          <div className="sticky top-10 space-y-6">
            <AnimatePresence>
                {message && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`p-6 rounded-[2rem] border shadow-2xl flex items-center gap-4 ${message.type === 'success' ? 'bg-emerald-500 text-white border-emerald-400 shadow-emerald-200' : 'bg-red-500 text-white border-red-400 shadow-red-200'}`}
                  >
                    {message.type === 'success' ? <CheckCircle2 className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
                    <div>
                        <p className="text-xs font-black uppercase tracking-widest">{message.type === 'success' ? 'All Sync' : 'Error'}</p>
                        <p className="text-[10px] font-bold opacity-90">{message.text}</p>
                    </div>
                  </motion.div>
                )}
            </AnimatePresence>

            <button 
                type="submit"
                disabled={saving}
                className="w-full py-6 bg-slate-900 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-4 shadow-2xl shadow-slate-400 hover:bg-slate-800 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Sync Global Config
            </button>

            <Card3D className="bg-indigo-600 p-8 border-none rounded-[2.5rem] text-white overflow-hidden relative shadow-2xl shadow-indigo-200">
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-3xl" />
                <div className="relative z-10">
                    <h4 className="font-black text-sm uppercase tracking-widest mb-2">Live Status</h4>
                    <p className="text-[10px] text-indigo-100 font-medium leading-relaxed">Your changes will be reflected across the public homepage and all user dashboards immediately after syncing.</p>
                </div>
            </Card3D>
          </div>
        </div>
      </form>
    </div>
  );
}
