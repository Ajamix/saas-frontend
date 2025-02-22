"use client";

import { useState, useEffect } from "react";
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

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      toast.error("Failed to fetch notifications");
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleNewNotification = (notification: Notification) => {
    setNotifications(prev => {
      // Check if notification already exists
      if (prev.some(n => n.id === notification.id)) {
        return prev;
      }
      // Add new notification at the beginning
      const updated = [notification, ...prev];
      setUnreadCount(updated.filter(n => !n.isRead).length);
      
      // Show toast notification
      toast(notification.title, {
        description: notification.message,
      });
      
      return updated;
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

  useEffect(() => {
    console.log('NotificationsDropdown mounted');
    
    // Initial fetch
    fetchNotifications();

    // Setup connection check interval
    const checkConnection = () => {
      const isConnected = notificationService.isConnected();
      if (isConnected !== connected) {
        console.log('SSE connection status:', isConnected);
        setConnected(isConnected);
      }
    };

    // Check connection immediately and set up interval
    checkConnection();
    const connectionInterval = setInterval(checkConnection, 30000); // Check every 30 seconds

    // Subscribe to events
    notificationService.subscribe('notification', handleNewNotification);
    notificationService.subscribe('notification_read', handleNotificationRead);
    notificationService.subscribe('notification_deleted', handleNotificationDeleted);
    notificationService.subscribe('notifications_cleared', handleNotificationsCleared);
    notificationService.subscribe('connection_status', (status: boolean) => {
      console.log('SSE connection status changed:', status);
      setConnected(status);
      
      // Refetch notifications when connection is restored
      if (status) {
        fetchNotifications();
      }
    });

    return () => {
      console.log('NotificationsDropdown unmounting');
      // Clear interval
      clearInterval(connectionInterval);
      
      // Cleanup subscriptions
      notificationService.unsubscribe('notification', handleNewNotification);
      notificationService.unsubscribe('notification_read', handleNotificationRead);
      notificationService.unsubscribe('notification_deleted', handleNotificationDeleted);
      notificationService.unsubscribe('notifications_cleared', handleNotificationsCleared);
      notificationService.unsubscribe('connection_status', setConnected);
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
          <div className="text-sm font-medium">Notifications</div>
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              className="text-xs text-muted-foreground"
              onClick={handleClearAll}
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