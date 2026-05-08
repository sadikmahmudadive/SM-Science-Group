"use client";

import { motion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { Mail, Phone, Award, BookOpen, Users, Briefcase, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { getPublicTeachers, PublicTeacherProfile } from "@/lib/dashboard-data";

// Comprehensive teacher database organized by class and section
const TEACHERS_DATA = {
  school: [
    {
      class: "Class 1-2",
      teachers: [
        { id: 1, name: "Mrs. Priya Sharma", subject: "All Subjects", role: "Class Teacher", experience: "8 years", phone: "+880 1700-001001", email: "priya.sharma@sm.edu.bd", image: "https://picsum.photos/seed/teacher_s1/400/400", specialization: "Early Childhood Education" },
        { id: 2, name: "Mr. Rahul Gupta", subject: "Mathematics & Science", role: "Subject Teacher", experience: "6 years", phone: "+880 1700-001002", email: "rahul.gupta@sm.edu.bd", image: "https://picsum.photos/seed/teacher_s2/400/400", specialization: "STEM Education" },
      ]
    },
    {
      class: "Class 3-4",
      teachers: [
        { id: 3, name: "Sarah Jenkins", subject: "English & Literature", role: "Class Coordinator", experience: "10 years", phone: "+880 1700-001003", email: "sarah.jenkins@sm.edu.bd", image: "https://picsum.photos/seed/teacher1/400/400", specialization: "Language Development" },
        { id: 4, name: "David Rahman", subject: "Mathematics", role: "Head of Mathematics", experience: "12 years", phone: "+880 1700-001004", email: "david.rahman@sm.edu.bd", image: "https://picsum.photos/seed/teacher2/400/400", specialization: "Problem Solving Techniques" },
        { id: 5, name: "Fatima Begum", subject: "Science", role: "Science Teacher", experience: "7 years", phone: "+880 1700-001005", email: "fatima.begum@sm.edu.bd", image: "https://picsum.photos/seed/teacher_s3/400/400", specialization: "Experimental Science" },
      ]
    },
    {
      class: "Class 5-6",
      teachers: [
        { id: 6, name: "Ayesha Siddiqua", subject: "English Literature", role: "Class Coordinator", experience: "9 years", phone: "+880 1700-001006", email: "ayesha.siddiqua@sm.edu.bd", image: "https://picsum.photos/seed/teacher3/400/400", specialization: "Creative Writing" },
        { id: 7, name: "Mohammad Hasan", subject: "Mathematics", role: "Senior Teacher", experience: "11 years", phone: "+880 1700-001007", email: "mohammad.hasan@sm.edu.bd", image: "https://picsum.photos/seed/teacher_s4/400/400", specialization: "Algebra & Geometry" },
        { id: 8, name: "Karim Ahmed", subject: "Science", role: "Lab In-charge", experience: "8 years", phone: "+880 1700-001008", email: "karim.ahmed@sm.edu.bd", image: "https://picsum.photos/seed/teacher_s5/400/400", specialization: "Physics & Chemistry" },
      ]
    },
    {
      class: "Class 7-8",
      teachers: [
        { id: 9, name: "Michael Chang", subject: "Computer Science", role: "Tech Educator", experience: "7 years", phone: "+880 1700-001009", email: "michael.chang@sm.edu.bd", image: "https://picsum.photos/seed/teacher4/400/400", specialization: "Coding & Programming" },
        { id: 10, name: "Dr. Nasrin Islam", subject: "Science", role: "Head of Science Dept.", experience: "13 years", phone: "+880 1700-001010", email: "nasrin.islam@sm.edu.bd", image: "https://picsum.photos/seed/teacher_s6/400/400", specialization: "Physics, Chemistry, Biology" },
        { id: 11, name: "Iqbal Khan", subject: "Social Studies", role: "History Teacher", experience: "9 years", phone: "+880 1700-001011", email: "iqbal.khan@sm.edu.bd", image: "https://picsum.photos/seed/teacher_s7/400/400", specialization: "World History & Geography" },
      ]
    },
  ],
  academy: [
    {
      section: "Mathematics Coaching",
      teachers: [
        { id: 12, name: "Dr. Anisur Rahman", subject: "Higher Math & Physics", role: "Lead Instructor", experience: "15 years", phone: "+880 1700-002001", email: "anisur.rahman@sm.edu.bd", image: "https://picsum.photos/seed/teacher5/400/400", specialization: "Advanced Mathematics & IIT Prep" },
        { id: 13, name: "Prof. Nasser Uddin", subject: "Mathematics", role: "Senior Coach", experience: "14 years", phone: "+880 1700-002002", email: "nasser.uddin@sm.edu.bd", image: "https://picsum.photos/seed/teacher_a1/400/400", specialization: "Calculus & Algebra" },
      ]
    },
    {
      section: "Science Coaching",
      teachers: [
        { id: 14, name: "Nadia Islam", subject: "Chemistry", role: "Senior Coach", experience: "11 years", phone: "+880 1700-002003", email: "nadia.islam@sm.edu.bd", image: "https://picsum.photos/seed/teacher6/400/400", specialization: "Organic & Inorganic Chemistry" },
        { id: 15, name: "Kamrul Hasan", subject: "Biology", role: "Medical Prep Guide", experience: "10 years", phone: "+880 1700-002004", email: "kamrul.hasan@sm.edu.bd", image: "https://picsum.photos/seed/teacher7/400/400", specialization: "Medical Science Preparation" },
        { id: 16, name: "Farhana Ahmed", subject: "Physics", role: "Engineering Prep Guide", experience: "9 years", phone: "+880 1700-002005", email: "farhana.ahmed@sm.edu.bd", image: "https://picsum.photos/seed/teacher8/400/400", specialization: "Engineering Physics" },
      ]
    },
    {
      section: "English Coaching",
      teachers: [
        { id: 17, name: "Mrs. Amina Hossain", subject: "English", role: "English Coach", experience: "10 years", phone: "+880 1700-002006", email: "amina.hossain@sm.edu.bd", image: "https://picsum.photos/seed/teacher_a2/400/400", specialization: "English Grammar & Literature" },
      ]
    },
  ]
};

function TeacherCard({ teacher }: { teacher: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-lg transition-shadow"
    >
      <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
        <Image
          src={teacher.image}
          alt={teacher.name}
          fill
          className="object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
      
      <div className="p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-1">{teacher.name}</h3>
        <p className="text-indigo-600 font-medium text-sm mb-3">{teacher.role}</p>
        
        <div className="space-y-2 mb-4 text-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <BookOpen className="w-4 h-4" />
            <span>{teacher.subject}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Briefcase className="w-4 h-4" />
            <span>{teacher.experience}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Award className="w-4 h-4" />
            <span>{teacher.specialization}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 space-y-2 text-sm">
          <div className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors">
            <Mail className="w-4 h-4" />
            <a href={`mailto:${teacher.email}`}>{teacher.email}</a>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Phone className="w-4 h-4" />
            <a href={`tel:${teacher.phone}`}>{teacher.phone}</a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function TeachersPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"school" | "academy">("school");
  const [teachersData, setTeachersData] = useState<{ school: any[], academy: any[] }>({ school: [], academy: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getPublicTeachers();
        
        if (data.length === 0) {
          // Fallback to static if empty
          setTeachersData(TEACHERS_DATA);
        } else {
          const schoolTeachers = data.filter(t => t.category === "school");
          const academyTeachers = data.filter(t => t.category === "academy");
          
          const groupBySection = (arr: PublicTeacherProfile[]) => {
            const groups: Record<string, PublicTeacherProfile[]> = {};
            arr.forEach(t => {
              if (!groups[t.section]) groups[t.section] = [];
              groups[t.section].push(t);
            });
            return Object.keys(groups).map(key => ({ class: key, section: key, teachers: groups[key] }));
          };
          
          setTeachersData({
            school: groupBySection(schoolTeachers),
            academy: groupBySection(academyTeachers)
          });
        }
      } catch (err) {
        setTeachersData(TEACHERS_DATA);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const pageScale = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0.95, 1, 1, 0.95]);
  const pageOpacity = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0.8, 1, 1, 0.8]);

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-24 overflow-hidden">
      <motion.div 
        ref={containerRef}
        style={{ scale: pageScale, opacity: pageOpacity }}
        className="container px-4 md:px-6 mx-auto w-full max-w-7xl"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold font-display text-slate-900 mb-4">
            Our Faculty & Coaches
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Meet our team of experienced educators and expert coaches dedicated to shaping the future leaders and achievers.
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-12">
          <div className="flex bg-slate-200 p-2 rounded-full">
            <button
              onClick={() => setActiveTab("school")}
              className={`px-8 py-3 rounded-full font-bold transition-all ${
                activeTab === "school"
                  ? "bg-white text-indigo-600 shadow-md"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              SM Scholars
            </button>
            <button
              onClick={() => setActiveTab("academy")}
              className={`px-8 py-3 rounded-full font-bold transition-all ${
                activeTab === "academy"
                  ? "bg-white text-indigo-600 shadow-md"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              SM Academy
            </button>
          </div>
        </div>

        {/* Teachers List by Section */}
        {loading ? (
          <div className="flex justify-center items-center py-32">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
          </div>
        ) : (
          <div className="space-y-16">
            {activeTab === "school" ? (
              // School Teachers
              teachersData.school.map((section, idx) => (
              <motion.div
                key={section.class}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="w-6 h-6 text-indigo-600" />
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900">{section.class}</h2>
                  </div>
                  <div className="h-1 w-20 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {section.teachers.map((teacher) => (
                    <TeacherCard key={teacher.id} teacher={teacher} />
                  ))}
                </div>
              </motion.div>
            ))
          ) : (
            // Academy Teachers
            teachersData.academy.map((section, idx) => (
              <motion.div
                key={section.section}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-2">
                    <Award className="w-6 h-6 text-indigo-600" />
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900">{section.section}</h2>
                  </div>
                  <div className="h-1 w-20 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {section.teachers.map((teacher) => (
                    <TeacherCard key={teacher.id} teacher={teacher} />
                  ))}
                </div>
              </motion.div>
            ))
          )}
        </div>
        )}

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 py-12 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl border border-indigo-200"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-indigo-600 mb-2">20+</p>
              <p className="text-slate-600">Expert Teachers</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-indigo-600 mb-2">120+ Hrs</p>
              <p className="text-slate-600">Average Teaching Experience</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-indigo-600 mb-2">95%</p>
              <p className="text-slate-600">Student Satisfaction</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
