import { auth } from "./auth.js";

// LOG WATER INTAKE
export function logWaterIntake() {
  const user = auth.currentUser;
  if (!user) return;

  const amount = parseInt(document.getElementById("waterAmount").value);
  
  if (!amount || amount <= 0) {
    alert("Please enter a valid amount");
    return;
  }

  let waterLog = JSON.parse(localStorage.getItem(user.uid + "_water")) || [];
  const today = new Date().toDateString();
  
  const todayEntry = waterLog.find(w => w.date === today);
  if (todayEntry) {
    todayEntry.total += amount;
  } else {
    waterLog.push({ date: today, total: amount });
  }
  
  localStorage.setItem(user.uid + "_water", JSON.stringify(waterLog));
  document.getElementById("waterAmount").value = "";
  updateWaterDisplay(user.uid);
  alert(`${amount}ml logged!`);
}

// GET TODAY'S WATER
export function getTodayWater(userId) {
  const waterLog = JSON.parse(localStorage.getItem(userId + "_water")) || [];
  const today = new Date().toDateString();
  const entry = waterLog.find(w => w.date === today);
  return entry ? entry.total : 0;
}

// UPDATE WATER DISPLAY
export function updateWaterDisplay(userId) {
  const today = getTodayWater(userId);
  const goal = 2000; // 2 liters
  const percentage = Math.min((today / goal) * 100, 100);
  
  document.getElementById("waterToday").textContent = `${today}ml / ${goal}ml`;
  document.getElementById("waterProgress").style.width = percentage + "%";
  document.getElementById("waterPercent").textContent = Math.round(percentage) + "%";
}

// SET GOALS
export function setGoal() {
  const user = auth.currentUser;
  if (!user) return;

  const goalName = document.getElementById("goalName").value.trim();
  const goalTarget = document.getElementById("goalTarget").value.trim();
  const goalDeadline = document.getElementById("goalDeadline").value;

  if (!goalName || !goalTarget || !goalDeadline) {
    alert("Please fill all fields");
    return;
  }

  const goal = {
    id: Date.now(),
    name: goalName,
    target: goalTarget,
    deadline: goalDeadline,
    completed: false,
    dateSet: new Date().toLocaleDateString()
  };

  let goals = JSON.parse(localStorage.getItem(user.uid + "_goals")) || [];
  goals.push(goal);
  localStorage.setItem(user.uid + "_goals", JSON.stringify(goals));

  document.getElementById("goalName").value = "";
  document.getElementById("goalTarget").value = "";
  document.getElementById("goalDeadline").value = "";
  
  displayGoals(user.uid);
  alert("Goal added!");
}

// GET GOALS
export function getGoals(userId) {
  return JSON.parse(localStorage.getItem(userId + "_goals")) || [];
}

// DISPLAY GOALS
export function displayGoals(userId) {
  const goals = getGoals(userId);
  const container = document.getElementById("goalsList");

  if (goals.length === 0) {
    container.innerHTML = '<p class="empty-message">No goals set yet. Create one!</p>';
    return;
  }

  container.innerHTML = goals.map(g => `
    <div class="goal-item ${g.completed ? 'completed' : ''}">
      <div class="goal-details">
        <h4>${g.name}</h4>
        <p>Target: ${g.target}</p>
        <p style="font-size: 12px; color: #6b7280;">Deadline: ${g.deadline}</p>
      </div>
      <div class="goal-actions">
        ${!g.completed ? `<button class="goal-btn" onclick="window.completeGoal(${g.id}, '${userId}')">✓</button>` : '<span style="color: #10b981;">✓ Completed</span>'}
        <button class="delete-btn" onclick="window.deleteGoal(${g.id}, '${userId}')">Delete</button>
      </div>
    </div>
  `).join("");
}

// COMPLETE GOAL
export function completeGoal(id, userId) {
  let goals = getGoals(userId);
  const goal = goals.find(g => g.id === id);
  if (goal) {
    goal.completed = true;
    localStorage.setItem(userId + "_goals", JSON.stringify(goals));
    displayGoals(userId);
  }
}

// DELETE GOAL
export function deleteGoal(id, userId) {
  let goals = getGoals(userId);
  goals = goals.filter(g => g.id !== id);
  localStorage.setItem(userId + "_goals", JSON.stringify(goals));
  displayGoals(userId);
}

// LOG BODY MEASUREMENT
export function logMeasurement() {
  const user = auth.currentUser;
  if (!user) return;

  const measurementType = document.getElementById("measurementType").value;
  const value = parseFloat(document.getElementById("measurementValue").value);

  if (!measurementType || !value) {
    alert("Please fill all fields");
    return;
  }

  const measurement = {
    id: Date.now(),
    type: measurementType,
    value,
    date: new Date().toLocaleDateString()
  };

  let measurements = JSON.parse(localStorage.getItem(user.uid + "_measurements")) || [];
  measurements.unshift(measurement);
  localStorage.setItem(user.uid + "_measurements", JSON.stringify(measurements));

  document.getElementById("measurementType").value = "";
  document.getElementById("measurementValue").value = "";
  displayMeasurements(user.uid);
  alert("Measurement logged!");
}

// GET MEASUREMENTS
export function getMeasurements(userId) {
  return JSON.parse(localStorage.getItem(userId + "_measurements")) || [];
}

// DISPLAY MEASUREMENTS
export function displayMeasurements(userId) {
  const measurements = getMeasurements(userId);
  const container = document.getElementById("measurementsList");

  if (measurements.length === 0) {
    container.innerHTML = '<p class="empty-message">No measurements yet</p>';
    return;
  }

  const grouped = {};
  measurements.forEach(m => {
    if (!grouped[m.type]) grouped[m.type] = [];
    grouped[m.type].push(m);
  });

  container.innerHTML = Object.keys(grouped).map(type => `
    <div class="measurement-group">
      <h4>${type}</h4>
      ${grouped[type].slice(0, 3).map(m => `
        <div class="measurement-row">
          <span>${m.value} cm</span>
          <span style="font-size: 12px; color: #6b7280;">${m.date}</span>
        </div>
      `).join("")}
    </div>
  `).join("");
}

// DELETE MEASUREMENT
export function deleteMeasurement(id, userId) {
  let measurements = getMeasurements(userId);
  measurements = measurements.filter(m => m.id !== id);
  localStorage.setItem(userId + "_measurements", JSON.stringify(measurements));
  displayMeasurements(userId);
}
