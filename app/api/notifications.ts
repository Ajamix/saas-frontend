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
      console.log('[NotificationService] Already initializing EventSource, skipping...');
      return;
    }

    const token = TokenService.getAccessToken();
    if (!token) {
      console.error('[NotificationService] No access token available');
      return;
    }

    try {
      this.isInitializing = true;
      console.log('[NotificationService] Starting EventSource initialization...');

      if (this.eventSource) {
        console.log('[NotificationService] Cleaning up existing EventSource');
        this.eventSource.close();
        this.eventSource = null;
      }

      const url = `${API_URL}/notifications/sse/subscribe`;
      console.log('[NotificationService] Connecting to:', url);
      
      const eventSource = new EventSourcePolyfill(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        },
        heartbeatTimeout: 60000,
        withCredentials: true
      });

      // Store event source only after successful setup
      this.eventSource = eventSource;

      // Handle message event (default event)
      eventSource.onmessage = (event) => {
        console.log('[NotificationService] 📥 Received default message event:', event.data);
        try {
          const data = JSON.parse(event.data);
          if (this.validateNotification(data)) {
            console.log('[NotificationService] ✅ Valid notification from message event:', data);
            this.emit('notification', data);
          }
        } catch (error) {
          console.error('[NotificationService] ❌ Error processing message event:', error);
        }
      };

      // Handle open event
      eventSource.onopen = () => {
        console.log('[NotificationService] ✅ EventSource connected successfully');
        console.log('[NotificationService] Current readyState:', eventSource.readyState);
        this.isInitializing = false;
        this.reconnectAttempts = 0;
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
        this.emit('connection_status', true);
      };

      // Handle error event
      eventSource.onerror = (error) => {
        console.error('[NotificationService] ❌ EventSource error:', error);
        console.log('[NotificationService] EventSource readyState:', eventSource.readyState);
        
        if (error instanceof MessageEvent) {
          console.error('[NotificationService] Error details:', {
            type: error.type,
            data: error.data,
            lastEventId: error.lastEventId,
            origin: error.origin,
            readyState: eventSource.readyState
          });
        }
        
        this.isInitializing = false;
        
        if (eventSource.readyState === EventSourcePolyfill.CLOSED) {
          console.log('[NotificationService] Connection closed, attempting reconnect');
          this.emit('connection_status', false);
          setTimeout(() => this.handleReconnect(), 1000);
        }
      };

      // Add specific event listeners for NestJS SSE events
const events: string[] = ['notification', 'notification_read', 'notification_deleted', 'notifications_cleared'];

events.forEach(eventName => {
  console.log(`[NotificationService] Adding listener for ${eventName}`);

  eventSource.addEventListener(eventName as unknown as keyof EventSourceEventMap, (event) => {
    const messageEvent = event as MessageEvent;
    console.log(`[NotificationService] 📥 Received ${eventName} event:`, messageEvent.data);
    try {
      const data = JSON.parse(messageEvent.data);
      console.log(`[NotificationService] Parsed ${eventName} data:`, data);
      this.emit(eventName, data);
    } catch (error) {
      console.error(`[NotificationService] ❌ Error processing ${eventName} event:`, error);
    }
  });
});

      

      console.log('[NotificationService] EventSource setup complete');

    } catch (error) {
      console.error('[NotificationService] ❌ Failed to initialize EventSource:', error);
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
      message: 'This is a test notification to verify the notification system.',
      data: {},
      isRead: false,
      userId: 'test-user',
      tenantId: 'test-tenant',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
      readAt: null,
      expiresAt: null,
      isActionRequired: false,
      actionUrl: null,
      metadata: null
    };

    console.log('[NotificationService] Simulating notification:', testNotification);
    this.emit('notification', testNotification);
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

  public subscribe(eventName: string, listener: (data: any) => void) {
    console.log(`[NotificationService] Subscribing to ${eventName}`);
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }
    this.listeners.get(eventName)!.add(listener);
    console.log(`[NotificationService] Now have ${this.listeners.get(eventName)!.size} listeners for ${eventName}`);
  }

  public unsubscribe(eventName: string, listener: (data: any) => void) {
    console.log(`[NotificationService] Unsubscribing from ${eventName}`);
    const listeners = this.listeners.get(eventName);
    if (listeners) {
      const success = listeners.delete(listener);
      console.log(`[NotificationService] Unsubscribe ${success ? 'successful' : 'failed'}, ${listeners.size} listeners remaining for ${eventName}`);
    }
  }

  private emit(eventName: string, data: any) {
    console.log(`[NotificationService] 📢 Emitting ${eventName}:`, data);
    const listeners = this.listeners.get(eventName);
    
    if (listeners && listeners.size > 0) {
      console.log(`[NotificationService] Found ${listeners.size} listeners for ${eventName}`);
      let index = 1;
      listeners.forEach((listener) => {
        try {
          console.log(`[NotificationService] Calling listener ${index}/${listeners.size} for ${eventName}`);
          listener(data);
          console.log(`[NotificationService] ✅ Listener ${index} executed successfully`);
        } catch (error) {
          console.error(`[NotificationService] ❌ Error in listener ${index} for ${eventName}:`, error);
        }
        index++;
      });
    } else {
      console.warn(`[NotificationService] ⚠️ No listeners found for ${eventName}`);
    }
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
    const connected = this.eventSource?.readyState === EventSourcePolyfill.OPEN;
    console.log('[NotificationService] Connection status check:', connected);
    return connected;
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
  return AuthClient.patch(`/notifications/${id}/read`);
};

export const deleteNotification = async (id: string): Promise<void> => {
  return AuthClient.delete(`/notifications/${id}`);
};

export const clearAllNotifications = async (): Promise<void> => {
  return AuthClient.delete('/notifications/');
}; 