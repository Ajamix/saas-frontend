export interface LoginCredentials {
  email: string;
  password: string;
  subdomain?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  tenantName: string;
  subdomain: string;
} 