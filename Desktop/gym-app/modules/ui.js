import { signup, login, logout, deleteAccount, auth } from "./auth.js";
import { logWorkout, displayAllWorkouts, displayRecentWorkouts, getAllWorkouts } from "./workout.js";
import { updateDashboard } from "./dashboard.js";
import { logWaterIntake, updateWaterDisplay, displayGoals, displayMeasurements } from "./nutrition.js";
import { getUserRole, hasPermission, getRoleDisplayName } from "./roles.js";
import { displayAllUsers, displayClasses, displayAnalytics } from "./admin.js";
import { displayProfilePicture, updateProfileStats, showNotification } from "./profile.js";

// STORE CURRENT USER ROLE GLOBALLY
let currentUserRole = 'user';

// SWITCH TABS
export function switchTab(tab) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
  
  document.getElementById(tab + 'Tab').classList.add('active');
  event.target.classList.add('active');
}

// SHOW AUTH SCREEN
export function showAuthScreen() {
  clearAllUI();
  document.getElementById("authScreen").classList.add("active");
  document.getElementById("dashboardScreen").classList.remove("active");
}

// CLEAR ALL UI - FIX DATA ISOLATION
function clearAllUI() {
  // Clear dashboard stats
  const statIds = ['workoutCount', 'totalSessions', 'caloriesBurned', 'streak', 
                   'statTotal', 'statHours', 'statCalories', 'recentList', 'allWorkouts',
                   'goalsList', 'measurementsList', 'usersList', 'classList', 'analyticsContainer'];
  
  statIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = '';
  });

  // Clear profile info
  document.getElementById("userName").textContent = "User";
  document.getElementById("profileName").textContent = "-";
  document.getElementById("profileEmail").textContent = "-";
  document.getElementById("memberDate").textContent = "-";
  const roleEl = document.getElementById("userRole");
  if (roleEl) roleEl.textContent = "-";
}

// LOAD USER DASHBOARD
export function loadUserDashboard(user) {
  clearAllUI();
  document.getElementById("authScreen").classList.remove("active");
  document.getElementById("dashboardScreen").classList.add("active");

  const userName = localStorage.getItem(user.uid + "_name") || user.email;
  const role = getUserRole(user.uid);
  currentUserRole = role; // Store globally for permission checks
  const roleDisplayName = getRoleDisplayName(role);

  document.getElementById("userName").textContent = userName.split(" ")[0];
  document.getElementById("profileName").textContent = userName;
  document.getElementById("profileEmail").textContent = user.email;
  document.getElementById("userRole").textContent = roleDisplayName;
  document.getElementById("profileRole").textContent = roleDisplayName;

  // Update navbar with user info and profile picture
  document.getElementById("navUserName").textContent = userName.split(" ")[0];
  document.getElementById("navUserRole").textContent = role === 'admin' ? 'Admin' : role === 'trainer' ? 'Trainer' : 'Member';
  
  const joinDate = localStorage.getItem(user.uid + "_joinDate") || new Date().toLocaleDateString();
  document.getElementById("memberDate").textContent = joinDate;

  // Display profile picture
  displayProfilePicture(user.uid);

  // Update navbar based on role
  updateNavigation(user.uid, role);
  
  // Hide all sections first
  hideAllSections();
  
  // Show only appropriate sections based on role
  showRoleBasedSections(role);

  // Show dashboard section
  document.getElementById("dashboardSection").classList.add("active");

  // Load role-specific data
  if (role === 'admin') {
    loadAdminDashboard();
  } else if (role === 'trainer') {
    loadTrainerDashboard(user.uid);
  } else {
    loadMemberDashboard(user.uid);
  }

  // Update profile stats and achievements
  updateProfileStats(user.uid);
}

// HIDE ALL SECTIONS
function hideAllSections() {
  document.querySelectorAll('.section').forEach(el => el.classList.remove('active'));
}

// SHOW ONLY SECTIONS BASED ON ROLE
// Note: CSS class handling (display: none/block) is managed by showSection()
// This function is kept for consistency but doesn't set display styles
function showRoleBasedSections(role) {
  // Permission checking is done in showSection() via checkSectionAccess()
  // Sections are only shown when user clicks navigation and has permission
}

