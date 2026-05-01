# Copilot Prompts — Udin Technical Assessment

Use these prompts inside **GitHub Copilot Chat** in VSCode.
Always have the relevant README.md open in your editor before running each prompt.

---

## ✅ TASK 1 — Sokoban Game Clone

### 📌 Prompt 1 — Project Scaffold
```
I have a README.md in this workspace that fully describes a Sokoban browser game.
Read it completely before writing any code.

Create the full project file structure exactly as described in the README:
- index.html
- style.css
- game.js
- levels.js
- an assets/ folder (leave it empty for now)

Do not write any logic yet. Only create the files with the correct names
and add a comment at the top of each file describing its purpose.
```

---

### 📌 Prompt 2 — Level Definitions
```
Using the tile format defined in the README.md TILE constants,
implement levels.js with the following:

1. A TILE constant object with all 7 tile types exactly as shown in the README
2. A LEVELS array with at least 5 levels of increasing difficulty
3. Level 1 must be a simple tutorial (1 box, 1 goal, small grid)
4. Level 5 must have at least 3 boxes and require planning
5. Every level must be solvable
6. Export both TILE and LEVELS so they are accessible in game.js

Follow the exact array format shown in the README.
```

---

### 📌 Prompt 3 — Core Game Logic
```
Using the README.md as your specification, implement game.js with the following
functions in this exact order:

1. The state object as described in the README
2. loadLevel(levelIndex) — deep copies map, finds player position, resets counters
3. render() — builds the DOM grid from state.map using CSS classes from the README
4. movePlayer(dx, dy) — full movement logic including:
   - Wall collision
   - Box pushing (one box at a time only)
   - Box-into-wall blocking
   - Box-into-box blocking
   - Tile type updates for player-on-goal and box-on-goal
5. checkWin() — detects when all boxes are on goals
6. undoMove() — saves state history and restores on undo
7. Keyboard event listener handling arrow keys, R for restart, U for undo

Do not skip any of these. Follow the exact logic described in the README.
After each function, add a JSDoc comment explaining what it does.
```

---

### 📌 Prompt 4 — HTML Structure
```
Using the README.md layout specification, implement index.html with:

1. A <div id="game-board"> for the grid
2. A stats bar showing: Level name, Moves counter, Pushes counter, Live timer
3. Control buttons: Restart, Undo, Next Level
4. A hidden win overlay <div id="win-screen"> with:
   - A congratulations message
   - Display of moves, pushes, and time taken
   - A "Next Level" button
5. A level select screen <div id="level-select"> shown on first load
6. Script tags loading levels.js then game.js in that order
7. A link to style.css

All IDs must match exactly what game.js uses in its render() and DOM queries.
```

---

### 📌 Prompt 5 — Styling
```
Using the CSS class names defined in the README.md, implement style.css with:

1. A CSS grid layout for #game-board that auto-calculates columns from the map width
2. All 7 tile type styles: wall, empty, player, box, goal, box-on-goal, player-on-goal
3. Use distinct colors or background images for each tile type
4. A smooth CSS transition (transform or opacity) when tiles change
5. A centered, card-style win overlay with backdrop blur
6. A level select grid with hover effects on each card
7. A clean stats bar at the bottom
8. Responsive design for screens 1024px and wider
9. A dark warehouse-themed color scheme (dark backgrounds, earthy box colors)

Do not use any external CSS frameworks. Pure CSS only.
```

---

### 📌 Prompt 6 — Final Integration & Bug Fix
```
The project is now complete. Please do the following:

1. Open index.html and verify all IDs referenced in game.js exist in the HTML
2. Open game.js and check that render() uses the correct CSS class names from style.css
3. Ensure loadLevel() is called on page load to show level 1 automatically
4. Verify that the timer uses setInterval and clears correctly when a level is won
5. Make sure the win screen Next Level button calls loadLevel(state.level + 1)
6. Confirm the level select screen hides when a level starts
7. Add a check: if the player completes the last level, show "You beat all levels!"
8. Test that pressing R restarts the current level without breaking anything

List any bugs you find and fix them.
```

