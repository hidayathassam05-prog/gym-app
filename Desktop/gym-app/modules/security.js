// SECURITY MODULE - Password Validation, Session Management, Activity Logging

// ============ PASSWORD VALIDATION ============

/**
 * Validate password strength
 * Requirements:
 * - Min 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 digit
 * - At least 1 special character (@, #, $, %, !)
 */
export function validatePasswordStrength(password) {
  const requirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasDigit: /[0-9]/.test(password),
    hasSpecialChar: /[@#$%!]/.test(password)
  };

  const strength = Object.values(requirements).filter(Boolean).length;
  
  return {
    isValid: strength === 5,
    strength, // 0-5
    requirements,
    message: getPasswordStrengthMessage(strength)
  };
}

function getPasswordStrengthMessage(strength) {
  switch(strength) {
    case 0: return "Password too weak";
    case 1: return "Very weak password";
    case 2: return "Weak password";
    case 3: return "Fair password";
    case 4: return "Strong password";
    case 5: return "Very strong password";
    default: return "Invalid";
  }
}

// ============ SESSION MANAGEMENT ============

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

/**
 * Create user session
 */
export function createSession(userId, userRole, userName) {
  const sessionData = {
    userId,
    userRole,
    userName,
    loginTime: new Date().getTime(),
    lastActivity: new Date().getTime(),
    sessionId: generateSessionId(),
    ipAddress: 'localhost' // In production, get actual IP
  };
  
  sessionStorage.setItem('userSession', JSON.stringify(sessionData));
  localStorage.setItem(`session_${userId}`, JSON.stringify(sessionData));
  
  // Log session creation
  logActivity(userId, 'SESSION_CREATED', `Login as ${userRole}`, true);
  
  return sessionData;
}

/**
 * Get current session
 */
export function getSession() {
  const session = sessionStorage.getItem('userSession');
  return session ? JSON.parse(session) : null;
}

/**
 * Update last activity time
 */
export function updateLastActivity(userId) {
  const session = getSession();
  if (session) {
    session.lastActivity = new Date().getTime();
    sessionStorage.setItem('userSession', JSON.stringify(session));
  }
}

/**
 * Check if session is valid and not expired
 */
export function isSessionValid() {
  const session = getSession();
  if (!session) return false;
  
  const now = new Date().getTime();
  const sessionAge = now - session.lastActivity;
  
  if (sessionAge > SESSION_TIMEOUT) {
    endSession(session.userId);
    return false;
  }
  
  return true;
}

/**
 * End user session
 */
export function endSession(userId) {
  logActivity(userId, 'SESSION_ENDED', 'User logout', true);
  sessionStorage.removeItem('userSession');
  localStorage.removeItem(`session_${userId}`);
}

/**
 * Generate unique session ID
 */
function generateSessionId() {
  return 'session_' + Math.random().toString(36).substr(2, 9) + Date.now();
}

// ============ LOGIN ATTEMPT TRACKING ============

/**
 * Check if account is locked due to failed attempts
 */
export function isAccountLocked(email) {
  const lockData = JSON.parse(localStorage.getItem(`lockout_${email}`)) || null;
  
  if (!lockData) return false;
  
  const now = new Date().getTime();
  if (now - lockData.lockTime > LOCKOUT_DURATION) {
    // Lockout expired, unlock account
    localStorage.removeItem(`lockout_${email}`);
    return false;
  }
  
  return true;
}

/**
 * Record failed login attempt
 */
export function recordFailedAttempt(email) {
  const attempts = JSON.parse(localStorage.getItem(`attempts_${email}`)) || {
    count: 0,
    firstAttempt: new Date().getTime()
  };
  
  attempts.count += 1;
  attempts.lastAttempt = new Date().getTime();
  
  if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
    // Lock account
    localStorage.setItem(`lockout_${email}`, JSON.stringify({
      email,
      lockTime: new Date().getTime(),
      reason: 'Too many failed login attempts'
    }));
    logActivity('SYSTEM', 'ACCOUNT_LOCKED', `Account locked: ${email}`, false);
  }
  
  localStorage.setItem(`attempts_${email}`, JSON.stringify(attempts));
  logActivity('SYSTEM', 'FAILED_LOGIN', `Failed login attempt: ${email}`, false);
}

/**
 * Reset failed attempts on successful login
 */
export function resetFailedAttempts(email) {
  localStorage.removeItem(`attempts_${email}`);
}

