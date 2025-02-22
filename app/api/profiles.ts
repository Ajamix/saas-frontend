import AuthClient from './auth-client';

export interface SocialLinks {
  linkedin?: string;
  twitter?: string;
  github?: string;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
}

export interface Preferences {
  theme: 'light' | 'dark' | 'system';
  notifications: NotificationPreferences;
  language: string;
}

export interface Profile {
  userId: string;
  avatar?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  title?: string;
  department?: string;
  bio?: string;
  socialLinks: SocialLinks;
  preferences: Preferences;
}

// Get current user's profile
export const getMyProfile = async (): Promise<Profile> => {
  return AuthClient.get('/profiles/me');
};

// Update profile
export const updateProfile = async (data: Partial<Omit<Profile, 'userId' | 'socialLinks' | 'preferences'>>): Promise<Profile> => {
  return AuthClient.patch('/profiles/me', data);
};

// Update social links
export const updateSocialLinks = async (links: SocialLinks): Promise<Profile> => {
  return AuthClient.patch('/profiles/me/social-links', links);
};

// Update preferences
export const updatePreferences = async (preferences: Preferences): Promise<Profile> => {
  return AuthClient.patch('/profiles/me/preferences', preferences);
};

// Upload avatar
export const uploadAvatar = async (file: File): Promise<{ avatarUrl: string }> => {
  const formData = new FormData();
  formData.append('avatar', file);

  return AuthClient.post('/profiles/me/avatar', formData);
};

// Create profile
export const createProfile = async (data: Partial<Omit<Profile, 'userId'>>): Promise<Profile> => {
  return AuthClient.post('/profiles', data);
};

// Check if profile exists
export const checkProfile = async (): Promise<{ exists: boolean }> => {
  try {
    await getMyProfile();
    return { exists: true };
  } catch (error) {
    return { exists: false };
  }
};