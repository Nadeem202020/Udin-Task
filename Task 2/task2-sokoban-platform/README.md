# Sokoban Multi-User Platform

A full-stack web application for playing Sokoban, a classic puzzle game where players push boxes onto goal positions. This platform supports multiple users with authentication, level management, and score tracking.

## Project Structure

```
task2-sokoban-platform/
├── server/              # Express.js backend with MongoDB
│   ├── models/          # Mongoose schemas (User, Level, Score)
│   ├── routes/          # API endpoints (auth, levels, scores)
│   ├── middleware/      # Authentication and authorization
│   ├── db/              # Database connection and seeding
│   └── app.js           # Express server setup
├── client/              # Vite + React frontend
│   ├── src/
│   │   ├── pages/       # Landing, Login, Register, LevelSelect, Game, Admin
│   │   ├── components/  # Navbar, GameBoard, ProtectedRoute
│   │   ├── context/     # AuthContext for user state
│   │   ├── services/    # API client with axios
│   │   └── main.jsx     # React entry point
│   └── public/          # Static assets
└── README.md
```

## Description

### Features

- **User Authentication**: Register and login with JWT tokens
- **Level Selection**: Browse and play curated Sokoban levels
- **Game Mechanics**:
  - Push boxes onto goal positions
  - Track moves, pushes, and completion time
  - Undo moves with 'U' key
  - Restart level with 'R' key
- **Score Leaderboard**: View top scores by completion time
- **Admin Panel**: Create and manage custom levels
- **Responsive Design**: Built with Tailwind CSS

### Game Rules

- **@**: Player character
- **$**: Box to push onto a goal
- **.**: Goal position
- **#**: Wall (impassable)
- **Space**: Empty floor

**Objective**: Push all boxes ($) onto all goal positions (.) to complete the level.

## Setup & Installation

### Prerequisites

- Node.js 16+ and npm
- MongoDB (local or Atlas connection)

### Server Setup

1. Navigate to the server directory:

```bash
cd server
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file:

```env
PORT=4000
JWT_SECRET=your-secret-key-here
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=sokoban
```

4. Start the server:

```bash
npm start
```

The server will:

- Connect to MongoDB
- Seed an admin user (username: `admin`, password: `admin123`)
- Seed 5 starter levels
- Start listening on `http://localhost:4000`

### Client Setup

1. Navigate to the client directory:

```bash
cd client
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

The client will be available at `http://localhost:5173`

## Running the Game

### Starting Both Services

**Terminal 1 (Server):**

```bash
cd server
npm start
```

**Terminal 2 (Client):**

```bash
cd client
npm run dev
```

### Game Flow

1. **Visit Landing Page** (`http://localhost:5173`)
2. **Register** a new account or **Login** with:
   - Admin account: `admin@sokoban.com` / `admin123`
   - Or register a new player account
3. **Select a Level** from the level selection page
4. **Play the Level** using arrow keys to move:
   - ⬆️ Arrow Up: Move up
   - ⬇️ Arrow Down: Move down
   - ⬅️ Arrow Left: Move left
   - ➡️ Arrow Right: Move right
   - **U**: Undo last move
   - **R**: Restart level
5. **Complete the Level** by placing all boxes on goals
6. **Submit Score** and view the leaderboard

### Admin Features

- Admin users can access `/admin` to create new custom levels
- New levels are immediately available to all players

## API Endpoints

### Authentication

- `POST /api/auth/register` — Create new user account
- `POST /api/auth/login` — Login and get JWT token

### Levels

- `GET /api/levels` — Get all active levels
- `GET /api/levels/:id` — Get single level details
- `POST /api/levels` — Create new level (admin only)
- `DELETE /api/levels/:id` — Delete level (admin only)

### Scores

- `POST /api/scores` — Submit score after completing level
- `GET /api/scores/leaderboard` — Get top 20 scores
- `GET /api/scores/me` — Get user's score history (authenticated)

## Technology Stack

### Backend

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend

- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Utility-first CSS
- **Axios** - HTTP client
- **React Router v6** - Client-side routing

## Database Schema

### User

```javascript
{
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  role: String (enum: ["player", "admin"]),
  createdAt: Date,
  updatedAt: Date
}
```

### Level

```javascript
{
  name: String,
  difficulty: String (enum: ["easy", "medium", "hard"]),
  mapData: [[String]], // 2D array of tile characters
  createdBy: ObjectId (ref: User),
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Score

```javascript
{
  userId: ObjectId (ref: User),
  levelId: ObjectId (ref: Level),
  moves: Number,
  pushes: Number,
  timeSeconds: Number,
  createdAt: Date
}
```

## Development

### Building for Production

**Client:**

```bash
cd client
npm run build
```

Output will be in `client/dist/`

**Server** is already production-ready; just ensure `.env` has correct production values.

## Troubleshooting

- **MongoDB connection error**: Ensure MongoDB is running or `MONGODB_URI` is set correctly
- **Port already in use**: Change `PORT` in `.env` or kill the process using port 4000/5173
- **Maps appear blank**: Ensure backend is running and serving levels correctly
- **Login fails**: Check that the admin user was seeded on first startup

## License

MIT
