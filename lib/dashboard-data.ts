import { collection, query, where, getDocs, orderBy, limit, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { getDb } from './firebase';

export interface ClassData {
  id: string;
  name: string;
  teacherId: string;
  classCode: string;
  schedule: string;
  studentCount: number;
}

export interface Assignment {
  id: string;
  title: string;
  classId: string;
  dueDate: any;
  type: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  assignmentTitle: string;
  submittedAt: any;
}

export type AttendanceStatus = 'present' | 'absent' | 'late';

export interface AttendanceRecord {
  id?: string;
  classId: string;
  classCode: string;
  date: string; // ISO date string YYYY-MM-DD
  teacherId: string;
  students: {
    studentId: string;
    studentName: string;
    status: AttendanceStatus;
  }[];
  createdAt?: any;
  updatedAt?: any;
}

export interface PublicTeacherProfile {
  id: string;
  name: string;
  subject: string;
  role: string;
  experience: string;
  phone: string;
  email: string;
  image: string;
  specialization: string;
  joined: string; // e.g., "2018"
  category: 'school' | 'academy';
  section: string; // e.g., "Class 1-2" or "Mathematics Coaching"
  isFeatured?: boolean;
  priority?: number;
}

export interface GlobalSettings {
  institutionName: string;
  tagline: string;
  email: string;
  phone: string;
  address: string;
  academicYear: string;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
  };
  logoUrl?: string;
}

export async function getTeacherClasses(teacherId: string): Promise<ClassData[]> {
  const db = getDb();
  if (!db) return [];
  try {
    const q = query(collection(db, 'classes'), where('teacherId', '==', teacherId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as ClassData));
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function getTeacherSubmissions(teacherId: string): Promise<Submission[]> {
  const db = getDb();
  if (!db) return [];
  try {
    // In a real app, you'd query submissions for classes taught by this teacher.
    // Simplifying here to just query a submissions collection.
    const q = query(collection(db, 'submissions'), where('teacherId', '==', teacherId), orderBy('submittedAt', 'desc'), limit(5));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Submission));
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function getStudentClasses(classCode: string): Promise<ClassData[]> {
  const db = getDb();
  if (!db) return [];
  try {
    const q = query(collection(db, 'classes'), where('classCode', '==', classCode));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as ClassData));
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function getStudentAssignments(classCode: string): Promise<Assignment[]> {
  const db = getDb();
  if (!db) return [];
  try {
    const q = query(collection(db, 'assignments'), where('classCode', '==', classCode), orderBy('dueDate', 'asc'), limit(5));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Assignment));
  } catch (e) {
    console.error(e);
    return [];
  }
}

// --- ADMIN CLASS MANAGEMENT ---

