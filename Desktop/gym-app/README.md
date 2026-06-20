# FitTrack - Gym App

## 📁 Project Structure

```
gym-app/
├── config/
│   └── firebase-config.js      # Firebase initialization & exports
├── modules/
│   ├── auth.js                 # Authentication functions (signup, login, logout)
│   ├── workout.js              # Workout logging & management
│   ├── dashboard.js            # Dashboard stats & calculations
│   └── ui.js                   # UI interactions & navigation
├── index.html                  # Main HTML structure
├── app.js                      # Entry point - imports all modules
├── style.css                   # All styling
└── README.md                   # This file
```

## 📋 Module Breakdown

### `config/firebase-config.js`
- Firebase app initialization
- Exports auth instance and Firebase functions
- Contains API keys and configuration

### `modules/auth.js`
- `signup()` - User registration
- `login()` - User authentication
- `logout()` - User logout
- `deleteAccount()` - Account deletion

### `modules/workout.js`
- `logWorkout()` - Add new workout
- `getAllWorkouts(userId)` - Retrieve workouts
- `deleteWorkout(id, userId)` - Remove workout
- `displayAllWorkouts(userId)` - Render workout list
- `displayRecentWorkouts(workouts)` - Show recent workouts

### `modules/dashboard.js`
- `updateDashboard(userId)` - Refresh dashboard stats
- `calculateStreak(workouts)` - Calculate consecutive workout days

### `modules/ui.js`
- `switchTab(tab)` - Toggle auth tabs
- `showAuthScreen()` - Display login/signup
- `loadUserDashboard(user)` - Load dashboard after login
- `showSection(section)` - Navigate sections

## 🚀 Key Features

✅ Firebase Authentication  
✅ Workout Logging & Tracking  
✅ Dashboard with Stats  
✅ Streak Calculator  
✅ Local Storage Persistence  
✅ Responsive Design  
✅ Modular Code Structure  

## 🔧 Adding New Features

1. Create a new file in `modules/` folder
2. Export functions from the module
3. Import in `app.js` or relevant module
4. Expose to window if needed for HTML onclick

## 📝 Notes

- User data is stored in Firebase (auth) and localStorage (workouts)
- Each user's workouts are stored separately using their UID
- CSS is centralized in `style.css` for consistency
