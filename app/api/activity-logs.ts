import AuthClient from './auth-client';

export interface ActivityLogDetails {
  data?: Record<string, any>;
  channels?: string[];
  notificationType?: string;
}

export interface ActivityLog {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  type: string;
  action: string;
  details: ActivityLogDetails;
  ipAddress: string | null;
  userAgent: string | null;
  userId: string;
  tenantId: string;
  resourceType: string | null;
  resourceId: string | null;
  isSystemGenerated: boolean;
  status: string | null;
}

export interface ActivityLogsResponse {
  data: ActivityLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetActivityLogsParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
}

// Get tenant activity logs (for tenant users)
export const getActivityLogs = async (params: GetActivityLogsParams = {}): Promise<ActivityLogsResponse> => {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.append('page', params.page.toString());
  if (params.limit) searchParams.append('limit', params.limit.toString());
  if (params.search) searchParams.append('search', params.search);
  if (params.type) searchParams.append('type', params.type);
  if (params.startDate) searchParams.append('startDate', params.startDate);
  if (params.endDate) searchParams.append('endDate', params.endDate);

  return AuthClient.get(`/activity-logs?${searchParams.toString()}`);
};

// Get all activity logs (for super admin)
export const getAllActivityLogs = async (params: GetActivityLogsParams = {}): Promise<ActivityLogsResponse> => {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.append('page', params.page.toString());
  if (params.limit) searchParams.append('limit', params.limit.toString());
  if (params.search) searchParams.append('search', params.search);
  if (params.type) searchParams.append('type', params.type);
  if (params.startDate) searchParams.append('startDate', params.startDate);
  if (params.endDate) searchParams.append('endDate', params.endDate);

  return AuthClient.get(`/activity-logs/all?${searchParams.toString()}`);
}; 