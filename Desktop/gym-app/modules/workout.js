import { auth } from "./auth.js";
import { updateDashboard } from "./dashboard.js";

// LOG WORKOUT
export function logWorkout() {
  const user = auth.currentUser;
  if (!user) return;

  const type = document.getElementById("exerciseType").value;
  const duration = parseInt(document.getElementById("duration").value);
  const sets = parseInt(document.getElementById("sets").value);
  const reps = parseInt(document.getElementById("reps").value);
  const calories = parseInt(document.getElementById("calories").value);

  if (!type || !duration || !sets || !reps) {
    alert("Please fill all fields");
    return;
  }

  const workout = {
    id: Date.now(),
    type,
    duration,
    sets,
    reps,
    calories: calories || 0,
    date: new Date().toLocaleString()
  };

  let workouts = JSON.parse(localStorage.getItem(user.uid + "_workouts")) || [];
  workouts.unshift(workout);
  localStorage.setItem(user.uid + "_workouts", JSON.stringify(workouts));

  clearWorkoutForm();
  updateDashboard(user.uid);
  displayAllWorkouts(user.uid);
  alert("Workout logged successfully!");
}

// GET ALL WORKOUTS
export function getAllWorkouts(userId) {
  return JSON.parse(localStorage.getItem(userId + "_workouts")) || [];
}

// DELETE WORKOUT
export function deleteWorkout(id, userId) {
  let workouts = getAllWorkouts(userId);
  workouts = workouts.filter(w => w.id !== id);
  localStorage.setItem(userId + "_workouts", JSON.stringify(workouts));
  updateDashboard(userId);
  displayAllWorkouts(userId);
}

// DISPLAY ALL WORKOUTS
export function displayAllWorkouts(userId) {
  const workouts = getAllWorkouts(userId);
  const container = document.getElementById("allWorkouts");

  if (workouts.length === 0) {
    container.innerHTML = '<p class="empty-message">No workouts logged yet</p>';
    return;
  }

  container.innerHTML = workouts.map(w => `
    <div class="workout-item">
      <div class="workout-details">
        <h4>${w.type} • ${w.duration}min</h4>
        <p>${w.sets} sets × ${w.reps} reps | ${w.calories} calories</p>
        <p style="font-size: 12px; margin-top: 5px;">${w.date}</p>
      </div>
      <button class="delete-btn" onclick="window.deleteWorkoutHandler(${w.id}, '${userId}')">Delete</button>
    </div>
  `).join("");
}

// DISPLAY RECENT WORKOUTS
export function displayRecentWorkouts(workouts) {
  const recent = workouts.slice(0, 3);
  const container = document.getElementById("recentList");

  if (recent.length === 0) {
    container.innerHTML = '<p class="empty-message">No workouts yet. Start now!</p>';
    return;
  }

  container.innerHTML = recent.map(w => `
    <div class="workout-item">
      <div class="workout-details">
        <h4>${w.type} • ${w.duration}min</h4>
        <p>${w.sets} sets × ${w.reps} reps</p>
        <p style="font-size: 12px; margin-top: 5px;">${w.date}</p>
      </div>
      <div>${w.calories} cal</div>
    </div>
  `).join("");
}

// CLEAR WORKOUT FORM
export function clearWorkoutForm() {
  document.getElementById("exerciseType").value = "";
  document.getElementById("duration").value = "";
  document.getElementById("sets").value = "";
  document.getElementById("reps").value = "";
  document.getElementById("calories").value = "";
}
