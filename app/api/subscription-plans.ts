import AuthClient from './auth-client';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: 'monthly' | 'yearly';
  features: string[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const getSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
  return AuthClient.get('/super-admin/subscription-plans/admin');
}

export const getSubscriptionPlansForTenant = async (): Promise<SubscriptionPlan[]> => {
  return AuthClient.getPublic('/super-admin/subscription-plans/');
}

export const createSubscriptionPlan = async (plan: Omit<SubscriptionPlan, 'id'>): Promise<SubscriptionPlan> => {
  return AuthClient.post('/super-admin/subscription-plans', plan);
};

export const updateSubscriptionPlan = async (id: string, plan: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> => {
  return AuthClient.patch(`/super-admin/subscription-plans/${id}`, plan);
};

export const deleteSubscriptionPlan = async (id: string): Promise<void> => {
  return AuthClient.delete(`/super-admin/subscription-plans/${id}`);
}; 