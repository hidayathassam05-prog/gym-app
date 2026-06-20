import { auth } from "./auth.js";
import { logActivity, getActivityLog, getSecurityReport, unlockAccount } from "./security.js";
import { getUserRole, validateSensitiveOperation } from "./roles.js";

// GET ALL USERS (ADMIN ONLY)
export function getAllUsers() {
  return JSON.parse(localStorage.getItem("gym_all_users")) || [];
}

// ADD USER TO SYSTEM (ADMIN)
export function addUserToSystem(user) {
  const adminUser = auth.currentUser;
  if (!adminUser) {
    alert("⛔ Authentication required");
    return;
  }

  const adminRole = getUserRole(adminUser.uid);
  if (adminRole !== 'admin') {
    alert("⛔ Only administrators can add users to the system");
    logActivity(adminUser.uid, 'UNAUTHORIZED_ACCESS', 'Attempted to add user without admin role', false);
    return;
  }

  let users = getAllUsers();
  users.push(user);
  localStorage.setItem("gym_all_users", JSON.stringify(users));
  logActivity(adminUser.uid, 'USER_ADDED', `User added: ${user.email} as ${user.role}`, true);
}

// DISPLAY USERS (ADMIN)
export function displayAllUsers() {
  const adminUser = auth.currentUser;
  if (!adminUser) {
    alert("⛔ Authentication required");
    return;
  }

  const adminRole = getUserRole(adminUser.uid);
  if (adminRole !== 'admin') {
    alert("⛔ Only administrators can view all users");
    return;
  }

  const users = getAllUsers();
  const container = document.getElementById("usersList");

  if (users.length === 0) {
    container.innerHTML = '<p class="empty-message">No users in system</p>';
    return;
  }

  container.innerHTML = users.map(u => `
    <div class="user-card">
      <div class="user-info">
        <h4>${u.name}</h4>
        <p>Email: ${u.email}</p>
        <p>Role: <span class="role-badge ${u.role}">${u.role}</span></p>
        <p style="font-size: 12px; color: #6b7280;">Joined: ${u.joinDate}</p>
      </div>
      <div class="user-actions">
        <button class="btn-small btn-edit" onclick="window.editUserRole('${u.id}', '${u.email}')">Edit Role</button>
        <button class="btn-small btn-danger" onclick="window.removeUser('${u.id}')">Remove</button>
      </div>
    </div>
  `).join("");
}

// REMOVE USER (ADMIN)
export function removeUser(userId) {
  const adminUser = auth.currentUser;
  if (!adminUser) {
    alert("⛔ Authentication required");
    return;
  }

  const adminRole = getUserRole(adminUser.uid);
  if (!validateSensitiveOperation(adminUser.uid, adminRole, 'deleteUser')) {
    alert("⛔ Only administrators can remove users");
    return;
  }

  if (confirm("⚠️ Remove this user from the system?")) {
    let users = getAllUsers();
    const userToRemove = users.find(u => u.id === userId);
    users = users.filter(u => u.id !== userId);
    localStorage.setItem("gym_all_users", JSON.stringify(users));
    logActivity(adminUser.uid, 'USER_REMOVED', `User removed: ${userToRemove.email}`, true);
    displayAllUsers();
    alert("✅ User removed successfully");
  }
}

// EDIT USER ROLE (ADMIN)
export function editUserRole(userId, userEmail) {
  const adminUser = auth.currentUser;
  if (!adminUser) {
    alert("⛔ Authentication required");
    return;
  }

  const adminRole = getUserRole(adminUser.uid);
  if (!validateSensitiveOperation(adminUser.uid, adminRole, 'editRole')) {
    alert("⛔ Only administrators can edit user roles");
    return;
  }

  const newRole = prompt("Enter new role (admin, trainer, user):", "user");
  if (!newRole) return;

  if (!['admin', 'trainer', 'user'].includes(newRole)) {
    alert("⛔ Invalid role. Must be: admin, trainer, or user");
    return;
  }

  let users = getAllUsers();
  const user = users.find(u => u.id === userId);
  if (user) {
    const oldRole = user.role;
    user.role = newRole;
    localStorage.setItem("gym_all_users", JSON.stringify(users));
    logActivity(adminUser.uid, 'ROLE_CHANGED', `User role changed: ${userEmail} from ${oldRole} to ${newRole}`, true);
    displayAllUsers();
    alert("✅ Role updated to " + newRole);
  }
}

// GET MEMBERS (TRAINERS CAN SEE)
export function getMembers() {
  const users = getAllUsers();
  return users.filter(u => u.role === 'user');
}

// ASSIGN MEMBER TO TRAINER
export function assignMemberToTrainer(memberId, trainerId) {
  let assignments = JSON.parse(localStorage.getItem("gym_trainer_assignments")) || [];
  const existing = assignments.find(a => a.memberId === memberId);
  
  if (existing) {
    existing.trainerId = trainerId;
  } else {
    assignments.push({ memberId, trainerId });
  }
  
  localStorage.setItem("gym_trainer_assignments", JSON.stringify(assignments));
}

