import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp
} from "firebase/firestore";
import { getDb } from "./firebase";
import { handleFirestoreError, OperationType } from "./firestore-errors";

export type NotificationType = 'assignment' | 'message' | 'announcement';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: any;
}

/**
 * Subscribe to notifications for a specific user
 */
export function subscribeToNotifications(userId: string, callback: (notifications: Notification[]) => void) {
  const db = getDb();
  if (!db) return () => {};

  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Notification[];
    callback(notifications);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, "notifications");
  });
}

/**
 * Mark a notification as read
 */
export async function markAsRead(notificationId: string) {
  const db = getDb();
  if (!db) return;
  try {
    const notificationRef = doc(db, "notifications", notificationId);
    await updateDoc(notificationRef, {
      read: true
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `notifications/${notificationId}`);
  }
}

/**
 * Create a new notification (useful for testing/external triggers)
 */
export async function createNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) {
  const db = getDb();
  if (!db) return;
  try {
    await addDoc(collection(db, "notifications"), {
      ...notification,
      read: false,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, "notifications");
  }
}
