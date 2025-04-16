
import { UserRole } from "@/types";

// Define permissions for each role
export const rolePermissions: Record<UserRole, string[]> = {
  [UserRole.ADMIN]: [
    'user:create', 'user:read', 'user:update', 'user:delete',
    'course:create', 'course:read', 'course:update', 'course:delete',
    'enrollment:create', 'enrollment:read', 'enrollment:update', 'enrollment:delete',
    'statistics:read', 'system:manage'
  ],
  [UserRole.TEACHER]: [
    'course:read', 'course:update',
    'enrollment:read',
    'user:read',
    'statistics:read'
  ],
  [UserRole.USER]: [
    'course:read',
    'enrollment:create', 'enrollment:read', 'enrollment:update',
    'user:read'
  ]
};

// Permission-based check functions
export const hasPermission = (userRole: UserRole | undefined, permission: string): boolean => {
  if (!userRole) return false;
  
  const userPermissions = rolePermissions[userRole] || [];
  return userPermissions.includes(permission);
};

// Check if user has any of the provided permissions
export const checkPermissions = (userRole: UserRole | undefined, permissions: string[]): boolean => {
  if (!userRole) return false;
  if (permissions.length === 0) return true;
  
  const userPermissions = rolePermissions[userRole] || [];
  return permissions.some(permission => userPermissions.includes(permission));
};