// GET TRAINER'S MEMBERS
export function getTrainerMembers(trainerId) {
  const assignments = JSON.parse(localStorage.getItem("gym_trainer_assignments")) || [];
  const users = getAllUsers();
  
  return assignments
    .filter(a => a.trainerId === trainerId)
    .map(a => users.find(u => u.id === a.memberId))
    .filter(u => u);
}

// CREATE CLASS (TRAINER/ADMIN)
export function createClass() {
  const user = auth.currentUser;
  if (!user) return;

  const className = document.getElementById("className").value.trim();
  const time = document.getElementById("classTime").value;
  const capacity = parseInt(document.getElementById("classCapacity").value);

  if (!className || !time || !capacity) {
    alert("Please fill all fields");
    return;
  }

  const gymClass = {
    id: Date.now(),
    name: className,
    time,
    capacity,
    trainerId: user.uid,
    createdDate: new Date().toLocaleDateString(),
    members: []
  };

  let classes = JSON.parse(localStorage.getItem("gym_classes")) || [];
  classes.push(gymClass);
  localStorage.setItem("gym_classes", JSON.stringify(classes));

  document.getElementById("className").value = "";
  document.getElementById("classTime").value = "";
  document.getElementById("classCapacity").value = "";
  
  displayClasses(user.uid);
  alert("Class created!");
}

// GET ALL CLASSES
export function getAllClasses() {
  return JSON.parse(localStorage.getItem("gym_classes")) || [];
}

// DISPLAY CLASSES
export function displayClasses(trainerId = null) {
  let classes = getAllClasses();
  
  if (trainerId) {
    classes = classes.filter(c => c.trainerId === trainerId);
  }

  const container = document.getElementById("classList");

  if (classes.length === 0) {
    container.innerHTML = '<p class="empty-message">No classes available</p>';
    return;
  }

  container.innerHTML = classes.map(c => `
    <div class="class-card">
      <div class="class-info">
        <h4>${c.name}</h4>
        <p>⏰ ${c.time}</p>
        <p>👥 ${c.members.length}/${c.capacity} members</p>
      </div>
      <button class="btn-small btn-primary" onclick="window.joinClass('${c.id}')">Join Class</button>
    </div>
  `).join("");
}

// JOIN CLASS
export function joinClass(classId) {
  const user = auth.currentUser;
  if (!user) return;

  let classes = getAllClasses();
  const gymClass = classes.find(c => c.id === classId);

  if (!gymClass) {
    alert("Class not found");
    return;
  }

  if (gymClass.members.includes(user.uid)) {
    alert("Already joined this class");
    return;
  }

  if (gymClass.members.length >= gymClass.capacity) {
    alert("Class is full");
    return;
  }

  gymClass.members.push(user.uid);
  localStorage.setItem("gym_classes", JSON.stringify(classes));
  displayClasses();
  alert("Joined class!");
}

// GET ANALYTICS (ADMIN)
export function getGymAnalytics() {
  const users = getAllUsers();
  const classes = getAllClasses();
  const totalWorkouts = users.reduce((sum, u) => {
    const workouts = JSON.parse(localStorage.getItem(u.id + "_workouts")) || [];
    return sum + workouts.length;
  }, 0);

  return {
    totalUsers: users.length,
    totalTrainers: users.filter(u => u.role === 'trainer').length,
    totalMembers: users.filter(u => u.role === 'user').length,
    totalClasses: classes.length,
    totalWorkouts: totalWorkouts,
    activeClasses: classes.filter(c => c.members.length > 0).length
  };
}

// DISPLAY ANALYTICS (ADMIN)
export function displayAnalytics() {
  const analytics = getGymAnalytics();
  const container = document.getElementById("analyticsContainer");

  container.innerHTML = `
    <div class="analytics-grid">
      <div class="analytics-card">
        <h4>Total Users</h4>
        <p class="big-number">${analytics.totalUsers}</p>
      </div>
      <div class="analytics-card">
        <h4>Trainers</h4>
        <p class="big-number">${analytics.totalTrainers}</p>
      </div>
      <div class="analytics-card">
        <h4>Members</h4>
        <p class="big-number">${analytics.totalMembers}</p>
      </div>
      <div class="analytics-card">
        <h4>Classes</h4>
        <p class="big-number">${analytics.totalClasses}</p>
      </div>
      <div class="analytics-card">
        <h4>Total Workouts</h4>
        <p class="big-number">${analytics.totalWorkouts}</p>
      </div>
      <div class="analytics-card">
        <h4>Active Classes</h4>
        <p class="big-number">${analytics.activeClasses}</p>
      </div>
    </div>
  `;
}