// LOAD ADMIN DASHBOARD
function loadAdminDashboard() {
  // Show admin dashboard
  document.getElementById("adminDashboard").style.display = 'block';
  document.getElementById("trainerDashboard").style.display = 'none';
  document.getElementById("memberDashboard").style.display = 'none';
  
  // Load data for admin
  displayAnalytics();
  displayAllUsers();
  
  // Update admin stats
  updateAdminStats();
}

// LOAD TRAINER DASHBOARD
function loadTrainerDashboard(uid) {
  // Show trainer dashboard
  document.getElementById("adminDashboard").style.display = 'none';
  document.getElementById("trainerDashboard").style.display = 'block';
  document.getElementById("memberDashboard").style.display = 'none';
  
  // Load data for trainer
  updateDashboard(uid);
  displayClasses(uid);
  displayAllWorkouts(uid);
  
  // Update trainer stats
  updateTrainerStats(uid);
}

// LOAD MEMBER DASHBOARD
function loadMemberDashboard(uid) {
  // Show member dashboard
  document.getElementById("adminDashboard").style.display = 'none';
  document.getElementById("trainerDashboard").style.display = 'none';
  document.getElementById("memberDashboard").style.display = 'block';
  
  // Load data for member
  updateDashboard(uid);
  updateWaterDisplay(uid);
  displayGoals(uid);
  displayMeasurements(uid);
  displayClasses();
}

// UPDATE ADMIN STATS
function updateAdminStats() {
  // This would typically fetch real data from Firebase
  document.getElementById("adminMembersCount").textContent = "0";
  document.getElementById("adminTrainersCount").textContent = "0";
  document.getElementById("adminClassesCount").textContent = "0";
  document.getElementById("adminRevenueCount").textContent = "$0";
}

// UPDATE TRAINER STATS
function updateTrainerStats(uid) {
  // This would typically fetch real data from Firebase
  document.getElementById("trainerClientsCount").textContent = "0";
  document.getElementById("trainerClassesCount").textContent = "0";
  document.getElementById("trainerWorkoutsCount").textContent = "0";
  document.getElementById("trainerRatingCount").textContent = "4.8";
}

// UPDATE NAVBAR BASED ON ROLE
function updateNavigation(userId, role) {
  // Hide all nav buttons first
  document.getElementById('navDashboard').style.display = 'block';
  document.getElementById('navWorkouts').style.display = 'block';
  document.getElementById('navHealth').style.display = 'block';
  document.getElementById('navGoals').style.display = 'block';
  document.getElementById('navClasses').style.display = 'none';
  document.getElementById('navUsers').style.display = 'none';
  document.getElementById('navAnalytics').style.display = 'none';
  document.getElementById('navProfile').style.display = 'block';

  // Show/hide based on role
  if (role === 'admin') {
    document.getElementById('navWorkouts').style.display = 'none';
    document.getElementById('navHealth').style.display = 'none';
    document.getElementById('navGoals').style.display = 'none';
    document.getElementById('navUsers').style.display = 'block';
    document.getElementById('navAnalytics').style.display = 'block';
    document.getElementById('navClasses').style.display = 'block';
  } else if (role === 'trainer') {
    document.getElementById('navGoals').style.display = 'none';
    document.getElementById('navClasses').style.display = 'block';
  } else {
    // Regular user
    document.getElementById('navClasses').style.display = 'block';
  }
}

// SHOW SECTION WITH PERMISSION CHECK
export function showSection(section) {
  // Check permissions based on role
  const canAccess = checkSectionAccess(section, currentUserRole);
  
  if (!canAccess) {
    alert("You don't have permission to access this section.");
    return;
  }

  hideAllSections();
  const sectionEl = document.getElementById(section + "Section");
  if (sectionEl) {
    sectionEl.classList.add('active');
  }
  
  const user = auth.currentUser;
  if (section === "workouts" && user) {
    displayAllWorkouts(user.uid);
  } else if (section === "health" && user) {
    updateWaterDisplay(user.uid);
    displayMeasurements(user.uid);
  } else if (section === "goals" && user) {
    displayGoals(user.uid);
  } else if (section === "users" && user) {
    displayAllUsers();
  } else if (section === "classes") {
    displayClasses();
  } else if (section === "analytics" && user) {
    displayAnalytics();
  } else if (section === "dashboard") {
    // Already on dashboard
  }
}

