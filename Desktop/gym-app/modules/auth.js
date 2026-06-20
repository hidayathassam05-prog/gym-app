import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, deleteUser } from "../config/firebase-config.js";
import { showAuthScreen, loadUserDashboard } from "./ui.js";
import { setUserRole } from "./roles.js";
import { 
  validatePasswordStrength, 
  recordFailedAttempt, 
  resetFailedAttempts, 
  isAccountLocked, 
  getRemainingAttempts,
  createSession,
  logActivity,
  unlockAccount
} from "./security.js";

// SIGN UP
export function signup() {
  const name = document.getElementById("signupName").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value;
  const confirm = document.getElementById("signupConfirm").value;
  const role = document.getElementById("signupRole").value;

  if (!name || !email || !password || !confirm || !role) {
    alert("Please fill all fields and select a role");
    return;
  }

  // Validate password strength
  const passwordValidation = validatePasswordStrength(password);
  if (!passwordValidation.isValid) {
    let message = "Password is too weak. Requirements:\n";
    if (!passwordValidation.requirements.minLength) message += "- At least 8 characters\n";
    if (!passwordValidation.requirements.hasUppercase) message += "- At least 1 uppercase letter\n";
    if (!passwordValidation.requirements.hasLowercase) message += "- At least 1 lowercase letter\n";
    if (!passwordValidation.requirements.hasDigit) message += "- At least 1 digit\n";
    if (!passwordValidation.requirements.hasSpecialChar) message += "- At least 1 special character (@, #, $, %, !)\n";
    alert(message);
    return;
  }

  if (password !== confirm) {
    alert("Passwords do not match");
    return;
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      localStorage.setItem(user.uid + "_name", name);
      localStorage.setItem(user.uid + "_joinDate", new Date().toLocaleDateString());
      setUserRole(user.uid, role);
      logActivity(user.uid, 'ACCOUNT_CREATED', `New account created as ${role}`, true);
      
      // Automatically create session and load dashboard after signup
      createSession(user.uid, role, name);
      
      alert("✅ Account created successfully as " + role + "!\n\nWelcome " + name + "!");
      clearAuthInputs();
      
      // Load the user's dashboard immediately
      loadUserDashboard(user.uid);
    })
    .catch(err => {
      console.error("Signup error:", err);
      logActivity('SYSTEM', 'SIGNUP_ERROR', `Signup failed: ${err.message}`, false);
      alert("Error: " + err.message);
    });
}

// LOGIN
export function login() {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    alert("Please enter email and password");
    return;
  }

  // Check if account is locked
  if (isAccountLocked(email)) {
    alert("❌ Your account is locked due to too many failed login attempts.\n\nPlease try again in 15 minutes or contact an administrator.");
    return;
  }

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      const role = localStorage.getItem(user.uid + "_role") || "user";
      const name = localStorage.getItem(user.uid + "_name") || "User";
      
      // Reset failed attempts on successful login
      resetFailedAttempts(email);
      
      // Create session
      createSession(user.uid, role, name);
      
      alert("✅ Login successful! Welcome " + name);
      clearAuthInputs();
      
      // Load the user's dashboard
      loadUserDashboard(user);
    })
    .catch(err => {
      console.error("Login error:", err);
      recordFailedAttempt(email);
      const remaining = getRemainingAttempts(email);
      
      if (remaining <= 0) {
        alert("❌ Account locked due to too many failed attempts.\n\nPlease try again in 15 minutes.");
      } else {
        alert(`❌ Login failed: ${err.message}\n\n⚠️ Remaining attempts: ${remaining}`);
      }
    });
}

// LOGOUT
export async function logout() {
  if (confirm("Are you sure you want to logout?")) {
    const user = auth.currentUser;
    if (user) {
      logActivity(user.uid, 'USER_LOGOUT', 'User logged out', true);
      const { endSession } = await import("./security.js");
      endSession(user.uid);
    }
    signOut(auth)
      .then(() => {
        console.log("Logged out");
      })
      .catch(err => alert("Error: " + err.message));
  }
}

// DELETE ACCOUNT
export async function deleteAccount() {
  if (confirm("⚠️ This will permanently delete your account and all data. Continue?")) {
    const user = auth.currentUser;
    deleteUser(user)
      .then(() => {
        logActivity(user.uid, 'ACCOUNT_DELETED', 'Account permanently deleted', true);
        localStorage.removeItem(user.uid + "_name");
        localStorage.removeItem(user.uid + "_joinDate");
        localStorage.removeItem(user.uid + "_role");
        localStorage.removeItem(user.uid + "_workouts");
        localStorage.removeItem(user.uid + "_water");
        localStorage.removeItem(user.uid + "_goals");
        localStorage.removeItem(user.uid + "_measurements");
        alert("✅ Account deleted successfully");
      })
      .catch(err => alert("Error: " + err.message));
  }
}

// CLEAR AUTH INPUTS
function clearAuthInputs() {
  document.getElementById("loginEmail").value = "";
  document.getElementById("loginPassword").value = "";
  document.getElementById("signupName").value = "";
  document.getElementById("signupEmail").value = "";
  document.getElementById("signupPassword").value = "";
  document.getElementById("signupConfirm").value = "";
  document.getElementById("signupRole").value = "user";
}

export { auth };
