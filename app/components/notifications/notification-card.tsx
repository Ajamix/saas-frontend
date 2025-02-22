"use client";

import { Bell, CreditCard, AlertCircle, UserPlus, Shield, Settings, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { type Notification, type NotificationType } from "@/app/api/notifications";

interface NotificationCardProps {
  notification: Notification;
  onRead: (notification: Notification) => void;
}

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

export function NotificationCard({ notification, onRead }: NotificationCardProps) {
  return (
    <DropdownMenuItem
      className={cn(
        "flex flex-col gap-1 p-4 focus:bg-muted",
        !notification.isRead && "bg-muted/50"
      )}
      onClick={() => {
        onRead(notification);
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
  );
} 