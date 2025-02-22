import AuthClient from './auth-client';

export interface TenantDashboardOverview {
  overview: {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    totalRoles: number;
    subscription: any | null;
  };
  recentUsers: Array<{
    id: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    email: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    isSuperAdmin: boolean;
    tenantId: string;
    roles: string[];
    hasSetupProfile: boolean;
  }>;
  roles: any[];
}

export interface UserActivity {
  period: string;
  newUsers: number;
}

export interface RoleDistribution {
  role: string;
  userCount: number;
}

export const getTenantDashboardOverview = async (): Promise<TenantDashboardOverview> => {
  return AuthClient.get('/tenant-dashboard');
};

export const getUserActivity = async (): Promise<UserActivity[]> => {
  return AuthClient.get('/tenant-dashboard/user-activity');
};

export const getRoleDistribution = async (): Promise<RoleDistribution[]> => {
  return AuthClient.get('/tenant-dashboard/role-distribution');
}; 