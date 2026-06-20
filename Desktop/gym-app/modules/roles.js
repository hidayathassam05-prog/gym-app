import { enforcePermission, logActivity } from "./security.js";

// ROLE PERMISSIONS
const ROLES = {
  ADMIN: 'admin',
  TRAINER: 'trainer',
  USER: 'user'
};

const PERMISSIONS = {
  admin: {
    canViewUsers: true,
    canManageUsers: true,
    canManageTrainers: true,
    canViewReports: true,
    canManageClasses: true,
    canSetPrices: true,
    canViewAnalytics: true,
    canLogWorkout: false,
    canViewDashboard: true,
    canDeleteUsers: true,
    canEditRoles: true,
    canViewSecurityLog: true,
    canUnlockAccounts: true,
    canViewActivityLog: true
  },
  trainer: {
    canViewUsers: true,
    canManageUsers: false,
    canManageTrainers: false,
    canViewReports: true,
    canManageClasses: true,
    canSetPrices: false,
    canViewAnalytics: false,
    canLogWorkout: true,
    canViewDashboard: true,
    canDeleteUsers: false,
    canEditRoles: false,
    canViewSecurityLog: false,
    canUnlockAccounts: false,
    canViewActivityLog: false
  },
  user: {
    canViewUsers: false,
    canManageUsers: false,
    canManageTrainers: false,
    canViewReports: false,
    canManageClasses: false,
    canSetPrices: false,
    canViewAnalytics: false,
    canLogWorkout: true,
    canViewDashboard: true,
    canDeleteUsers: false,
    canEditRoles: false,
    canViewSecurityLog: false,
    canUnlockAccounts: false,
    canViewActivityLog: false
  }
};

// CHECK PERMISSION with security enforcement
export function hasPermission(role, permission) {
  return PERMISSIONS[role] && PERMISSIONS[role][permission];
}

// CHECK PERMISSION with security logging
export function checkPermissionWithLogging(userId, role, action) {
  const allowed = hasPermission(role, action);
  if (!allowed) {
    logActivity(userId, 'PERMISSION_DENIED', `Denied action: ${action}`, false);
  } else {
    logActivity(userId, 'ACTION_ALLOWED', `Allowed action: ${action}`, true);
  }
  return allowed;
}

// GET USER ROLE FROM STORAGE
export function getUserRole(userId) {
  return localStorage.getItem(userId + "_role") || ROLES.USER;
}

// SET USER ROLE (Admin only - should be called from security context)
export function setUserRole(userId, role) {
  if (!['admin', 'trainer', 'user'].includes(role)) {
    throw new Error('Invalid role');
  }
  localStorage.setItem(userId + "_role", role);
  logActivity('SYSTEM', 'ROLE_UPDATED', `User ${userId} role set to ${role}`, true);
}

// GET ROLE DISPLAY NAME
export function getRoleDisplayName(role) {
  const names = {
    admin: 'Administrator',
    trainer: 'Trainer',
    user: 'Member'
  };
  return names[role] || role;
}

// GET ROLE DESCRIPTION
export function getRoleDescription(role) {
  const descriptions = {
    admin: 'Full system access - Manage users, classes, pricing, and analytics',
    trainer: 'Manage assigned members and classes - View reports and logs',
    user: 'Personal fitness tracking - Log workouts, health data, and goals'
  };
  return descriptions[role] || 'Standard user access';
}

// GET ROLE PRIVILEGES
export function getRolePrivileges(role) {
  const privileges = {
    admin: [
      'User Management',
      'System Analytics',
      'Security Controls',
      'Role Assignment',
      'Class Management',
      'Pricing Control',
      'Activity Monitoring'
    ],
    trainer: [
      'Client Management',
      'Class Creation',
      'Report Viewing',
      'Member Assignment',
      'Workout Tracking'
    ],
    user: [
      'Personal Dashboard',
      'Workout Logging',
      'Health Tracking',
      'Goal Management',
      'Profile Management'
    ]
  };
  return privileges[role] || [];
}

// VALIDATE PERMISSION FOR SENSITIVE OPERATION
export function validateSensitiveOperation(userId, userRole, operation) {
  const sensitiveOps = {
    deleteUser: { requiredRole: 'admin', logLevel: 'critical' },
    editRole: { requiredRole: 'admin', logLevel: 'critical' },
    viewActivityLog: { requiredRole: 'admin', logLevel: 'high' },
    unlockAccount: { requiredRole: 'admin', logLevel: 'high' },
    manageUsers: { requiredRole: 'admin', logLevel: 'high' }
  };

  const opConfig = sensitiveOps[operation];
  if (!opConfig) return true; // Not a sensitive operation

  const allowed = userRole === opConfig.requiredRole;
  
  if (!allowed) {
    logActivity(userId, 'SECURITY_VIOLATION', 
      `Attempted ${operation} without proper authorization (required: ${opConfig.requiredRole})`,
      false
    );
  }

  return allowed;
}

export { ROLES, PERMISSIONS };

