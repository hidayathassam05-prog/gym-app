# 💪 FitTrack - Comprehensive Gym & Fitness Tracking Application

A modern, feature-rich fitness tracking application built with vanilla JavaScript and Firebase. Track your workouts, monitor your progress, manage nutrition plans, and achieve your fitness goals with an intuitive user interface.

## 🌟 Overview

FitTrack is a complete fitness management system designed for gym enthusiasts and fitness professionals. Whether you're a personal trainer, fitness coach, or individual fitness enthusiast, FitTrack provides all the tools you need to track workouts, manage client profiles, and monitor fitness progress.

---

## 📁 Project Structure

```
gym-app/
├── config/
│   └── firebase-config.js      # Firebase initialization & exports
├── modules/
│   ├── auth.js                 # Authentication functions (signup, login, logout)
│   ├── workout.js              # Workout logging & management
│   ├── dashboard.js            # Dashboard stats & calculations
│   ├── nutrition.js            # Nutrition planning & tracking
│   ├── profile.js              # User profile management
│   ├── admin.js                # Admin panel functions
│   ├── roles.js                # Role-based access control
│   ├── security.js             # Security & authorization
│   └── ui.js                   # UI interactions & navigation
├── shared/
│   └── navbar.html             # Shared navigation component
├── index.html                  # Main landing page
├── dashboard.html              # User dashboard
├── workouts.html               # Workout tracking page
├── classes.html                # Classes & programs
├── nutrition.html              # Nutrition planning
├── goals.html                  # Fitness goals
├── health.html                 # Health metrics
├── analytics.html              # Analytics & reports
├── profile.html                # User profile
├── users.html                  # User management
├── app.js                      # Entry point - imports all modules
├── style.css                   # All styling
└── README.md                   # This file
```

## � Module Breakdown

### `config/firebase-config.js`
- Firebase app initialization and configuration
- Exports auth instance and Firebase functions
- Contains API keys and database references
- Centralized configuration management

### `modules/auth.js`
- `signup()` - User registration with email/password
- `login()` - User authentication and session management
- `logout()` - User logout and session termination
- `deleteAccount()` - Account deletion and data cleanup

### `modules/workout.js`
- `logWorkout()` - Add new workout entry with details
- `getAllWorkouts(userId)` - Retrieve all user workouts
- `deleteWorkout(id, userId)` - Remove specific workout
- `displayAllWorkouts(userId)` - Render workout list in UI
- `displayRecentWorkouts(workouts)` - Show recent workouts on dashboard

### `modules/dashboard.js`
- `updateDashboard(userId)` - Refresh dashboard statistics
- `calculateStreak(workouts)` - Calculate workout streak
- Real-time stats calculation and display

### `modules/nutrition.js`
- Nutrition plan management
- Meal tracking and logging
- Calorie and macro tracking
- Dietary preference settings

### `modules/profile.js`
- User profile management
- Personal information updates
- Fitness goals management
- Profile picture/avatar handling

### `modules/admin.js`
- Admin dashboard functions
- User management capabilities
- Analytics and reporting
- System administration tools

### `modules/roles.js`
- Role-based access control (RBAC)
- User, Trainer, Admin role management
- Permission verification
- Access level enforcement

### `modules/security.js`
- Security checks and validations
- Authorization verification
- Data encryption utilities
- Security best practices implementation

### `modules/ui.js`
- `switchTab(tab)` - Toggle authentication tabs
- `showAuthScreen()` - Display login/signup interface
- `loadUserDashboard(user)` - Load personalized dashboard
- `showSection(section)` - Navigate between app sections
- Modal and notification management

## 🚀 Key Features

✅ **Firebase Authentication** - Secure user registration and login  
✅ **Workout Logging & Tracking** - Comprehensive workout management  
✅ **Dashboard with Real-Time Stats** - Visual fitness progress  
✅ **Streak Calculator** - Track consecutive workout days  
✅ **Nutrition Planning** - Meal and calorie tracking  
✅ **Goal Management** - Set and track fitness objectives  
✅ **Admin Panel** - Manage users and system settings  
✅ **Role-Based Access Control** - User, Trainer, Admin roles  
✅ **Analytics & Reporting** - Detailed fitness analytics  
✅ **Health Metrics Tracking** - Monitor vital statistics  
✅ **Local Storage Persistence** - Offline data caching  
✅ **Responsive Design** - Works on desktop, tablet, mobile  
✅ **Modular Code Structure** - Easy to maintain and extend  
✅ **Security Best Practices** - Data protection and authorization  

---

