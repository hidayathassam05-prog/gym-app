import { auth, onAuthStateChanged } from "./config/firebase-config.js";
import { loadUserDashboard, showAuthScreen } from "./modules/ui.js";
import { deleteWorkout, logWorkout } from "./modules/workout.js";
import { login, signup, logout, deleteAccount } from "./modules/auth.js";
import { 
  isSessionValid, 
  updateLastActivity, 
  endSession,
  getSession,
  validatePasswordStrength
} from "./modules/security.js";
import { uploadProfilePicture, showNotification } from "./modules/profile.js";

// SESSION VALIDATION CHECK
function validateSession() {
  const session = getSession();
  if (!session) return false;
  
  if (!isSessionValid()) {
    alert("⏱️ Your session has expired. Please login again.");
    auth.signOut();
    return false;
  }
  
  updateLastActivity(session.userId);
  return true;
}

// Validate session every 1 minute
setInterval(() => {
  const session = getSession();
  if (session) {
    if (!isSessionValid()) {
      endSession(session.userId);
      auth.signOut();
      showAuthScreen();
    }
  }
}, 60000);

// Update activity on user interaction
document.addEventListener('click', () => {
  const session = getSession();
  if (session) {
    updateLastActivity(session.userId);
  }
});

// AUTH STATE LISTENER
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Check if session exists
    const session = getSession();
    
    if (session && !isSessionValid()) {
      // Session expired
      alert("⏱️ Your session has expired. Please login again.");
      auth.signOut();
      showAuthScreen();
    } else if (session) {
      // Valid session, update activity and load dashboard
      updateLastActivity(session.userId);
      loadUserDashboard(user);
    } else {
      // No session yet (first time loading after auth state change)
      // This can happen due to race conditions during login
      // Session will be created by the login() function
      // Give it a moment to be created, then load dashboard
      setTimeout(() => {
        const newSession = getSession();
        if (newSession && isSessionValid()) {
          loadUserDashboard(user);
        } else {
          // Session still not created, show auth screen
          showAuthScreen();
        }
      }, 100);
    }
  } else {
    showAuthScreen();
  }
});

// EXPOSE AUTH FUNCTIONS TO WINDOW
window.login = login;
window.signup = signup;
window.logout = logout;
window.deleteAccount = deleteAccount;

// EXPOSE WORKOUT FUNCTIONS TO WINDOW
window.logWorkout = logWorkout;
window.deleteWorkoutHandler = deleteWorkout;

// EXPOSE SECURITY UTILITIES
window.validatePasswordStrength = validatePasswordStrength;

// DYNAMIC IMPORTS FOR NUTRITION FUNCTIONS (avoid circular dependencies)
window.setGoal = async () => {
  const { setGoal } = await import("./modules/nutrition.js");
  setGoal();
};

window.completeGoal = async (id, uid) => {
  const { completeGoal } = await import("./modules/nutrition.js");
  completeGoal(id, uid);
};

window.deleteGoal = async (id, uid) => {
  const { deleteGoal } = await import("./modules/nutrition.js");
  deleteGoal(id, uid);
};

window.logMeasurement = async () => {
  const { logMeasurement } = await import("./modules/nutrition.js");
  logMeasurement();
};

window.deleteMeasurement = async (id, uid) => {
  const { deleteMeasurement } = await import("./modules/nutrition.js");
  deleteMeasurement(id, uid);
};

// EXPOSE PROFILE FUNCTIONS TO WINDOW
window.uploadProfilePicture = uploadProfilePicture;
window.showNotification = showNotification;