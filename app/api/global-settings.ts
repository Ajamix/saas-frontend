import AuthClient from './auth-client';

export interface SmtpSettings {
  from: string;
  host: string;
  port: number;
  user: string;
  secure: boolean;
  fromName: string;
  password: string;
}

export interface NotificationSettings {
  notificationTypes: {
    passwordReset: boolean;
    systemUpdates: boolean;
    paymentReminders: boolean;
    userRegistration: boolean;
    subscriptionChanges: boolean;
  };
  defaultEmailTemplate: string;
  enablePushNotifications: boolean;
  enableEmailNotifications: boolean;
  enableInAppNotifications: boolean;
}

export interface PaymentSettings {
  currency: string;
  paypalEnabled: boolean;
  stripeEnabled: boolean;
  paypalClientId: string;
  stripePublicKey: string;
  stripeSecretKey: string;
  paypalEnvironment: 'sandbox' | 'production';
  paypalClientSecret: string;
  stripeWebhookSecret: string;
}

export interface PasswordPolicy {
  minLength: number;
  requireNumbers: boolean;
  requireLowercase: boolean;
  requireUppercase: boolean;
  requireSpecialChars: boolean;
}

export interface SystemSettings {
  passwordPolicy: PasswordPolicy;
  sessionTimeout: number;
  defaultUserRole: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  allowUserRegistration: boolean;
  requireEmailVerification: boolean;
}

export interface GlobalSettings {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  smtpSettings: SmtpSettings;
  notificationSettings: NotificationSettings;
  paymentSettings: PaymentSettings;
  systemSettings: SystemSettings;
  isActive: boolean;
  metadata: any;
}

// Get all global settings
export const getGlobalSettings = async (): Promise<GlobalSettings[]> => {
  return AuthClient.get('/global-settings');
};

// Get active global settings
export const getActiveGlobalSettings = async (): Promise<GlobalSettings[]> => {
  return AuthClient.get('/global-settings');
};

// Get global settings by ID
export const getGlobalSettingsById = async (id: string): Promise<GlobalSettings> => {
  return AuthClient.get(`/global-settings/${id}`);
};

// Update global settings
export const updateGlobalSettings = async (id: string, data: Partial<GlobalSettings>): Promise<GlobalSettings> => {
  return AuthClient.patch(`/global-settings/${id}`, data);
};

// Delete global settings
export const deleteGlobalSettings = async (id: string): Promise<void> => {
  return AuthClient.delete(`/global-settings/${id}`);
};

// Update SMTP settings
export const updateSmtpSettings = async (id: string, data: SmtpSettings): Promise<GlobalSettings> => {
  return AuthClient.patch(`/global-settings/${id}`, { smtpSettings: data });
};

// Update notification settings
export const updateNotificationSettings = async (id: string, data: NotificationSettings): Promise<GlobalSettings> => {
  return AuthClient.patch(`/global-settings/${id}`, { notificationSettings: data });
};

// Update payment settings
export const updatePaymentSettings = async (id: string, data: PaymentSettings): Promise<GlobalSettings> => {
  return AuthClient.patch(`/global-settings/${id}`, { paymentSettings: data });
};

// Update system settings
export const updateSystemSettings = async (id: string, data: SystemSettings): Promise<GlobalSettings> => {
  return AuthClient.patch(`/global-settings/${id}`, { systemSettings: data });
};