export async function getAllClasses(): Promise<ClassData[]> {
  const db = getDb();
  if (!db) return [];
  try {
    const snap = await getDocs(collection(db, 'classes'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as ClassData));
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function createClass(data: Omit<ClassData, 'id'>): Promise<string> {
  const db = getDb();
  if (!db) throw new Error('Firebase not configured');
  const docRef = await addDoc(collection(db, 'classes'), data);
  return docRef.id;
}

export async function updateClass(id: string, data: Partial<ClassData>): Promise<void> {
  const db = getDb();
  if (!db) throw new Error('Firebase not configured');
  await updateDoc(doc(db, 'classes', id), data);
}

export async function deleteClass(id: string): Promise<void> {
  const db = getDb();
  if (!db) throw new Error('Firebase not configured');
  await deleteDoc(doc(db, 'classes', id));
}

// --- PUBLIC STAFF PROFILES ---

export async function getPublicTeachers(): Promise<PublicTeacherProfile[]> {
  const db = getDb();
  if (!db) return [];
  try {
    const snap = await getDocs(collection(db, 'publicTeachers'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as PublicTeacherProfile));
  } catch (e) {
    console.error(e);
    return [];
  }
}

// --- GLOBAL SETTINGS ---

export async function getGlobalSettings(): Promise<GlobalSettings | null> {
  const db = getDb();
  if (!db) return null;
  try {
    const snap = await getDocs(collection(db, 'settings'));
    if (snap.empty) return null;
    return snap.docs[0].data() as GlobalSettings;
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function updateGlobalSettings(data: GlobalSettings): Promise<void> {
  const db = getDb();
  if (!db) throw new Error('Firebase not configured');
  const snap = await getDocs(collection(db, 'settings'));
  if (snap.empty) {
    await addDoc(collection(db, 'settings'), data);
  } else {
    const docId = snap.docs[0].id;
    await updateDoc(doc(db, 'settings', docId), data as any);
  }
}

export async function getFeaturedTeachers(): Promise<PublicTeacherProfile[]> {
  const db = getDb();
  if (!db) return [];
  try {
    const snap = await getDocs(collection(db, 'publicTeachers'));
    const all = snap.docs.map(d => ({ id: d.id, ...d.data() } as PublicTeacherProfile));
    
    // 1. Filter for featured teachers and sort by priority
    const featured = all
      .filter(t => t.isFeatured)
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));

    if (featured.length > 0) {
      return featured.slice(0, 5);
    }

    // 2. Fallback: If no featured teachers, sort by seniority (joined year)
    return all
      .sort((a, b) => parseInt(a.joined || "9999") - parseInt(b.joined || "9999"))
      .slice(0, 5);
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function createPublicTeacher(data: Omit<PublicTeacherProfile, 'id'>): Promise<string> {
  const db = getDb();
  if (!db) throw new Error('Firebase not configured');
  const docRef = await addDoc(collection(db, 'publicTeachers'), data);
  return docRef.id;
}

export async function updatePublicTeacher(id: string, data: Partial<PublicTeacherProfile>): Promise<void> {
  const db = getDb();
  if (!db) throw new Error('Firebase not configured');
  await updateDoc(doc(db, 'publicTeachers', id), data);
}

export async function deletePublicTeacher(id: string): Promise<void> {
  const db = getDb();
  if (!db) throw new Error('Firebase not configured');
  await deleteDoc(doc(db, 'publicTeachers', id));
}

// --- ATTENDANCE SYSTEM ---

export async function getStudentsByClassCode(classCode: string): Promise<any[]> {
  const db = getDb();
  if (!db) return [];
  try {
    const q = query(collection(db, 'users'), where('role', '==', 'student'), where('classCode', '==', classCode));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ uid: d.id, ...d.data() }));
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function getAllStudents(): Promise<any[]> {
  const db = getDb();
  if (!db) return [];
  try {
    const q = query(collection(db, 'users'), where('role', '==', 'student'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ uid: d.id, ...d.data() }));
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function submitAttendance(record: AttendanceRecord): Promise<string> {
  const db = getDb();
  if (!db) throw new Error('Firebase not configured');
  
  // Check if attendance already exists for this class and date
  const q = query(
    collection(db, 'attendance'), 
    where('classId', '==', record.classId), 
    where('date', '==', record.date)
  );
  const snap = await getDocs(q);
  
  const { id, ...data } = record;

  if (!snap.empty) {
    // Update existing record
    const docId = snap.docs[0].id;
    await updateDoc(doc(db, 'attendance', docId), {
      ...data,
      updatedAt: serverTimestamp()
    } as any);
    return docId;
  } else {
    // Create new record
    const docRef = await addDoc(collection(db, 'attendance'), {
      ...data,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  }
}

export async function getAttendanceByDate(classId: string, date: string): Promise<AttendanceRecord | null> {
  const db = getDb();
  if (!db) return null;
  try {
    const q = query(
      collection(db, 'attendance'), 
      where('classId', '==', classId), 
      where('date', '==', date)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as AttendanceRecord;
  } catch (e) {
    console.error(e);
    return null;
  }
}

