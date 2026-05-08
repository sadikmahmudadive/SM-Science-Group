import {
  collection,
  getDocs,
  query,
  where
} from 'firebase/firestore';
import { getDb } from './firebase';

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  totalAnnouncements: number;
  teacherCount: number;
  studentCount: number;
}

/**
 * Fetches aggregated statistics for the admin dashboard
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const db = getDb();
  if (!db) throw new Error('Firebase not configured');

  try {
    // 1. Count Total Users
    const usersRef = collection(db, 'users');
    const totalUsersSnap = await getDocs(usersRef);
    const totalUsers = totalUsersSnap.size;

    // 2. Count by Role and Status
    const activeUsersSnap = await getDocs(query(usersRef, where('status', '==', 'active')));
    const pendingUsersSnap = await getDocs(query(usersRef, where('status', '==', 'pending')));

    const teacherSnap = await getDocs(query(usersRef, where('role', '==', 'teacher')));
    const studentSnap = await getDocs(query(usersRef, where('role', '==', 'student')));

    // 3. Count Announcements
    const announcementsRef = collection(db, 'announcements');
    const announcementsSnap = await getDocs(announcementsRef);

    return {
      totalUsers,
      activeUsers: activeUsersSnap.size,
      pendingUsers: pendingUsersSnap.size,
      totalAnnouncements: announcementsSnap.size,
      teacherCount: teacherSnap.size,
      studentCount: studentSnap.size,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
}
