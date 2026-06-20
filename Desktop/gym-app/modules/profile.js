/**
 * PROFILE MODULE - Handle profile pictures, achievements, and user stats
 */

// Upload and save profile picture
export function uploadProfilePicture(event) {
  const file = event.target.files[0];
  if (!file) return;

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('Image size must be less than 5MB');
    return;
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    alert('Please select an image file');
    return;
  }

  // Convert to base64
  const reader = new FileReader();
  reader.onload = (e) => {
    const base64Data = e.target.result;
    const userId = getCurrentUserId();
    if (userId) {
      localStorage.setItem(`${userId}_profilePicture`, base64Data);
      displayProfilePicture(userId);
      showNotification('Profile picture updated successfully! 📷', 'success');
    }
  };
  reader.readAsDataURL(file);
}

// Display profile picture
export function displayProfilePicture(userId) {
  const profilePicData = localStorage.getItem(`${userId}_profilePicture`);
  
  // Update large avatar in profile section
  const largeAvatar = document.getElementById('profileAvatarLarge');
  if (largeAvatar) {
    if (profilePicData) {
      largeAvatar.innerHTML = `<img src="${profilePicData}" alt="Profile">
                              <div class="upload-badge" title="Click to upload profile picture">📷</div>`;
    } else {
      const name = localStorage.getItem(`${userId}_name`) || 'U';
      const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
      largeAvatar.innerHTML = initials + '<div class="upload-badge" title="Click to upload profile picture">📷</div>';
    }
  }

  // Update navbar avatar
  const navAvatar = document.getElementById('navProfileAvatar');
  if (navAvatar) {
    if (profilePicData) {
      navAvatar.innerHTML = `<img src="${profilePicData}" alt="Profile">`;
    } else {
      const name = localStorage.getItem(`${userId}_name`) || 'U';
      const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
      navAvatar.textContent = initials;
    }
  }
}

// Get current user ID from auth
function getCurrentUserId() {
  const session = sessionStorage.getItem('userSession');
  if (session) {
    return JSON.parse(session).userId;
  }
  return null;
}

// ACHIEVEMENTS SYSTEM

const ACHIEVEMENTS = {
  'first-workout': {
    name: 'First Workout',
    icon: '🏃',
    description: 'Complete your first exercise',
    check: (stats) => stats.totalWorkouts >= 1
  },
  'week-warrior': {
    name: 'Week Warrior',
    icon: '⚡',
    description: '7-day streak',
    check: (stats) => stats.streak >= 7
  },
  'century': {
    name: 'Century Club',
    icon: '💯',
    description: 'Log 100 workouts',
    check: (stats) => stats.totalWorkouts >= 100
  },
  'hydration': {
    name: 'Hydration Master',
    icon: '💧',
    description: 'Daily hydration goal x10',
    check: (stats) => stats.hydrationDays >= 10
  },
  'goal-setter': {
    name: 'Goal Setter',
    icon: '🎯',
    description: 'Create a fitness goal',
    check: (stats) => stats.totalGoals >= 1
  },
  'calorie-burner': {
    name: 'Calorie Burner',
    icon: '🔥',
    description: '5000 calories burned',
    check: (stats) => stats.totalCalories >= 5000
  }
};

// Check and unlock achievements
export function checkAchievements(userId) {
  const stats = getUserStats(userId);
  const unlockedAchievements = localStorage.getItem(`${userId}_achievements`) ? 
    JSON.parse(localStorage.getItem(`${userId}_achievements`)) : [];

  let newAchievementUnlocked = false;

  Object.entries(ACHIEVEMENTS).forEach(([key, achievement]) => {
    const elementId = `ach-${key}`;
    const element = document.getElementById(elementId);
    
    if (achievement.check(stats)) {
      if (!unlockedAchievements.includes(key)) {
        unlockedAchievements.push(key);
        newAchievementUnlocked = true;
        showNotification(`🏆 Achievement Unlocked: ${achievement.name}!`, 'success');
      }
      
      if (element) {
        element.classList.add('unlocked');
      }
    } else {
      if (element) {
        element.classList.remove('unlocked');
      }
    }
  });

  if (newAchievementUnlocked) {
    localStorage.setItem(`${userId}_achievements`, JSON.stringify(unlockedAchievements));
  }

  return unlockedAchievements.length;
}

// Get user statistics for achievement checking
function getUserStats(userId) {
  const workouts = JSON.parse(localStorage.getItem(`${userId}_workouts`) || '[]');
  const goals = JSON.parse(localStorage.getItem(`${userId}_goals`) || '[]');
  const measurements = JSON.parse(localStorage.getItem(`${userId}_measurements`) || '[]');

  let totalCalories = 0;
  let totalMinutes = 0;
  workouts.forEach(w => {
    totalCalories += parseInt(w.calories) || 0;
    totalMinutes += parseInt(w.duration) || 0;
  });

  return {
    totalWorkouts: workouts.length,
    totalCalories: totalCalories,
    totalMinutes: totalMinutes,
    streak: calculateStreak(userId),
    totalGoals: goals.length,
    completedGoals: goals.filter(g => g.completed).length,
    hydrationDays: calculateHydrationDays(userId)
  };
}

// Calculate workout streak
function calculateStreak(userId) {
  const workouts = JSON.parse(localStorage.getItem(`${userId}_workouts`) || '[]');
  if (workouts.length === 0) return 0;

  // Sort workouts by date
  const sortedWorkouts = workouts.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (let workout of sortedWorkouts) {
    const workoutDate = new Date(workout.date);
    workoutDate.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((currentDate - workoutDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === streak) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (daysDiff > streak) {
      break;
    }
  }

  return streak;
}

// Calculate days where hydration goal was met
function calculateHydrationDays(userId) {
  const waterLog = JSON.parse(localStorage.getItem(`${userId}_waterLog`) || '{}');
  let count = 0;
  
  Object.values(waterLog).forEach(dayAmount => {
    if (dayAmount >= 2000) {
      count++;
    }
  });
  
  return count;
}

// Update user profile stats display
export function updateProfileStats(userId) {
  const stats = getUserStats(userId);

  document.getElementById('statTotal').textContent = stats.totalWorkouts;
  document.getElementById('statHours').textContent = Math.floor(stats.totalMinutes / 60) + 'h';
  document.getElementById('statCalories').textContent = stats.totalCalories.toLocaleString();
  document.getElementById('totalMinutes').textContent = stats.totalMinutes.toLocaleString();
  document.getElementById('completedGoals').textContent = stats.completedGoals;
  document.getElementById('streak').textContent = stats.streak + ' 🔥';

  // Update achievement count
  const unlockedCount = checkAchievements(userId);
  const totalAchievements = Object.keys(ACHIEVEMENTS).length;
}

// Notification system
export function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.4s ease-out forwards';
    setTimeout(() => notification.remove(), 400);
  }, 3000);
}

// Export to window
window.uploadProfilePicture = uploadProfilePicture;
window.showNotification = showNotification;