// CHECK IF USER CAN ACCESS A SECTION
function checkSectionAccess(section, role) {
  const permissions = {
    dashboard: ['admin', 'trainer', 'user'],
    workouts: ['trainer', 'user'],
    health: ['user'],
    goals: ['user'],
    classes: ['admin', 'trainer', 'user'],
    users: ['admin'],
    analytics: ['admin'],
    profile: ['admin', 'trainer', 'user']
  };

  return permissions[section] && permissions[section].includes(role);
}

// SHOW PASSWORD STRENGTH INDICATOR
export function showPasswordStrength() {
  const password = document.getElementById("signupPassword").value;
  const strengthBar = document.getElementById("strengthIndicator");
  const strengthMessage = document.getElementById("strengthMessage");
  
  const { validatePasswordStrength } = window;
  if (!validatePasswordStrength) return;
  
  const validation = validatePasswordStrength(password);
  const strength = validation.strength;
  const colors = ['#d32f2f', '#f57c00', '#fbc02d', '#689f38', '#388e3c'];
  
  // Update bar
  strengthBar.style.width = ((strength / 5) * 100) + '%';
  strengthBar.style.backgroundColor = colors[strength];
  
  // Update message
  strengthMessage.textContent = 'Password strength: ' + validation.message;
  strengthMessage.style.color = colors[strength];
  
  // Update requirements
  const requirements = validation.requirements;
  updateRequirement('req-length', requirements.minLength);
  updateRequirement('req-upper', requirements.hasUppercase);
  updateRequirement('req-lower', requirements.hasLowercase);
  updateRequirement('req-digit', requirements.hasDigit);
  updateRequirement('req-special', requirements.hasSpecialChar);
}

// UPDATE REQUIREMENT DISPLAY
function updateRequirement(elementId, isMet) {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  if (isMet) {
    element.classList.add('met');
    element.classList.remove('unmet');
    element.textContent = '✓ ' + element.textContent.substring(2);
  } else {
    element.classList.remove('met');
    element.classList.add('unmet');
    element.textContent = '✗ ' + element.textContent.substring(2);
  }
}

// SHOW ROLE INFO
export function showRoleInfo() {
  const role = document.getElementById("signupRole").value;
  const roleInfo = document.getElementById("roleInfo");
  
  const roleDescriptions = {
    user: '👤 Member - Track workouts, health metrics, and personal goals',
    trainer: '👨‍🏫 Trainer - Manage clients and create training classes',
    admin: '🔐 Administrator - Full system management and analytics'
  };
  
  if (roleInfo) {
    roleInfo.textContent = roleDescriptions[role] || 'Select your role to see available features';
  }
}

// ATTACH GLOBAL FUNCTIONS FOR HTML ONCLICK
window.switchTab = switchTab;
window.showPasswordStrength = showPasswordStrength;
window.showRoleInfo = showRoleInfo;
window.login = login;
window.signup = signup;
window.logout = logout;
window.deleteAccount = deleteAccount;
window.logWorkout = logWorkout;
window.showSection = showSection;
window.logWaterIntake = logWaterIntake;
window.setGoal = async () => {
  const { setGoal } = await import("./nutrition.js");
  setGoal();
};
window.completeGoal = async (id, uid) => {
  const { completeGoal } = await import("./nutrition.js");
  completeGoal(id, uid);
};
window.deleteGoal = async (id, uid) => {
  const { deleteGoal } = await import("./nutrition.js");
  deleteGoal(id, uid);
};
window.logMeasurement = async () => {
  const { logMeasurement } = await import("./nutrition.js");
  logMeasurement();
};
window.deleteMeasurement = async (id, uid) => {
  const { deleteMeasurement } = await import("./nutrition.js");
  deleteMeasurement(id, uid);
};
window.joinClass = async (classId) => {
  const { joinClass } = await import("./admin.js");
  joinClass(classId);
};
window.editUserRole = async (userId, email) => {
  const { editUserRole } = await import("./admin.js");
  editUserRole(userId, email);
};
window.removeUser = async (userId) => {
  const { removeUser } = await import("./admin.js");
  removeUser(userId);
};
