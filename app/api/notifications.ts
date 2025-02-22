import AuthClient from './auth-client';
import TokenService from '@/app/lib/auth/tokens';
import { EventSourcePolyfill } from 'event-source-polyfill';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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

type EventHandler = (event: MessageEvent) => void;

class NotificationService {
  private static instance: NotificationService;
  private eventSource: EventSourcePolyfill | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private isInitializing = false;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private connectionCheckInterval: NodeJS.Timeout | null = null;

  private constructor() {
    if (typeof window !== 'undefined') {
      // Delay initial connection to avoid immediate reconnection loops
      setTimeout(() => {
        this.initializeEventSource();
      }, 1000);

      // Set up connection check interval
      this.connectionCheckInterval = setInterval(() => {
        this.checkConnection();
      }, 30000); // Check every 30 seconds
    }
  }

  private checkConnection() {
    if (!this.eventSource || this.eventSource.readyState === EventSourcePolyfill.CLOSED) {
      if (!this.isInitializing && this.reconnectAttempts < this.maxReconnectAttempts) {
        console.log('Connection check: Connection lost, attempting to reconnect...');
        this.reconnect();
      }
    }
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private initializeEventSource() {
    if (this.isInitializing) {
      console.log('Already initializing EventSource, skipping...');
      return;
    }

    const token = TokenService.getAccessToken();
    if (!token) {
      console.error('No access token available');
      return;
    }

    try {
      this.isInitializing = true;

      if (this.eventSource) {
        console.log('Cleaning up existing EventSource');
        this.eventSource.close();
        this.eventSource = null;
      }

      console.log('Initializing EventSource connection...');
      const eventSource = new EventSourcePolyfill(`${API_URL}/notifications/sse/subscribe`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        },
        heartbeatTimeout: 60000, // Reduce to 1 minute
        withCredentials: true
      });

      // Log the connection URL and headers for debugging
      console.log('SSE Connection URL:', `${API_URL}/notifications/sse/subscribe`);
      console.log('SSE Connection Headers:', {
        'Authorization': 'Bearer [hidden]',
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      });

      // Store event source only after successful setup
      this.eventSource = eventSource;

      eventSource.onopen = () => {
        console.log('EventSource connected successfully');
        this.isInitializing = false;
        this.reconnectAttempts = 0;
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
        this.emit('connection_status', true);
      };

      eventSource.onerror = (error) => {
        console.error('EventSource error:', error);
        // Log more detailed error information
        if (error instanceof MessageEvent) {
          console.error('Error details:', {
            type: error.type,
            data: error.data,
            lastEventId: error.lastEventId,
            origin: error.origin,
            readyState: eventSource.readyState
          });
        }
        
        this.isInitializing = false;
        
        if (eventSource.readyState === EventSourcePolyfill.CLOSED) {
          console.log('Connection closed, current state:', {
            readyState: eventSource.readyState,
            reconnectAttempts: this.reconnectAttempts,
            isInitializing: this.isInitializing
          });
          this.emit('connection_status', false);
          
          // Add a small delay before attempting reconnection
          setTimeout(() => {
            this.handleReconnect();
          }, 1000);
        }
      };

      const handleEvent = (eventName: string): EventListenerOrEventListenerObject => (event: Event) => {
        if (event instanceof MessageEvent) {
          try {
            const data = JSON.parse(event.data);
            console.log(`Received ${eventName}:`, data);
            
            if (eventName === 'notification' && !this.validateNotification(data)) {
              console.warn('Received invalid notification format:', data);
              return;
            }
            
            this.emit(eventName, data);
          } catch (error) {
            console.error(`Error parsing ${eventName} data:`, error);
          }
        }
      };

      // Set up event listeners with type assertions
      (eventSource as any).addEventListener('notification', handleEvent('notification'));
      (eventSource as any).addEventListener('notification_read', handleEvent('notification_read'));
      (eventSource as any).addEventListener('notification_deleted', handleEvent('notification_deleted'));
      (eventSource as any).addEventListener('notifications_cleared', handleEvent('notifications_cleared'));
      (eventSource as any).addEventListener('broadcast', handleEvent('broadcast'));

    } catch (error) {
      console.error('Failed to initialize EventSource:', error);
      this.isInitializing = false;
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

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached, stopping reconnection');
      this.disconnect();
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

    console.log(`Scheduling reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
    
    this.reconnectTimer = setTimeout(() => {
      if (!this.isInitializing) {
        this.initializeEventSource();
      }
    }, delay);
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
    console.log('Disconnecting EventSource...');
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval);
      this.connectionCheckInterval = null;
    }
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.isInitializing = false;
    this.reconnectAttempts = 0;
    this.emit('connection_status', false);
  }

  public reconnect() {
    console.log('Manual reconnect requested');
    this.reconnectAttempts = 0;
    this.disconnect();
    this.initializeEventSource();
  }

  public isConnected(): boolean {
    return this.eventSource?.readyState === EventSourcePolyfill.OPEN;
  }
}

export const notificationService = NotificationService.getInstance();

// REST API functions
export const getNotifications = async (): Promise<Notification[]> => {
  return AuthClient.get('/notifications');
};

export const getUnreadNotifications = async (): Promise<Notification[]> => {
  return AuthClient.get('/notifications/unread');
};

export const markAsRead = async (id: string): Promise<void> => {
  return AuthClient.post(`/notifications/${id}/read`);
};

export const deleteNotification = async (id: string): Promise<void> => {
  return AuthClient.delete(`/notifications/${id}`);
};

export const clearAllNotifications = async (): Promise<void> => {
  return AuthClient.post('/notifications/clear');
}; 