"use client";

import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { notificationService, type Notification, type NotificationType } from "@/app/api/notifications";
import { getNotifications, markAsRead, clearAllNotifications } from "@/app/api/notifications";
import { NotificationCard } from "./notification-card";

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [open, setOpen] = useState(false);
  const notificationsRef = useRef<Notification[]>([]);

  // Update ref whenever notifications state changes
  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  const fetchNotifications = async () => {
    console.log('[NotificationsDropdown] 🔄 Fetching notifications...');
    try {
      setLoading(true);
      const data = await getNotifications();
      console.log('[NotificationsDropdown] 📥 Fetched notifications:', data);
      setNotifications(data);
      notificationsRef.current = data;
      setUnreadCount(data.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('[NotificationsDropdown] ❌ Failed to fetch notifications:', error);
      toast.error("Failed to fetch notifications");
      setNotifications([]);
      notificationsRef.current = [];
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleNewNotification = (notification: Notification) => {
    console.log('[NotificationsDropdown] 🔔 Processing new notification:', notification);
    console.log('[NotificationsDropdown] Current notifications (from ref):', notificationsRef.current);
    
    // Check if notification already exists using ref
    if (notificationsRef.current.some(n => n.id === notification.id)) {
      console.log('[NotificationsDropdown] ⚠️ Notification already exists, skipping:', notification.id);
      return;
    }

    // Add new notification at the beginning
    const updated = [notification, ...notificationsRef.current];
    console.log('[NotificationsDropdown] ✅ Updated notifications list:', updated);
    
    // Update state and ref
    setNotifications(updated);
    notificationsRef.current = updated;
    
    // Update unread count
    const newUnreadCount = updated.filter(n => !n.isRead).length;
    console.log('[NotificationsDropdown] 📊 New unread count:', newUnreadCount);
    setUnreadCount(newUnreadCount);
    
    // Show toast notification
    console.log('[NotificationsDropdown] 🔔 Showing toast notification');
    toast.message(notification.title, {
      description: notification.message,
      duration: 5000,
      action: notification.actionUrl ? {
        label: "View",
        onClick: () => window.location.href = notification.actionUrl!
      } : undefined
    });
  };

  const handleNotificationRead = (notificationId: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => 
        n.id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
      );
      setUnreadCount(updated.filter(n => !n.isRead).length);
      return updated;
    });
  };

  const handleNotificationDeleted = (notificationId: string) => {
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== notificationId);
      setUnreadCount(updated.filter(n => !n.isRead).length);
      return updated;
    });
  };

  const handleNotificationsCleared = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  // Add test function
  const handleTestNotification = () => {
    console.log('[NotificationsDropdown] 🧪 Triggering test notification');
    notificationService.testNotification();
  };

  useEffect(() => {
    console.log('[NotificationsDropdown] 🔄 Component mounted');
    
    // Initial fetch
    fetchNotifications();

    // Subscribe to events
    const notificationCallback = (notification: Notification) => {
      console.log('[NotificationsDropdown] 📥 Notification event received:', notification);
      console.log('[NotificationsDropdown] Current notifications state:', notificationsRef.current);
      handleNewNotification(notification);
    };

    const readCallback = (notificationId: string) => {
      console.log('[NotificationsDropdown] 👁️ Notification read event received:', notificationId);
      handleNotificationRead(notificationId);
    };

    const deleteCallback = (notificationId: string) => {
      console.log('[NotificationsDropdown] 🗑️ Notification deleted event received:', notificationId);
      handleNotificationDeleted(notificationId);
    };

    const clearCallback = () => {
      console.log('[NotificationsDropdown] 🧹 Notifications cleared event received');
      handleNotificationsCleared();
    };

    const connectionCallback = (status: boolean) => {
      console.log('[NotificationsDropdown] 🔌 Connection status changed:', status);
      setConnected(status);
      if (status) {
        console.log('[NotificationsDropdown] Connection restored, fetching notifications...');
        fetchNotifications();
      }
    };

    console.log('[NotificationsDropdown] 🔌 Setting up event subscriptions...');
    
    // Log current listeners before subscribing
    console.log('[NotificationsDropdown] Current notification listeners:', 
      notificationService['listeners'].get('notification')?.size || 0);
    
    notificationService.subscribe('notification', notificationCallback);
    
    // Log listeners after subscribing
    console.log('[NotificationsDropdown] Updated notification listeners:', 
      notificationService['listeners'].get('notification')?.size || 0);

    // Rest of the subscriptions...
    notificationService.subscribe('notification_read', readCallback);
    notificationService.subscribe('notification_deleted', deleteCallback);
    notificationService.subscribe('notifications_cleared', clearCallback);
    notificationService.subscribe('connection_status', connectionCallback);

    // Setup connection check interval
    const checkConnection = () => {
      const isConnected = notificationService.isConnected();
      console.log('[NotificationsDropdown] 🔍 Connection check:', isConnected);
      if (isConnected !== connected) {
        console.log('[NotificationsDropdown] Connection status mismatch, updating state...');
        setConnected(isConnected);
      }
    };

    // Check connection immediately and set up interval
    checkConnection();
    const connectionInterval = setInterval(checkConnection, 30000);

    return () => {
      console.log('[NotificationsDropdown] 🔚 Component unmounting, cleaning up...');
      clearInterval(connectionInterval);
      
      console.log('[NotificationsDropdown] Unsubscribing from events...');
      notificationService.unsubscribe('notification', notificationCallback);
      notificationService.unsubscribe('notification_read', readCallback);
      notificationService.unsubscribe('notification_deleted', deleteCallback);
      notificationService.unsubscribe('notifications_cleared', clearCallback);
      notificationService.unsubscribe('connection_status', connectionCallback);
    };
  }, []);

  const handleMarkAsRead = async (notification: Notification) => {
    if (notification.isRead) return;

    try {
      await markAsRead(notification.id);
      handleNotificationRead(notification.id);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      toast.error("Failed to mark notification as read");
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAllNotifications();
      handleNotificationsCleared();
      toast.success("All notifications cleared");
    } catch (error) {
      console.error('Failed to clear notifications:', error);
      toast.error("Failed to clear notifications");
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {!connected && (
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />
          )}
          {connected && unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold">Notifications</h4>
            {process.env.NODE_ENV === 'development' && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleTestNotification}
              >
                Test
              </Button>
            )}
          </div>
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              disabled={loading}
            >
              Clear all
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {loading ? (
            <div className="p-4 space-y-4">
              <Skeleton className="h-14" />
              <Skeleton className="h-14" />
              <Skeleton className="h-14" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          ) : (
            <div className="grid gap-1">
              {notifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onRead={handleMarkAsRead}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 