---
---

## ✅ TASK 2 — Multi-User Platform

### 📌 Prompt 1 — Backend Scaffold & Database
```
I have a README.md in this workspace describing a full-stack Sokoban platform.
Read it completely. Then do the following:

1. Create the /server folder structure exactly as shown in the README
2. Run: npm init -y and install these packages:
   express, better-sqlite3, bcryptjs, jsonwebtoken, cors, dotenv
3. Create server/db/schema.sql with all 3 tables exactly as shown in the README:
   users, levels, scores
4. Create server/db/database.js that:
   - Connects to a SQLite file at the path in .env
   - Runs schema.sql automatically on first start
   - Seeds one admin user with username "admin", email "admin@sokoban.com",
     password "admin123" (hashed with bcryptjs)
5. Create a .env file with JWT_SECRET and DB_PATH as shown in the README

Do not implement any routes yet.
```

---

### 📌 Prompt 2 — Auth Routes & Middleware
```
Using the API specification in the README.md, implement the following in /server:

1. server/middleware/auth.js — JWT verification middleware exactly as shown in the README
2. server/middleware/roles.js — requireRole(...roles) middleware exactly as shown
3. server/routes/auth.js with two endpoints:
   - POST /api/auth/register — validates input, hashes password with bcryptjs, saves user
   - POST /api/auth/login — finds user by email, compares password, returns JWT

The JWT payload must contain: { id, username, role }
JWT expiry must be 7 days.
Return the exact JSON response shapes shown in the README for both success and error cases.
Add input validation: reject empty fields, reject duplicate usernames or emails.
```

---

### 📌 Prompt 3 — Levels & Scores Routes
```
Using the README.md API specification, implement:

1. server/routes/levels.js:
   - GET /api/levels — public, returns all active levels, parses map_data from JSON string
   - GET /api/levels/:id — public, returns single level by id
   - POST /api/levels — admin only (use authenticateToken + requireRole('admin')),
     validates that map_data has exactly 1 player, at least 1 box, at least 1 goal,
     and box count equals goal count. Saves map_data as JSON string.
   - DELETE /api/levels/:id — admin only, soft delete (sets is_active = false)

2. server/routes/scores.js:
   - POST /api/scores — requires JWT + role player or admin, saves score
   - GET /api/scores/leaderboard — public, returns top 20 scores joined with
     username and level name, ordered by time_seconds ascending
   - GET /api/scores/me — requires JWT, returns current user's score history

3. server/app.js — wire up all routes under /api prefix, enable CORS for
   http://localhost:5173, use express.json() middleware
```

---

### 📌 Prompt 4 — React Frontend Scaffold & Auth
```
Using the README.md, set up the React frontend:

1. Run: npm create vite@latest client -- --template react
2. Install: axios, react-router-dom, and configure Tailwind CSS
3. In vite.config.js add a proxy: all /api requests → http://localhost:4000
4. Create client/src/services/api.js with:
   - An axios instance with baseURL '/api'
   - A request interceptor that attaches the JWT from localStorage as Bearer token
5. Create client/src/context/AuthContext.jsx with:
   - login(token, user) — saves to localStorage and state
   - logout() — clears localStorage and state
   - On app load — reads JWT from localStorage, decodes user info, restores session
6. Create client/src/components/ProtectedRoute.jsx that:
   - Redirects to /login if no token
   - Shows a 403 message if the user's role is not in the allowed roles array
7. Create client/src/components/Navbar.jsx showing:
   - App name on the left
   - Username + role badge when logged in
   - Login and Register links when not logged in
   - Logout button when logged in
```

---

