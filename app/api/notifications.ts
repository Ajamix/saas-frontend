import AuthClient from './auth-client';
import { io, Socket } from 'socket.io-client';
import TokenService from '@/app/lib/auth/tokens';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000';

export type NotificationType = 
  | 'subscription_change'
  | 'payment_reminder'
  | 'user_invited'
  | 'role_assigned'
  | 'profile_setup'
  | 'system_update';

export interface NotificationData {
  newPlan?: {
    name: string;
    price: number;
    features: string[];
    interval: string;
  };
  isUpgrade?: boolean;
  billingUrl?: string;
  companyName?: string;
  supportEmail?: string;
  effectiveDate?: string;
  nextBillingDate?: string;
  [key: string]: any;
}

export interface Notification {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  type: NotificationType;
  title: string;
  message: string;
  data: NotificationData;
  isRead: boolean;
  userId: string;
  tenantId: string;
  readAt: string | null;
  expiresAt: string | null;
  isActionRequired: boolean;
  actionUrl: string | null;
  metadata: any | null;
}

export interface NotificationsResponse {
  data: Notification[];
  total: number;
  unreadCount: number;
}

class NotificationService {
  private static instance: NotificationService;
  private socket: Socket | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 10000; // 10 seconds
  private reconnectTimer: NodeJS.Timeout | null = null;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.initializeSocket();
    }
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private initializeSocket() {
    if (this.socket?.connected) {
      console.log('Socket already connected, skipping initialization');
      return;
    }

    const token = TokenService.getAccessToken();
    if (!token) {
      console.log('No token available, skipping socket initialization');
      return;
    }

    const decodedToken = TokenService.decodeToken(token);
    if (!decodedToken?.sub) {
      console.log('No user ID in token, skipping socket initialization');
      return;
    }

    try {
      if (this.socket) {
        console.log('Cleaning up existing socket');
        this.socket.removeAllListeners();
        this.socket.disconnect();
      }

      console.log('Initializing socket connection...');
      this.socket = io(WS_URL, {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: this.reconnectDelay,
        reconnectionDelayMax: 20000,
        timeout: 10000
      });

      // Log all incoming socket events in development
      if (process.env.NODE_ENV === 'development') {
        this.socket.onAny((event, ...args) => {
          console.log('Socket event received:', event, args);
        });
      }

      this.socket.on('connect', () => {
        console.log('Socket connected:', this.socket?.id);
        
        // Join user's room
        const userId = decodedToken.sub;
        this.socket?.emit('join', `user:${userId}`);
        console.log('Joining room:', `user:${userId}`);
        
        this.reconnectAttempts = 0;
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
        this.emit('connection_status', true);
      });

      // Add handler for successful room join
      this.socket.on('joined', (room: string) => {
        console.log('Successfully joined room:', room);
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        this.emit('connection_status', false);
        this.handleReconnect();
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        this.emit('connection_status', false);
        if (reason === 'io server disconnect' || reason === 'transport close') {
          this.handleReconnect();
        }
      });

      this.socket.on('notification', (data: Notification) => {
        console.log('Received notification:', data);
        if (!this.validateNotification(data)) {
          console.warn('Received invalid notification format:', data);
          return;
        }
        this.emit('notification', data);
      });

      this.socket.on('notification_read', (data) => {
        console.log('Notification read event:', data);
        this.emit('notification_read', data);
      });

      this.socket.on('notification_deleted', (data) => {
        console.log('Notification deleted event:', data);
        this.emit('notification_deleted', data);
      });

      this.socket.on('notifications_cleared', (data) => {
        console.log('Notifications cleared event:', data);
        this.emit('notifications_cleared', data);
      });

    } catch (error) {
      console.error('Failed to initialize socket:', error);
      this.emit('connection_status', false);
      this.handleReconnect();
    }
  }

  private validateNotification(data: any): data is Notification {
    return (
      data &&
      typeof data === 'object' &&
      typeof data.id === 'string' &&
      typeof data.type === 'string' &&
      typeof data.title === 'string' &&
      typeof data.message === 'string' &&
      typeof data.userId === 'string'
    );
  }

  // Test method to simulate receiving a notification (development only)
  public testNotification() {
    if (process.env.NODE_ENV !== 'development') return;
    
    const testNotification: Notification = {
      id: `test-${Date.now()}`,
      type: 'system_update',
      title: 'Test Notification',
      message: 'This is a test notification',
      data: {},
      isRead: false,
      userId: TokenService.decodeToken(TokenService.getAccessToken() || '')?.sub || '',
      tenantId: TokenService.getTenantId() || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
      readAt: null,
      expiresAt: null,
      isActionRequired: false,
      actionUrl: null,
      metadata: null
    };

    console.log('Simulating notification:', testNotification);
    this.emit('notification', testNotification);
    return testNotification;
  }

  private handleReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectAttempts++;
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      console.log(`Scheduling reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${this.reconnectDelay}ms`);
      this.reconnectTimer = setTimeout(() => {
        console.log('Attempting to reconnect...');
        this.initializeSocket();
      }, this.reconnectDelay);
    } else {
      console.log('Max reconnection attempts reached');
    }
  }

  public subscribe(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
  }

  public unsubscribe(event: string, callback: (data: any) => void) {
    this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, data: any) {
    this.listeners.get(event)?.forEach(callback => callback(data));
  }

  public disconnect() {
    console.log('Disconnecting socket...');
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this.reconnectAttempts = 0;
  }

  public reconnect() {
    console.log('Reconnecting socket...');
    this.disconnect();
    this.initializeSocket();
  }

  public isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

// REST API functions
export const getNotifications = async (): Promise<Notification[]> => {
  return AuthClient.get('/notifications');
};

export const getUnreadNotifications = async (): Promise<Notification[]> => {
  return AuthClient.get('/notifications/unread');
};

export const markAsRead = async (id: string): Promise<void> => {
  return AuthClient.patch(`/notifications/${id}/read`);
};

export const deleteNotification = async (id: string): Promise<void> => {
  return AuthClient.delete(`/notifications/${id}`);
};

export const clearAllNotifications = async (): Promise<void> => {
  return AuthClient.delete('/notifications');
};

// Export singleton instance
export const notificationService = NotificationService.getInstance();

export default notificationService; 