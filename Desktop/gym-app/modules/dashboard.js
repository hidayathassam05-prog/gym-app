import { getAllWorkouts, displayRecentWorkouts } from "./workout.js";

// UPDATE DASHBOARD
export function updateDashboard(userId) {
  const workouts = getAllWorkouts(userId);
  
  const thisWeek = workouts.filter(w => {
    const workoutDate = new Date(w.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return workoutDate > weekAgo;
  });

  const totalCalories = workouts.reduce((sum, w) => sum + (w.calories || 0), 0);
  const totalHours = (workouts.reduce((sum, w) => sum + w.duration, 0) / 60).toFixed(1);

  document.getElementById("workoutCount").textContent = thisWeek.length;
  document.getElementById("totalSessions").textContent = workouts.length;
  document.getElementById("caloriesBurned").textContent = totalCalories;
  document.getElementById("streak").textContent = calculateStreak(workouts);

  document.getElementById("statTotal").textContent = workouts.length;
  document.getElementById("statHours").textContent = totalHours;
  document.getElementById("statCalories").textContent = totalCalories;

  displayRecentWorkouts(workouts);
}

// CALCULATE STREAK
export function calculateStreak(workouts) {
  if (workouts.length === 0) return 0;
  
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const workoutDates = workouts.map(w => {
    const d = new Date(w.date);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }).sort((a, b) => b - a);

  let checkDate = new Date(today);
  for (let i = 0; i < 365; i++) {
    if (workoutDates.includes(checkDate.getTime())) {
      streak++;
    } else {
      break;
    }
    checkDate.setDate(checkDate.getDate() - 1);
  }

  return streak;
}
