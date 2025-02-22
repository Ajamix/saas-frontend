import AuthClient from './auth-client';

export interface Subscription {
  id: string;
  tenantId: string;
  planId: string;
  status: 'active' | 'canceled' | 'expired';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAt?: string;
  canceledAt?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  paypalSubscriptionId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  plan: {
    id: string;
    name: string;
    description: string;
    price: number;
    interval: 'monthly' | 'yearly';
    features: string[];
  };
}

export interface SubscriptionResponse {
  data: Subscription[];
}

export interface SingleSubscriptionResponse {
  data: Subscription;
}

export interface CreateSubscriptionDto {
  tenantId: string;
  planId: string;
  status?: 'active' | 'canceled' | 'expired';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAt?: Date;
  canceledAt?: Date;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  paypalSubscriptionId?: string;
  metadata?: Record<string, any>;
}

// Super Admin Only
export const createSubscription = async (data: CreateSubscriptionDto): Promise<SingleSubscriptionResponse> => {
  return AuthClient.post('/subscriptions', data);
};

export const getAllSubscriptions = async (): Promise<SubscriptionResponse> => {
  return AuthClient.get('/subscriptions/all');
};

export const updateSubscription = async (id: string, data: Partial<CreateSubscriptionDto>): Promise<SingleSubscriptionResponse> => {
  return AuthClient.patch(`/subscriptions/${id}`, data);
};

// Tenant Admin Only
export const getTenantSubscriptions = async (): Promise<SubscriptionResponse> => {
  return AuthClient.get('/subscriptions/tenant');
};

export const cancelSubscription = async (id: string): Promise<SingleSubscriptionResponse> => {
  return AuthClient.post(`/subscriptions/${id}/cancel`);
};

// Any Tenant User
export const getActiveSubscription = async (): Promise<SingleSubscriptionResponse> => {
  return AuthClient.get('/subscriptions/active');
};

export const getSubscription = async (id: string): Promise<SingleSubscriptionResponse> => {
  return AuthClient.get(`/subscriptions/${id}`);
}; 