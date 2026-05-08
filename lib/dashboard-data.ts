import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
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
