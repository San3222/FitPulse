# 🏃 FitTrack — Full Stack Fitness App

A pixel-perfect mobile fitness tracking app built with React, Node.js, Express, and MongoDB — matching the provided design screenshots.

---

## 📱 App Screens

| Screen | Description |
|--------|-------------|
| **Splash** | Onboarding with Get Started / Login |
| **Register / Login** | JWT-based auth with MongoDB |
| **Home** | Greeting, upcoming workouts, weekly progress chart |
| **Workouts** | Add, schedule, start, and delete workouts |
| **Workout Timer** | Live timer, lap tracking, real-time calories/steps/BPM |
| **Progress** | Weekly bar charts, stat cards (calories, steps, workouts) |
| **Leaderboard** | Podium, ranked rows, invite friends modal |
| **Profile** | User stats, settings menu, sign out |

---

## 🛠 Tech Stack

- **Frontend**: React 18, React Router v6, Axios, CSS custom properties
- **Backend**: Node.js, Express.js, JWT authentication
- **Database**: MongoDB with Mongoose ODM
- **Fonts**: Nunito + Poppins (Google Fonts)
- **Design**: Mobile-first, 390px frame, green (#22C55E) accent theme

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js 18+
- MongoDB running locally (`mongod`) or MongoDB Atlas URI

### 1. Clone / Extract the project
```bash
cd fittrack
```

### 2. Install all dependencies
```bash
# Install server dependencies
cd server && npm install && cd ..

# Install client dependencies
cd client && npm install && cd ..
```

### 3. Configure environment
Edit `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fittrack
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

For MongoDB Atlas:
```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/fittrack
```

### 4. Start the servers

**Terminal 1 — Backend:**
```bash
cd server
npm run dev       # uses nodemon for hot reload
# OR
npm start         # production
```

**Terminal 2 — Frontend:**
```bash
cd client
npm start
```

### 5. Open the app
Visit: **http://localhost:3000**

---

## 📂 Project Structure

```
fittrack/
├── server/
│   ├── index.js              # Express app entry
│   ├── .env                  # Environment variables
│   ├── models/
│   │   ├── User.js           # User schema (bcrypt, JWT, inviteCode)
│   │   ├── Workout.js        # Workout schema (laps, points, stats)
│   │   └── Progress.js       # Daily progress aggregation
│   ├── routes/
│   │   ├── auth.js           # POST /register, /login, GET /me
│   │   ├── workouts.js       # CRUD + complete endpoint
│   │   ├── progress.js       # Weekly + all-time stats
│   │   └── leaderboard.js    # Weekly + all-time rankings
│   └── middleware/
│       └── auth.js           # JWT verification middleware
│
└── client/
    └── src/
        ├── App.jsx            # Router + protected routes
        ├── index.css          # Full design system
        ├── context/
        │   └── AuthContext.jsx # Global auth state
        └── pages/
            ├── SplashScreen.jsx
            ├── LoginPage.jsx
            ├── RegisterPage.jsx
            ├── MainApp.jsx        # Bottom nav layout
            ├── HomeScreen.jsx
            ├── WorkoutsScreen.jsx
            ├── WorkoutTimer.jsx
            ├── ProgressScreen.jsx
            ├── LeaderboardScreen.jsx
            └── ProfileScreen.jsx
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |

### Workouts (🔒 Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/workouts` | All user workouts |
| GET | `/api/workouts/upcoming` | Upcoming scheduled |
| POST | `/api/workouts` | Create workout |
| PUT | `/api/workouts/:id/complete` | Complete with stats |
| DELETE | `/api/workouts/:id` | Delete workout |

### Progress (🔒 Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/progress/weekly` | 7-day breakdown |
| GET | `/api/progress/stats` | All-time totals |

### Leaderboard (🔒 Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leaderboard/weekly` | This week's rankings |
| GET | `/api/leaderboard/all-time` | All-time rankings |

---

## 🎨 Design System

```css
--primary: #22C55E      /* Green accent */
--dark: #111827          /* Dark text */
--bg: #F8FAFC            /* Light background */
--card: #FFFFFF          /* Card white */
--radius: 16px           /* Border radius */
```

Fonts: **Poppins** (headings) + **Nunito** (body)

---

## 🧩 Features

- ✅ JWT auth with 30-day tokens
- ✅ Password hashing with bcrypt
- ✅ Auto-generated unique invite codes
- ✅ Live workout timer with lap tracking
- ✅ Real-time calorie/step/BPM simulation
- ✅ Points system (earned on workout completion)
- ✅ Weekly progress charts
- ✅ Leaderboard with podium (top 3)
- ✅ Invite friends modal with share options
- ✅ Mobile-first responsive design
- ✅ Toast notifications
- ✅ Loading and empty states
