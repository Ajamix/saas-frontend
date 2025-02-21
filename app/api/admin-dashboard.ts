import AuthClient from './auth-client';

interface DashboardOverview {
  overview: {
    totalUsers: number;
    totalTenants: number;
    activeSubscriptions: number;
    totalRevenue: number;
    activeTenantsCount: number;
    inactiveTenantsCount: number;
  };
  recentTenants: Array<{
    id: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    name: string;
    subdomain: string;
    isActive: boolean;
    settings: any;
    users: Array<{
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
    }>;
  }>;
}

interface GrowthData {
  period: string;
  count: number;
}

interface RevenueData {
  period: string;
  revenue: number;
}

type Period = 'daily' | 'weekly' | 'monthly';

export const getAdminDashboardOverview = async (): Promise<DashboardOverview> => {
  return AuthClient.get('/admin-dashboard');
};

export const getTenantGrowth = async (period: Period): Promise<GrowthData[]> => {
  return AuthClient.get(`/admin-dashboard/tenant-growth?period=${period}`);
};

export const getRevenueData = async (period: Period): Promise<RevenueData[]> => {
  return AuthClient.get(`/admin-dashboard/revenue?period=${period}`);
}; 