## 🛠️ Technology Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Firebase (Authentication, Firestore, Realtime Database)
- **Storage:** localStorage, Firebase Cloud Storage
- **Architecture:** Modular JavaScript with separation of concerns
- **Security:** Firebase security rules, role-based access control

---

## 📋 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Firebase account
- Internet connection

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/hidayathassam05-prog/gym-app.git
   cd gym-app
   ```

2. **Configure Firebase:**
   - Update `config/firebase-config.js` with your Firebase credentials
   - Enable Authentication (Email/Password) in Firebase Console
   - Set up Firestore Database
   - Configure security rules

3. **Run the application:**
   - Open `index.html` in your web browser
   - Or use a local server: `python -m http.server 8000`
   - Navigate to `http://localhost:8000`

---

## 💻 Usage

### For Users
1. **Sign Up** - Create new account with email and password
2. **Log In** - Access your personalized dashboard
3. **Log Workouts** - Record your daily exercises
4. **Track Progress** - View stats and analytics
5. **Set Goals** - Define fitness objectives
6. **Manage Nutrition** - Plan meals and track nutrition

### For Trainers
- Manage client profiles
- Track client workouts
- Create training programs
- Monitor client progress
- Generate reports

### For Admins
- User management
- System administration
- Analytics and reporting
- Role management
- Data management  

## � Data Structure

### User Document
```javascript
{
  uid: "user_id",
  email: "user@example.com",
  displayName: "John Doe",
  role: "user",
  createdAt: timestamp,
  profilePicture: "url",
  fitnessGoals: ["goal1", "goal2"],
  stats: {
    totalWorkouts: 0,
    currentStreak: 0,
    totalMinutes: 0
  }
}
```

### Workout Entry
```javascript
{
  id: "workout_id",
  userId: "user_id",
  date: "2026-06-20",
  exerciseName: "Bench Press",
  duration: 45,
  sets: 3,
  reps: 10,
  weight: 100,
  calories: 250,
  notes: "Good session",
  timestamp: timestamp
}
```

### Nutrition Entry
```javascript
{
  id: "nutrition_id",
  userId: "user_id",
  date: "2026-06-20",
  meal: "Breakfast",
  foodItems: ["item1", "item2"],
  calories: 500,
  proteins: 25,
  carbs: 60,
  fats: 15,
  timestamp: timestamp
}
```

---

## 🔧 Adding New Features

1. **Create a new module** in `modules/` folder
   ```javascript
   // modules/new-feature.js
   export function newFeature() {
     // Your code here
   }
   ```

2. **Export functions** from the module

3. **Import in `app.js`** or relevant module
   ```javascript
   import { newFeature } from './modules/new-feature.js';
   ```

4. **Create corresponding HTML** if needed

5. **Style in `style.css`**

---

## 📊 Firebase Configuration

### Authentication Setup
- Enable Email/Password authentication
- Configure sign-up restrictions if needed
- Set password policies

### Firestore Security Rules
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    match /workouts/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == resource.data.userId;
    }
  }
}
```

---

## 🔒 Security Features

- Firebase Authentication (secure login)
- Role-based access control
- User data isolation
- Input validation
- Authorization checks
- Security rules on Firebase

---

## 📈 Future Enhancements

- [ ] Social features (friend connections, challenges)
- [ ] Mobile app (React Native/Flutter)
- [ ] Advanced analytics dashboard
- [ ] AI-powered workout recommendations
- [ ] Video workout library
- [ ] Wearable device integration
- [ ] Payment integration for premium features
- [ ] Push notifications
- [ ] Social media sharing

---

## 🐛 Known Issues & Limitations

- localStorage has a size limit (~5-10MB)
- Offline functionality is limited
- Real-time sync requires internet connection
- Browser compatibility: requires ES6 support

---

## 🚀 Deployment

### Deploy to Firebase Hosting
```bash
npm install -g firebase-tools
firebase init
firebase deploy
```

### Deploy to Other Platforms
- Netlify: Drag and drop the folder
- Vercel: Connect GitHub repository
- GitHub Pages: Push to gh-pages branch
- Heroku: Use static site buildpack

---

## 📞 Support & Contact

For issues, suggestions, or contributions:
- Open an issue on GitHub
- Contact: hidayathassam05-prog@gmail.com
- GitHub: [@hidayathassam05-prog](https://github.com/hidayathassam05-prog)

---

## 📝 License

This project is open source and available under the MIT License.

---

## 👨‍💻 Author

**Hassam Hidayat**  
GitHub: [@hidayathassam05-prog](https://github.com/hidayathassam05-prog)  
Repository: [gym-app](https://github.com/hidayathassam05-prog/gym-app)
