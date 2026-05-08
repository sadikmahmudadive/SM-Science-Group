"use client";

import { useState, useEffect } from "react";
import { Bell, MessageSquare, BookOpen, Megaphone, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { Notification, subscribeToNotifications, markAsRead, createNotification } from "@/lib/notifications";

interface NotificationCenterProps {
  userId: string;
}

export function NotificationCenter({ userId }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribeToNotifications(userId, (data) => {
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    });

    return () => unsubscribe();
  }, [userId]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'assignment': return <BookOpen className="w-4 h-4 text-blue-500" />;
      case 'message': return <MessageSquare className="w-4 h-4 text-emerald-500" />;
      case 'announcement': return <Megaphone className="w-4 h-4 text-amber-500" />;
      default: return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  const handleCreateMock = async () => {
    const types: ('assignment' | 'message' | 'announcement')[] = ['assignment', 'message', 'announcement'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    
    await createNotification({
      userId,
      type: randomType,
      title: `New ${randomType.charAt(0).toUpperCase() + randomType.slice(1)}`,
      message: `You have a new ${randomType} received at ${new Date().toLocaleTimeString()}`
    });
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded-full transition-colors relative"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-800">Notifications</h3>
                <button 
                  onClick={handleCreateMock}
                  className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider hover:underline"
                >
                  Test Notification
                </button>
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Bell className="w-6 h-6 text-slate-300" />
                    </div>
                    <p className="text-slate-500 text-sm">No notifications yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id}
                        className={`p-4 hover:bg-slate-50 transition-colors relative group ${!notification.read ? 'bg-indigo-50/30' : ''}`}
                      >
                        <div className="flex gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            notification.type === 'assignment' ? 'bg-blue-50' : 
                            notification.type === 'message' ? 'bg-emerald-50' : 'bg-amber-50'
                          }`}>
                            {getIcon(notification.type)}
                          </div>
                          <div className="flex-1">
                            <h4 className={`text-sm font-bold ${!notification.read ? 'text-slate-900' : 'text-slate-600'}`}>
                              {notification.title}
                            </h4>
                            <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                              {notification.message}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-2">
                              {notification.createdAt?.toDate?.() ? 
                                new Date(notification.createdAt.toDate()).toLocaleString() : 
                                'Just now'}
                            </p>
                          </div>
                          {!notification.read && (
                            <button 
                              onClick={() => markAsRead(notification.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-indigo-600 hover:bg-indigo-100 rounded transition-all"
                              title="Mark as read"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {notifications.length > 0 && (
                <Link 
                  href="#" 
                  className="block p-3 text-center text-xs font-bold text-indigo-600 hover:bg-slate-50 border-t border-slate-100"
                  onClick={() => setIsOpen(false)}
                >
                  View All Notifications
                </Link>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
