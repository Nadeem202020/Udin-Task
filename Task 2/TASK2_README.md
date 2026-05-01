# Task 2 — Sokoban Multi-User Platform

## Overview
Extend the Task 1 Sokoban game into a full **multi-user web platform** with authentication,
role-based access control, score tracking, and a leaderboard. This is a full-stack application.

---

## Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React (Vite) + Tailwind CSS |
| Backend | Node.js + Express |
| Database | MongoDB (via `mongoose`) |
| Auth | JWT (JSON Web Tokens) + bcrypt for password hashing |
| Real-time (optional) | Socket.io (for live leaderboard updates) |
| Session storage | `localStorage` for JWT on client |

> **Tip for Copilot:** Make sure MongoDB is running locally on port 27017, or use a free cloud instance via [MongoDB Atlas](https://www.mongodb.com/atlas). Set the connection string in `.env` as `MONGODB_URI`.

---

## Project Structure
```
task2-sokoban-platform/
├── client/                     # React frontend (Vite)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx      # Leaderboard + login/register links
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── GamePage.jsx         # The actual Sokoban game
│   │   │   ├── AdminPage.jsx        # Admin puzzle creator
│   │   │   └── LevelSelectPage.jsx
│   │   ├── components/
│   │   │   ├── GameBoard.jsx        # Sokoban grid component
│   │   │   ├── Leaderboard.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── ProtectedRoute.jsx   # Role-based route guard
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Global auth state
│   │   ├── services/
│   │   │   └── api.js               # Axios API calls
│   │   └── App.jsx
│   └── package.json
│
├── server/                     # Express backend
│   ├── routes/
│   │   ├── auth.js              # POST /register, POST /login
│   │   ├── scores.js            # POST /scores, GET /leaderboard
│   │   ├── levels.js            # GET /levels, POST /levels (admin only)
│   │   └── users.js             # GET /users (admin only)
│   ├── middleware/
│   │   ├── auth.js              # JWT verification middleware
│   │   └── roles.js             # Role-checking middleware
│   ├── models/
│   │   ├── User.js              # Mongoose User schema
│   │   ├── Level.js             # Mongoose Level schema
│   │   └── Score.js             # Mongoose Score schema
│   ├── db/
│   │   └── connect.js           # MongoDB connection via mongoose
│   ├── app.js                   # Express app setup
│   └── package.json
│
└── README.md
```

---

## Database Models (Mongoose)

### `models/User.js`
```javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username:  { type: String, required: true, unique: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true },
  password:  { type: String, required: true },        // bcrypt hash
  role:      { type: String, enum: ['anonymous', 'player', 'admin'], default: 'player' },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
```

### `models/Level.js`
```javascript
const mongoose = require('mongoose');

const levelSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  mapData:    { type: [[Number]], required: true },   // 2D array stored directly
  createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive:   { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Level', levelSchema);
```

### `models/Score.js`
```javascript
const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  levelId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Level', required: true },
  moves:       { type: Number, required: true },
  pushes:      { type: Number, required: true },
  timeSeconds: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Score', scoreSchema);
```

### `db/connect.js`
```javascript
const mongoose = require('mongoose');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    // Seed admin user on first run
    const User = require('../models/User');
    const bcrypt = require('bcryptjs');
    const exists = await User.findOne({ username: 'admin' });
    if (!exists) {
      await User.create({
        username: 'admin',
        email: 'admin@sokoban.com',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin',
      });
      console.log('Admin user seeded');
    }
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}

module.exports = connectDB;
```

---

## User Roles & Permissions

| Action | Anonymous | Player | Admin |
|---|---|---|---|
| View landing page & leaderboard | ✅ | ✅ | ✅ |
| Register / Login | ✅ | ✅ | ✅ |
| Play levels | ❌ | ✅ | ✅ |
| Submit scores | ❌ | ✅ | ✅ |
| View personal score history | ❌ | ✅ | ✅ |
| Create new levels | ❌ | ❌ | ✅ |
| Deactivate/delete levels | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ |

---

## Backend API — Full Endpoint Specification

### Auth Routes (`/api/auth`)

#### `POST /api/auth/register`
```json
// Request body
{ "username": "john", "email": "john@example.com", "password": "secret123" }

// Success 201
{ "message": "User registered successfully" }

// Error 400
{ "error": "Username already taken" }
```

#### `POST /api/auth/login`
```json
// Request body
{ "email": "john@example.com", "password": "secret123" }

// Success 200
{
  "token": "<jwt_token>",
  "user": { "id": "64b1f2c3e4d5a6b7c8d9e0f1", "username": "john", "role": "player" }
}

// Error 401
{ "error": "Invalid credentials" }
```

### Level Routes (`/api/levels`)

#### `GET /api/levels`
- Public endpoint — returns all active levels
```json
[
  {
    "_id": "64b1f2c3e4d5a6b7c8d9e0f1",
    "name": "Tutorial",
    "difficulty": "easy",
    "mapData": [[1,1,1],[1,2,1],[1,1,1]],
    "createdBy": "admin"
  }
]
```

#### `POST /api/levels` *(Admin only — requires JWT + role check)*
```json
// Request body
{
  "name": "My New Level",
  "difficulty": "hard",
  "mapData": [[1,1,1,1],[1,2,3,1],[1,0,4,1],[1,1,1,1]]
}

// Success 201
{ "message": "Level created", "_id": "64b1f2c3e4d5a6b7c8d9e0f2" }
```

#### `DELETE /api/levels/:id` *(Admin only)*
- Sets `isActive = false` in MongoDB (soft delete)

### Score Routes (`/api/scores`)

#### `POST /api/scores` *(Player or Admin — requires JWT)*
```json
// Request body
{ "levelId": "64b1f2c3e4d5a6b7c8d9e0f1", "moves": 22, "pushes": 5, "timeSeconds": 47 }

// Success 201
{ "message": "Score saved" }
```

#### `GET /api/scores/leaderboard`
- Public endpoint
- Returns top 10 scores per level OR global top 20 players by best total score
```json
[
  { "username": "alice", "level_name": "Tutorial", "moves": 10, "time_seconds": 23 },
  { "username": "bob",   "level_name": "Tutorial", "moves": 14, "time_seconds": 31 }
]
```

#### `GET /api/scores/me` *(Requires JWT)*
- Returns the logged-in user's score history

---

## Backend Middleware

### `middleware/auth.js` — JWT Verification
```javascript
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>
  if (!token) return res.status(401).json({ error: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user; // { id, username, role }
    next();
  });
}

module.exports = { authenticateToken };
```

### `middleware/roles.js` — Role Guard
```javascript
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
}

module.exports = { requireRole };
```

### Usage in routes:
```javascript
// Only admin can create levels
router.post('/levels', authenticateToken, requireRole('admin'), createLevel);
// Only logged-in users can submit scores
router.post('/scores', authenticateToken, requireRole('player', 'admin'), submitScore);
```

---

## Frontend Pages — Full Specification

### 1. `LandingPage.jsx` (Public)
- Hero section with the game title and logo
- **Leaderboard table** (fetched from `GET /api/scores/leaderboard`)
  - Columns: Rank, Username, Level, Moves, Time
  - Auto-refreshes every 30 seconds
- CTA buttons: "Login to Play" and "Register"
- If user is already logged in → show "Play Now" button instead

### 2. `RegisterPage.jsx` (Public)
- Form fields: Username, Email, Password, Confirm Password
- Calls `POST /api/auth/register`
- On success → redirect to `/login`
- Show inline validation errors

### 3. `LoginPage.jsx` (Public)
- Form fields: Email, Password
- Calls `POST /api/auth/login`
- On success → save JWT to `localStorage`, update `AuthContext`, redirect to `/levels`
- Show error message on wrong credentials

### 4. `LevelSelectPage.jsx` (Player/Admin only)
- Grid of level cards
- Each card shows: Level name, difficulty badge, creator name
- Clicking a card → navigate to `/game/:levelId`

### 5. `GamePage.jsx` (Player/Admin only)
- Embeds the Sokoban `GameBoard` component from Task 1 (reuse the logic)
- Receives `levelId` from URL params
- Fetches level `mapData` from `GET /api/levels/:id`
- On win → show win modal with moves/pushes/time
- Win modal has "Submit Score" button → calls `POST /api/scores`
- After submitting → show success and "Back to Levels" button

### 6. `AdminPage.jsx` (Admin only)
- **Level Creator** with a visual grid editor:
  - User selects tile type from a palette (Wall, Floor, Player, Box, Goal)
  - Clicks/drags on the grid to paint tiles
  - Grid size selector: 5x5 up to 15x15
  - "Save Level" button → calls `POST /api/levels` with `mapData` as a 2D array
- **Level list** with toggle active/inactive per level
- Validation before saving:
  - Must have exactly 1 Player tile
  - Must have at least 1 Box and 1 Goal tile
  - Number of Boxes must equal number of Goals

### 7. `AuthContext.jsx`
```javascript
// Provides: { user, token, login, logout }
// login(token, user) → saves to localStorage + state
// logout() → clears localStorage + state
// On app load → read JWT from localStorage and decode user info
```

### 8. `ProtectedRoute.jsx`
```javascript
// Usage: <ProtectedRoute roles={['player', 'admin']}><GamePage /></ProtectedRoute>
// If not logged in → redirect to /login
// If wrong role → show 403 Forbidden page
```

---

## Implementation Steps for Copilot

### Phase 1 — Backend Setup
1. `npm init` in `/server`, install: `express`, `mongoose`, `bcryptjs`, `jsonwebtoken`, `cors`, `dotenv`
2. Create `db/connect.js` — connects to MongoDB and seeds the admin user on first run
3. Create `models/User.js`, `models/Level.js`, `models/Score.js` using the Mongoose schemas above
4. Create `.env` with `JWT_SECRET`, `MONGODB_URI`, and `PORT` as shown below
5. Implement `routes/auth.js` — register and login
6. Implement `middleware/auth.js` and `middleware/roles.js`
7. Implement `routes/levels.js` — CRUD with role protection
8. Implement `routes/scores.js` — submit score and leaderboard
9. Test all endpoints with Postman or curl before touching the frontend

### Phase 2 — Frontend Setup
1. `npm create vite@latest client -- --template react`, install: `axios`, `react-router-dom`, `tailwindcss`
2. Set up `App.jsx` with React Router routes
3. Implement `AuthContext.jsx`
4. Build `Navbar.jsx` — shows username + role when logged in, Login/Register when not
5. Build `LandingPage.jsx` with leaderboard fetch
6. Build `RegisterPage.jsx` and `LoginPage.jsx`
7. Build `ProtectedRoute.jsx`
8. Port the Task 1 game logic into `GameBoard.jsx` as a React component
9. Build `LevelSelectPage.jsx`
10. Build `GamePage.jsx` with score submission
11. Build `AdminPage.jsx` with the visual grid editor

### Phase 3 — Integration & Testing
1. Proxy API calls from Vite dev server to Express (`vite.config.js` proxy)
2. Test full flow: Register → Login → Select Level → Play → Submit Score → See on Leaderboard
3. Test admin flow: Login as admin → Create level → Play it as a player

---

## Environment Variables

```
# server/.env
PORT=4000
JWT_SECRET=supersecretkey123
MONGODB_URI=mongodb://localhost:27017/sokoban
```
> For cloud hosting use a MongoDB Atlas connection string:
> `MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/sokoban`

---

## Deliverables Checklist
- [ ] User can register with username, email, password
- [ ] User can log in and receive a JWT
- [ ] JWT is stored and sent on all authenticated requests
- [ ] Anonymous user sees leaderboard but cannot play
- [ ] Player can select and play levels
- [ ] Score is saved on level completion
- [ ] Leaderboard shows top scores on landing page
- [ ] Admin can create new levels with the visual editor
- [ ] Admin level creation validates box/goal counts
- [ ] Role-based route protection works on both frontend and backend
- [ ] No `console.error` on any normal user flow