/**
 * Get remaining login attempts
 */
export function getRemainingAttempts(email) {
  const attempts = JSON.parse(localStorage.getItem(`attempts_${email}`)) || { count: 0 };
  return MAX_LOGIN_ATTEMPTS - attempts.count;
}

// ============ ACTIVITY LOGGING ============

/**
 * Log user activity for security audit trail
 */
export function logActivity(userId, activityType, description, success) {
  const activity = {
    userId,
    activityType,
    description,
    success,
    timestamp: new Date().toISOString(),
    timeInMs: new Date().getTime()
  };
  
  // Get existing log
  const logs = JSON.parse(localStorage.getItem(`activity_log_${userId}`)) || [];
  
  // Keep only last 100 activities
  if (logs.length >= 100) {
    logs.shift();
  }
  
  logs.push(activity);
  localStorage.setItem(`activity_log_${userId}`, JSON.stringify(logs));
}

/**
 * Get activity log for a user
 */
export function getActivityLog(userId) {
  return JSON.parse(localStorage.getItem(`activity_log_${userId}`)) || [];
}

/**
 * Get security report for admin
 */
export function getSecurityReport() {
  return {
    totalFailedAttempts: getTotalFailedAttempts(),
    lockedAccounts: getLockedAccounts(),
    activeSessions: getActiveSessions(),
    recentActivities: getRecentActivities()
  };
}

function getTotalFailedAttempts() {
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('attempts_')) {
      const attempts = JSON.parse(localStorage.getItem(key));
      total += attempts.count || 0;
    }
  }
  return total;
}

function getLockedAccounts() {
  const locked = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('lockout_')) {
      const lockData = JSON.parse(localStorage.getItem(key));
      locked.push(lockData);
    }
  }
  return locked;
}

function getActiveSessions() {
  const sessions = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('session_')) {
      const session = JSON.parse(localStorage.getItem(key));
      sessions.push(session);
    }
  }
  return sessions;
}

function getRecentActivities() {
  const allActivities = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('activity_log_')) {
      const activities = JSON.parse(localStorage.getItem(key));
      allActivities.push(...activities);
    }
  }
  // Sort by timestamp and return last 50
  return allActivities.sort((a, b) => b.timeInMs - a.timeInMs).slice(0, 50);
}

/**
 * Unlock a locked account (admin only)
 */
export function unlockAccount(email) {
  localStorage.removeItem(`lockout_${email}`);
  localStorage.removeItem(`attempts_${email}`);
  logActivity('SYSTEM', 'ACCOUNT_UNLOCKED', `Account unlocked: ${email}`, true);
}

// ============ PASSWORD HASHING (Simple - Use real hashing in production) ============

/**
 * Simple hash function (NOT for production - use bcrypt in production)
 * This is just for demonstration purposes
 */
export function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return 'hash_' + Math.abs(hash).toString(16);
}

// ============ PERMISSION ENFORCEMENT ============

/**
 * Check if user has permission for an action
 */
export function enforcePermission(userRole, action, userId) {
  const actionLog = {
    userId,
    userRole,
    action,
    timestamp: new Date().toISOString(),
    allowed: false
  };
  
  // Check permission based on role
  const hasPermission = checkPermissionByRole(userRole, action);
  actionLog.allowed = hasPermission;
  
  if (!hasPermission) {
    logActivity(userId, 'PERMISSION_DENIED', `Attempted unauthorized action: ${action}`, false);
  } else {
    logActivity(userId, 'ACTION_PERFORMED', `Performed action: ${action}`, true);
  }
  
  return hasPermission;
}

function checkPermissionByRole(role, action) {
  const ROLE_PERMISSIONS = {
    admin: [
      'view_users', 'manage_users', 'delete_users', 'assign_roles',
      'view_analytics', 'manage_trainers', 'manage_classes', 'view_reports',
      'view_dashboard', 'log_workout', 'manage_goals', 'view_health'
    ],
    trainer: [
      'view_assigned_members', 'manage_assigned_members', 'create_class',
      'view_dashboard', 'log_workout', 'manage_goals', 'view_health', 'view_reports'
    ],
    user: [
      'view_dashboard', 'log_workout', 'manage_own_goals',
      'view_own_health', 'manage_own_profile', 'view_own_workouts'
    ]
  };
  
  return ROLE_PERMISSIONS[role] && ROLE_PERMISSIONS[role].includes(action);
}
