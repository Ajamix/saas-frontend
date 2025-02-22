"use client";

import { useEffect, useState } from "react";
import { Bell, Loader2, CreditCard, AlertCircle, UserPlus, Shield, Settings, Info } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import notificationService, {
  type Notification,
  type NotificationType,
  getNotifications,
  markAsRead,
  clearAllNotifications,
} from "@/app/api/notifications";
import { toast } from "sonner";

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  const fetchNotifications = async () => {
    try {
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
    console.log('New notification received:', notification);
    setNotifications(prev => {
      const updated = [notification, ...prev];
      console.log('Updated notifications array:', updated);
      return updated;
    });
    setUnreadCount(prev => prev + 1);
    
    toast(notification.title, {
      description: notification.message,
    });
  };

  const handleNotificationRead = (notificationId: string) => {
    console.log('Notification marked as read:', notificationId);
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, isRead: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleNotificationDeleted = (notificationId: string) => {
    console.log('Notification deleted:', notificationId);
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleNotificationsCleared = () => {
    console.log('All notifications cleared');
    setNotifications([]);
    setUnreadCount(0);
  };

  useEffect(() => {
    console.log('NotificationsDropdown mounted');
    
    // Initial fetch
    fetchNotifications();

    // Setup WebSocket connection check interval
    const checkConnection = () => {
      const isConnected = notificationService.isConnected();
      console.log('WebSocket connection status:', isConnected);
      setConnected(isConnected);
      
      if (!isConnected) {
        console.log('WebSocket disconnected, attempting to reconnect...');
        notificationService.reconnect();
      }
    };

    // Check connection immediately and set up interval
    checkConnection();
    const connectionInterval = setInterval(checkConnection, 10000);

    // Subscribe to events
    notificationService.subscribe('notification', handleNewNotification);
    notificationService.subscribe('notification_read', handleNotificationRead);
    notificationService.subscribe('notification_deleted', handleNotificationDeleted);
    notificationService.subscribe('notifications_cleared', handleNotificationsCleared);
    notificationService.subscribe('connection_status', (status: boolean) => {
      console.log('WebSocket connection status changed:', status);
      setConnected(status);
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

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'subscription_change':
        return <CreditCard className="h-4 w-4" />;
      case 'payment_reminder':
        return <AlertCircle className="h-4 w-4" />;
      case 'user_invited':
        return <UserPlus className="h-4 w-4" />;
      case 'role_assigned':
        return <Shield className="h-4 w-4" />;
      case 'profile_setup':
        return <Settings className="h-4 w-4" />;
      case 'system_update':
        return <Info className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className={cn("h-5 w-5", !connected && "text-muted-foreground")} />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-4">
          <div className="space-y-1">
            <h4 className="font-semibold">Notifications</h4>
            <p className="text-xs text-muted-foreground">
              {connected ? "Connected" : "Connecting..."}
            </p>
          </div>
          {notifications && notifications.length > 0 && (
            <Button
              variant="ghost"
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={handleClearAll}
            >
              Clear all
            </Button>
          )}
        </div>
        <ScrollArea className="h-[calc(100vh-12rem)] px-1">
          {loading ? (
            <div className="p-4 text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={cn(
                  "flex flex-col gap-1 p-4 focus:bg-muted",
                  !notification.isRead && "bg-muted/50"
                )}
                onClick={() => {
                  handleMarkAsRead(notification);
                  if (notification.actionUrl) {
                    window.location.href = notification.actionUrl;
                  }
                }}
              >
                <div className="flex items-center gap-2">
                  {getNotificationIcon(notification.type)}
                  <span className="font-medium">{notification.title}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {notification.message}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </span>
                  {notification.isActionRequired && (
                    <Badge variant="outline" className="text-xs">
                      Action Required
                    </Badge>
                  )}
                </div>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 