### 📌 Prompt 5 — Auth Pages & Landing Page
```
Using the README.md page specifications, implement:

1. client/src/pages/RegisterPage.jsx:
   - Fields: username, email, password, confirm password
   - Calls POST /api/auth/register
   - Shows inline field validation errors
   - On success redirects to /login

2. client/src/pages/LoginPage.jsx:
   - Fields: email, password
   - Calls POST /api/auth/login
   - On success calls AuthContext login(), redirects to /levels
   - Shows error message for wrong credentials

3. client/src/pages/LandingPage.jsx:
   - Hero section with game title
   - Leaderboard table fetched from GET /api/scores/leaderboard
   - Columns: Rank, Username, Level, Moves, Time
   - Leaderboard auto-refreshes every 30 seconds using setInterval
   - If user is logged in show "Play Now" button, otherwise show Login and Register buttons

Style all pages with Tailwind CSS. Make them visually consistent.
```

---

### 📌 Prompt 6 — Game Pages & Score Submission
```
Using the README.md, implement:

1. client/src/pages/LevelSelectPage.jsx (ProtectedRoute — player + admin):
   - Fetches GET /api/levels
   - Displays levels as a grid of cards
   - Each card shows: level name, difficulty badge (colored), creator
   - Clicking a card navigates to /game/:levelId

2. client/src/pages/GamePage.jsx (ProtectedRoute — player + admin):
   - Gets levelId from URL params
   - Fetches the level's map_data from GET /api/levels/:id
   - Renders the Sokoban game using the logic from Task 1 (port it as a React component)
   - On win shows a modal with: moves, pushes, time taken, and a "Submit Score" button
   - Submit Score calls POST /api/scores
   - After submitting shows success and a "Back to Levels" button

3. Port the Task 1 game logic into client/src/components/GameBoard.jsx:
   - Accept props: mapData (2D array), onWin(moves, pushes, timeSeconds)
   - Manage game state internally with useState and useEffect
   - Call onWin() when the puzzle is solved
```

---

### 📌 Prompt 7 — Admin Panel
```
Using the README.md admin page specification, implement
client/src/pages/AdminPage.jsx (ProtectedRoute — admin only):

1. A visual grid editor:
   - Grid size selector: width and height from 5 to 15
   - A tile palette with buttons for: Wall, Floor, Player, Box, Goal
   - A grid of clickable cells — clicking a cell sets it to the selected tile type
   - Each tile type has a distinct color in the editor
   - Dragging across cells paints them with the selected tile

2. A form below the grid with: Level Name input, Difficulty select (easy/medium/hard)

3. A "Save Level" button that:
   - Validates: exactly 1 Player tile, at least 1 Box and 1 Goal, box count equals goal count
   - Shows error messages if validation fails
   - On valid: calls POST /api/levels with the map_data as a 2D array
   - On success: clears the form and shows a success toast

4. A list of all existing levels below with:
   - Level name, difficulty, active/inactive status
   - A toggle button to activate/deactivate each level (calls DELETE /api/levels/:id)
```

---

### 📌 Prompt 8 — Final Wiring & Testing
```
The full platform is now implemented. Please do the following:

1. In client/src/App.jsx set up all routes:
   - / → LandingPage (public)
   - /register → RegisterPage (public)
   - /login → LoginPage (public)
   - /levels → LevelSelectPage (player + admin)
   - /game/:levelId → GamePage (player + admin)
   - /admin → AdminPage (admin only)
   Wrap protected routes with ProtectedRoute and the correct roles array.

2. Verify the full user flow works end to end:
   Register → Login → Select Level → Play → Submit Score → See on Leaderboard

3. Verify the admin flow:
   Login as admin → Go to /admin → Create a level → Play it as a player

4. Fix any import errors, missing exports, or broken API calls.
5. Make sure the server and client run together with: 
   - server on port 4000
   - client on port 5173
```

---
---

## ✅ TASK 3 — Multiplayer Tap Game

