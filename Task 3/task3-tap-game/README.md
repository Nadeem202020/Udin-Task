# Task 3 — Multiplayer Tap Game

A real-time multiplayer button-tapping game built with React, Node.js, Express, and Socket.io.

Players join a room, wait in the lobby, and start a synchronized 15-second sprint. The server controls the start and end times so every player sees the same countdown and plays on the same schedule, even if their network latency is different.

## Features

- Multiplayer room lobby
- Server-authoritative clock synchronization
- 15-second tap sprint
- Live tap counter and leaderboard
- Final results screen with winner highlighting
- Anti-cheat tap validation and rate limiting

## Project Structure

- `client/` - React frontend
- `server/` - Express and Socket.io backend

## How to Run the Game

### 1. Start the server

```bash
cd server
npm install
npm start
```

The server runs on `http://localhost:4000`.

### 2. Start the client

Open a new terminal:

```bash
cd client
npm install
npm run dev
```

The client usually runs on `http://localhost:5173`.

### 3. Play the game

1. Open the client URL in two browser tabs or two different browsers.
2. In the first tab, enter a name and click **Join Game**.
3. Copy the room code from the lobby.
4. In the second tab, enter a name, paste the room code, and click **Join Game**.
5. In the host tab, click **Start Game**.
6. Tap using the button or keyboard during the 15-second sprint.
7. View the final results screen when the game ends.

## Notes

- If port `5173` is busy, Vite may use another port such as `5174` or `5175`.
- The game uses server-side timing, so the countdown should stay synchronized across players.
