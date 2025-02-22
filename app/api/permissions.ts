import AuthClient from './auth-client';
import { Permission } from './roles';

// Get all available permissions
export const getPermissions = async (): Promise<Permission[]> => {
  return AuthClient.get('/permissions');
}; 