### 📌 Prompt 1 — Server Scaffold & Socket Setup
```
I have a README.md in this workspace describing a real-time multiplayer tap game.
Read it completely before writing any code.

Then do the following:

1. Create the /server folder, run npm init -y and install: express, socket.io, cors
2. Create server/app.js that:
   - Sets up an Express server
   - Attaches Socket.io with CORS allowed for http://localhost:5173
   - Listens on port 4000
3. Create server/gameManager.js with:
   - A rooms object to store all active game rooms (keyed by roomId)
   - A getRoom(roomId) helper
   - A getPlayerRoom(socketId) helper that finds which room a socket is in
   - A generateRoomId() function that creates a random 6-character alphanumeric code
4. Do not implement any socket event handlers yet.
```

---

### 📌 Prompt 2 — Room Join Logic & Clock Sync
```
Using the README.md event specifications, implement in server/gameManager.js
and wire the handlers into server/app.js:

1. time_sync_request handler:
   - Receives { sentAt } from client
   - Immediately emits time_sync_response with { serverTime: Date.now(), sentAt }
   - This must be the fastest possible response — no async, no DB calls

2. join_room handler:
   - Receives { name, roomId } — roomId may be undefined (create new room)
   - If roomId is undefined: generate a new room code, create room with phase 'waiting'
   - If roomId is provided and room exists: add player to that room
   - If roomId is provided and room does not exist: create it with that code
   - Add the socket to the Socket.io room using socket.join(roomId)
   - Emit room_joined to the joining socket with { roomId, players, phase }
   - Emit player_joined to everyone else in the room with { playerId, name, players }

3. disconnect handler:
   - Find and remove the player from their room
   - Emit player_left to remaining players in the room
   - If room is now empty, delete it from rooms object
```

---

### 📌 Prompt 3 — Game Start & Tap Logic
```
Using the README.md timing specification, implement in server/gameManager.js:

1. start_game handler:
   - Only proceed if the room phase is 'waiting'
   - Set phase to 'countdown'
   - Calculate timestamps:
       countdownAt = Date.now() + 1000
       startAt     = Date.now() + 4000
       endAt       = startAt + 15000
   - Store startAt and endAt on the room object
   - Emit game_starting to ALL players in the room with { countdownAt, startAt, endAt }
   - Use setTimeout to call endGame(roomId) at the exact right moment

2. tap handler:
   - Receives { clientTime } from a player
   - Reject if room phase is not 'playing' — do nothing
   - Reject if Date.now() is before room.startAt or after room.endAt — do nothing
   - Increment room.players[socketId].taps by 1
   - Emit tap_accepted back to the sender with { taps }
   - Emit tap_update to ALL players in the room with { playerId, taps }

3. endGame(roomId) function:
   - Set room phase to 'finished'
   - Sort players by taps descending
   - Emit game_over to all players in the room with { results: [{id, name, taps}] }

4. At startAt time: update room phase to 'playing' using a setTimeout
```

---

### 📌 Prompt 4 — React Frontend Scaffold & Clock Sync
```
Using the README.md, set up the React frontend:

1. Run: npm create vite@latest client -- --template react
   Install: socket.io-client, tailwindcss, react-router-dom

2. Create client/src/utils/timeSync.js exactly as shown in the README:
   - A module-level clockOffset variable
   - syncClock(socket) — sends time_sync_request, measures RTT,
     calculates offset = serverTime - (sentAt + RTT/2), stores in clockOffset
   - getServerTime() — returns Date.now() + clockOffset
   - Export both functions

3. Create client/src/hooks/useSocket.js exactly as shown in the README:
   - Creates a socket.io connection to http://localhost:4000
   - Runs syncClock() on connect
   - Exposes { socket, connected, clockSynced }

4. Create client/src/App.jsx with React Router:
   - / → LobbyPage
   - /game → GamePage
   - /results → ResultsPage
   Pass socket, connected, clockSynced as props or via Context.
```

---

