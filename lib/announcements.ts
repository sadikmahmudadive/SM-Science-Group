import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  where,
  QueryConstraint
} from "firebase/firestore";
import { getDb } from "./firebase";
import { createNotification } from "./notifications";
import { handleFirestoreError, OperationType } from "./firestore-errors";
import { getUsers } from "./users";

export interface Attachment {
  url: string;
  name: string;
  type: string;
  uploadedAt: any;
}

export type AnnouncementStatus = 'draft' | 'published' | 'scheduled' | 'archived';
export type UserRole = 'admin' | 'teacher' | 'student';
export type AnnouncementTargetRole = UserRole | 'all';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  richContent?: string;
  attachments: Attachment[];
  targetRoles: AnnouncementTargetRole[];
  status: AnnouncementStatus;
  scheduledFor?: any;
  authorId: string;
  authorName?: string;
  createdAt: any;
  updatedAt: any;
  editedBy?: string;
}

function removeUndefinedFields<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(item => removeUndefinedFields(item)).filter(item => item !== undefined) as T;
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, fieldValue]) => fieldValue !== undefined)
        .map(([key, fieldValue]) => [key, removeUndefinedFields(fieldValue)])
    ) as T;
  }

  return value;
}

/**
 * Subscribe to announcements based on user role and status
 */
export function subscribeToAnnouncements(
  callback: (announcements: Announcement[]) => void,
  userRole?: UserRole
) {
  const db = getDb();
  if (!db) return () => {};

  const constraints: QueryConstraint[] = [
    orderBy("createdAt", "desc")
  ];

  // Filter by published status by default, unless fetching for admin
  if (userRole !== 'admin') {
    constraints.push(where("status", "==", "published"));
  }

  const q = query(collection(db, "announcements"), ...constraints);

  return onSnapshot(q, (snapshot) => {
    const announcements = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Announcement[];

    // Filter by target roles if user role is provided
    const filtered = userRole 
      ? announcements.filter(a => a.targetRoles.includes(userRole) || a.targetRoles.includes('all'))
      : announcements;

    callback(filtered);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, "announcements");
  });
}

/**
 * Create a new announcement
 */
export async function createAnnouncement(
  announcement: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'>
) {
  const db = getDb();
  if (!db) return;
  
  try {
    const sanitizedAnnouncement = removeUndefinedFields(announcement);
    const docRef = await addDoc(collection(db, "announcements"), {
      ...sanitizedAnnouncement,
      attachments: sanitizedAnnouncement.attachments || [],
      targetRoles: sanitizedAnnouncement.targetRoles || ['all'],
      status: sanitizedAnnouncement.status || 'published',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Notify users if published immediately
    if (sanitizedAnnouncement.status === 'published') {
      await notifyUsersOfAnnouncement(sanitizedAnnouncement);
    }

    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, "announcements");
  }
}

/**
 * Get a single announcement by ID
 */
export async function getAnnouncementById(id: string): Promise<Announcement | null> {
  const db = getDb();
  if (!db) return null;

  try {
    const snapshot = await getDocs(query(collection(db, "announcements"), where("__name__", "==", id)));
    
    if (snapshot.empty) return null;
    
    return {
      id: snapshot.docs[0].id,
      ...snapshot.docs[0].data()
    } as Announcement;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, "announcements");
    return null;
  }
}

/**
 * Update an existing announcement
 */
export async function updateAnnouncement(
  id: string,
  updates: Partial<Omit<Announcement, 'id' | 'createdAt' | 'authorId'>>
) {
  const db = getDb();
  if (!db) return;

  try {
    const docRef = doc(db, "announcements", id);
    await updateDoc(docRef, {
      ...removeUndefinedFields(updates),
      updatedAt: serverTimestamp()
    });

    // Notify if status changed to published
    if (updates.status === 'published') {
      const announcement = await getAnnouncementById(id);
      if (announcement) {
        await notifyUsersOfAnnouncement(announcement);
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, "announcements");
  }
}

/**
 * Delete an announcement
 */
export async function deleteAnnouncement(id: string) {
  const db = getDb();
  if (!db) return;

  try {
    const docRef = doc(db, "announcements", id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, "announcements");
  }
}

/**
 * Archive an announcement (soft delete)
 */
export async function archiveAnnouncement(id: string) {
  await updateAnnouncement(id, { status: 'archived' });
}

/**
 * Notify users of a new announcement
 */
async function notifyUsersOfAnnouncement(
  announcement: Pick<Announcement, 'title' | 'targetRoles'>
) {
  try {
    const rolesToNotify: UserRole[] = announcement.targetRoles.includes('all')
      ? ['admin', 'teacher', 'student']
      : (announcement.targetRoles.filter(r => r !== 'all') as UserRole[]);

    // Fetch users by each role and create notifications
    for (const role of rolesToNotify) {
      const users = await getUsers(role);
      for (const user of users) {
        await createNotification({
          userId: user.uid, // Use the actual UID instead of role name
          type: 'announcement',
          title: 'New Announcement',
          message: announcement.title
        });
      }
    }
  } catch (error) {
    console.error("Error notifying users:", error);
  }
}
