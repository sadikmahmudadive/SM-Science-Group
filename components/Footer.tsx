"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Heart, Youtube, Instagram } from "lucide-react";
import { usePathname } from "next/navigation";
import { getGlobalSettings, GlobalSettings } from "@/lib/dashboard-data";

const FOOTER_LINKS = {
  school: [
    { label: "About", href: "#" },
    { label: "Scholars Program", href: "/#scholars" },
    { label: "Curriculum", href: "#" },
    { label: "Admissions", href: "#" },
  ],
  academy: [
    { label: "Academy Programs", href: "/#academy" },
    { label: "Coaching Classes", href: "#" },
    { label: "Results", href: "#" },
    { label: "Scholarships", href: "#" },
  ],
  annex: [
    { label: "Portal Login", href: "/annex/login" },
    { label: "Attendance", href: "#" },
    { label: "Grades & Performance", href: "#" },
    { label: "Parent Contact", href: "#" },
  ],
};

export function Footer() {
  const pathname = usePathname();
  const [settings, setSettings] = useState<GlobalSettings | null>(null);

  useEffect(() => {
    async function loadSettings() {
      const data = await getGlobalSettings();
      setSettings(data);
    }
    loadSettings();
  }, []);

  return (
    <footer className="bg-slate-900 text-slate-100 py-20 relative overflow-hidden">
      {/* Abstract Background Decor */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] -z-0 translate-x-1/2 -translate-y-1/2" />
      
      <div className="container px-4 md:px-6 mx-auto w-full max-w-7xl relative z-10">
        {/* Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-12 mb-16">
          {/* Brand & Tagline */}
          <div className="md:col-span-2 lg:col-span-4 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black text-xs shadow-lg shadow-indigo-500/20">
                {settings?.institutionName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || "SM"}
              </div>
              <span className="font-black text-2xl tracking-tighter uppercase">{settings?.institutionName || "SM Science Group"}</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs font-medium">
              {settings?.tagline || "Excellence in education from foundation to mastery. Discover our school programs and dedicated coaching."}
            </p>
            <div className="flex gap-4 pt-2">
              {settings?.socialLinks?.facebook && (
                <a href={settings.socialLinks.facebook} target="_blank" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-indigo-400 hover:bg-white/10 transition-all">
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {settings?.socialLinks?.twitter && (
                <a href={settings.socialLinks.twitter} target="_blank" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-sky-400 hover:bg-white/10 transition-all">
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {settings?.socialLinks?.instagram && (
                <a href={settings.socialLinks.instagram} target="_blank" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-pink-400 hover:bg-white/10 transition-all">
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {settings?.socialLinks?.youtube && (
                <a href={settings.socialLinks.youtube} target="_blank" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-white/10 transition-all">
                  <Youtube className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* School Links */}
          <div className="lg:col-span-2">
            <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-indigo-400 mb-6">SM Scholars</h4>
            <ul className="space-y-4">
              {FOOTER_LINKS.school.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href} 
                    className="text-slate-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Academy Links */}
          <div className="lg:col-span-2">
            <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-indigo-400 mb-6">SM Academy</h4>
            <ul className="space-y-4">
              {FOOTER_LINKS.academy.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href} 
                    className="text-slate-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Annex Links */}
          <div className="lg:col-span-2">
            <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-indigo-400 mb-6">Portal</h4>
            <ul className="space-y-4">
              {FOOTER_LINKS.annex.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href} 
                    className="text-slate-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-10 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] mb-12">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Call Us</p>
              <p className="text-sm font-bold text-slate-100">{settings?.phone || "+880 1700-000000"}</p>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Email Us</p>
              <p className="text-sm font-bold text-slate-100">{settings?.email || "info@smsciencegroup.com"}</p>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Find Us</p>
              <p className="text-sm font-bold text-slate-100 line-clamp-1">{settings?.address || "Dhaka, Bangladesh"}</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-12 border-t border-white/5 gap-6">
          <div className="flex items-center gap-3">
             <div className="w-1 h-1 rounded-full bg-indigo-500" />
             <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                © {new Date().getFullYear()} {settings?.institutionName || "SM Science Group"}
             </p>
          </div>
          
          <div className="flex items-center gap-8">
            <Link href="/privacy" className="text-slate-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.1em]">Privacy Policy</Link>
            <Link href="/terms" className="text-slate-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.1em]">Terms of Service</Link>
          </div>

          <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
            Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> for Education
          </div>
        </div>
      </div>
    </footer>
  );
}