### 📌 Prompt 5 — Lobby Page
```
Using the README.md LobbyPage specification, implement
client/src/pages/LobbyPage.jsx:

1. Before joining:
   - A text input for the player's name (required)
   - A text input for room code (optional — placeholder: "Leave blank to create new room")
   - A "Join Game" button that emits join_room with { name, roomId }
   - Disable the button until name is filled in

2. After joining (when room_joined event is received):
   - Show the room code prominently with a "Copy" button
   - Show a live player list that updates on player_joined and player_left events
   - Each player shown as: name + "Ready" badge
   - Show "Waiting for host to start..." text
   - Show "Start Game" button only for the first player who joined (the host)
   - Start Game button emits start_game to the server
   - When game_starting is received, navigate to /game and pass startAt, endAt,
     countdownAt, and the players list via React Router state
```

---

### 📌 Prompt 6 — Game Page
```
Using the README.md GamePage specification, implement
client/src/pages/GamePage.jsx:

The page has 3 phases driven by getServerTime() from timeSync.js:

PHASE 1 — COUNTDOWN (before startAt):
- Show a large centered countdown number that counts: 3, 2, 1, GO!
- Calculate the number as: Math.ceil((startAt - getServerTime()) / 1000)
- Update every 100ms using setInterval
- The tap button is visible but disabled and greyed out
- When getServerTime() >= startAt, switch to PLAYING phase

PHASE 2 — PLAYING (between startAt and endAt):
- Show the tap button: large (min 200x200px), centered, bold color
- On click AND on spacebar keydown: emit tap event to server
- Do NOT count taps locally — only update count when tap_accepted is received
- Show "Your taps: X" prominently above the button
- Show a countdown timer: remaining seconds = Math.max(0, (endAt - getServerTime()) / 1000)
  formatted to 1 decimal place (e.g. "12.4s"), updated every 100ms
- Timer turns yellow under 5 seconds, red under 3 seconds
- Show a live mini-leaderboard of all players' taps (updates on tap_update events)
- When getServerTime() >= endAt, disable the button and switch to FINISHED phase

PHASE 3 — FINISHED:
- Show "Time's up!" message
- Wait for game_over event then navigate to /results with the results data

Use getServerTime() (not Date.now()) for all phase transitions.
```

---

### 📌 Prompt 7 — Results Page & Final Polish
```
Using the README.md ResultsPage specification, implement
client/src/pages/ResultsPage.jsx:

1. Read results from React Router location state
2. Show a leaderboard table: Rank | Player | Taps
3. Highlight rank 1 with a gold trophy icon 🏆
4. Highlight the current player's row with a different background
5. Show "Play Again" button — emits start_game (if host) or shows "Waiting for host"
6. Show "Leave Room" button — disconnects socket and goes back to /

Then do the following polish across all pages:

1. Add a pulsing scale animation on the tap button when clicked (CSS keyframe)
2. Add a green/red connection status dot in the corner of GamePage
3. Make the tap button also respond to any keyboard key press (not just spacebar)
4. Handle the case where a player navigates to /game directly without going
   through the lobby — redirect them to / if no game state is present
5. Handle socket disconnect during the game — show a "Reconnecting..." overlay
```

---

### 📌 Prompt 8 — Fairness Verification & Edge Cases
```
The multiplayer tap game is now implemented. Please verify the following:

1. Open the timeSync.js file and confirm the offset formula is exactly:
   offset = serverTime - (sentAt + rtt / 2)
   If it is different, correct it.

2. In GamePage.jsx, confirm that ALL phase transitions use getServerTime()
   and NOT Date.now(). If any use Date.now(), replace them.

3. In the server tap handler, confirm taps are rejected if:
   - phase !== 'playing'
   - Date.now() < room.startAt
   - Date.now() > room.endAt
   If any check is missing, add it.

4. Handle this edge case: if only 1 player is in the room and they click
   Start Game, the game should still work and they win automatically.

5. Handle this edge case: if two players have the same tap count in results,
   display them both as tied (same rank number, both highlighted).

6. Add a rate limit on the server: reject more than 30 taps per second
   from a single socket (to prevent auto-clickers/cheating).
```
