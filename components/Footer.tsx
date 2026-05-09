"use client";

import Link from "next/link";
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Heart } from "lucide-react";
import { usePathname } from "next/navigation";

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
  const isTeachersPage = pathname === "/teachers";

  return (
    <footer className="bg-slate-900 text-slate-100 py-16">
      <div className="container px-4 md:px-6 mx-auto w-full max-w-7xl">
        {/* Teachers Section - Hidden on teachers page */}
        {!isTeachersPage && (
          <div className="mb-16 pb-16 border-b border-slate-800">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold font-display">Our Faculty</h3>
              <Link 
                href="/teachers" 
                className="text-indigo-400 hover:text-indigo-300 font-medium text-sm flex items-center gap-2"
              >
                View All Teachers →
              </Link>
            </div>
            <p className="text-slate-400 mb-6 max-w-2xl">
              Meet our experienced educators and expert coaches dedicated to excellence in education.
            </p>
          </div>
        )}

        {/* Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                SM
              </div>
              <span className="font-bold text-lg">Science Group</span>
            </div>
            <p className="text-slate-400 text-sm mb-6">
              Excellence in education from foundation to mastery.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-slate-400 hover:text-indigo-400 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-indigo-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-indigo-400 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* School Links */}
          <div>
            <h4 className="font-bold mb-4">SM Scholars</h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.school.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href} 
                    className="text-slate-400 hover:text-indigo-400 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Academy Links */}
          <div>
            <h4 className="font-bold mb-4">SM Academy</h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.academy.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href} 
                    className="text-slate-400 hover:text-indigo-400 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Annex Links */}
          <div>
            <h4 className="font-bold mb-4">SM-Annex Portal</h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.annex.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href} 
                    className="text-slate-400 hover:text-indigo-400 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 pb-12 border-b border-slate-800">
          <div className="flex gap-4">
            <Phone className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-1" />
            <div>
              <p className="text-sm text-slate-400">Phone</p>
              <p className="text-slate-100">+880 1700-000000</p>
            </div>
          </div>
          <div className="flex gap-4">
            <Mail className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-1" />
            <div>
              <p className="text-sm text-slate-400">Email</p>
              <p className="text-slate-100">info@smsciencegroup.edu.bd</p>
            </div>
          </div>
          <div className="flex gap-4">
            <MapPin className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-1" />
            <div>
              <p className="text-sm text-slate-400">Location</p>
              <p className="text-slate-100">Dhaka, Bangladesh</p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between">
          <p className="text-slate-400 text-sm mb-4 md:mb-0">
            © 2024 SM Science Group. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> for Education
          </div>
        </div>
      </div>
    </footer>
  );
}
