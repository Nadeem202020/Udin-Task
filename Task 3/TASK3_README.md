# Task 3 — Multiplayer Button-Tapping Game

## Overview
Build a **real-time multiplayer game** where players compete to tap a key as many times as
possible within a **15-second sprint**. The game must be fair to players in different geographic
locations by using a **server-authoritative clock** — the server decides when the sprint starts
and ends, not the client.

---

## Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React (Vite) |
| Backend | Node.js + Express |
| Real-time comms | Socket.io (WebSockets) |
| Time sync | Server-side NTP-style clock authority |
| Styling | Tailwind CSS |

---

## Project Structure
```
task3-tap-game/
├── client/
│   ├── src/
│   │   ├── App.jsx              # Root component with socket connection
│   │   ├── pages/
│   │   │   ├── LobbyPage.jsx    # Players join here and wait
│   │   │   ├── GamePage.jsx     # Active 15-second sprint
│   │   │   └── ResultsPage.jsx  # Post-game scoreboard
│   │   ├── components/
│   │   │   ├── PlayerList.jsx   # Live list of players in lobby
│   │   │   ├── TapButton.jsx    # The big tap button
│   │   │   ├── Countdown.jsx    # Pre-game 3-2-1 countdown
│   │   │   ├── TapCounter.jsx   # Shows your current tap count live
│   │   │   └── Scoreboard.jsx   # Final results table
│   │   ├── hooks/
│   │   │   └── useSocket.js     # Socket.io client hook
│   │   └── utils/
│   │       └── timeSync.js      # Client clock offset calculation
│   └── package.json
│
├── server/
│   ├── app.js                   # Express + Socket.io server
│   ├── gameManager.js           # Game state, rooms, timing logic
│   └── package.json
│
└── README.md
```

---

## The Core Fairness Problem & Solution

### The Problem
If the server sends "game starts now!" at time T, different clients receive this message
at different times due to network latency. A player in the same city as the server gets
the message 5ms later, while a player overseas might get it 200ms later — giving the
nearby player an unfair head start.

### The Solution: Server Clock Synchronisation
Use a technique inspired by NTP (Network Time Protocol):

1. **On connect**, the client sends a `time_sync` request with its local timestamp
2. The server responds immediately with its own timestamp
3. The client measures round-trip time: `RTT = Date.now() - sentAt`
4. The client calculates its **clock offset**: `offset = serverTime - (sentAt + RTT/2)`
5. The client stores this offset and uses it to convert server timestamps to local time

```javascript
// client/src/utils/timeSync.js
let clockOffset = 0; // ms difference between client and server clocks

export function syncClock(socket) {
  return new Promise((resolve) => {
    const sentAt = Date.now();
    socket.emit('time_sync_request', { sentAt });

    socket.once('time_sync_response', ({ serverTime, sentAt: originalSentAt }) => {
      const rtt = Date.now() - originalSentAt;
      clockOffset = serverTime - (originalSentAt + rtt / 2);
      resolve(clockOffset);
    });
  });
}

export function getServerTime() {
  return Date.now() + clockOffset;
}
```

### How the Game Uses This
- Server emits `game_start` with a `startAt` timestamp (server time, e.g. 3 seconds in the future)
- Each client converts `startAt` using their `clockOffset` to their local equivalent time
- When `getServerTime() >= startAt` → the client enables tapping
- When `getServerTime() >= startAt + 15000` → the client disables tapping
- The server ALSO enforces the 15-second window and **rejects any tap received after the deadline**

---

## Server-Side Game Logic (`server/gameManager.js`)

### Room State Object
```javascript
{
  roomId: "room_abc123",
  players: {
    [socketId]: {
      name: string,
      taps: number,
      connected: boolean
    }
  },
  phase: "waiting" | "countdown" | "playing" | "finished",
  startAt: number | null,   // server timestamp when game begins
  endAt: number | null,     // server timestamp when game ends (startAt + 15000)
  countdownAt: number | null // server timestamp when 3-2-1 begins
}
```

### Server Events to Emit

| Event | Direction | Payload | When |
|---|---|---|---|
| `room_joined` | Server → Client | `{ roomId, players, phase }` | Client joins a room |
| `player_joined` | Server → All in room | `{ playerId, name, players }` | New player joins |
| `player_left` | Server → All in room | `{ playerId, players }` | Player disconnects |
| `game_starting` | Server → All in room | `{ countdownAt, startAt, endAt }` | Host starts game |
| `tap_accepted` | Server → Sender | `{ taps, playerId }` | Server validates a tap |
| `tap_update` | Server → All in room | `{ playerId, taps }` | Broadcasts tap count |
| `game_over` | Server → All in room | `{ results: [{name, taps}] sorted by taps desc }` | Game ends |
| `time_sync_response` | Server → Client | `{ serverTime, sentAt }` | Clock sync request |

### Server Events to Listen For

| Event | Payload | Handler |
|---|---|---|
| `join_room` | `{ name, roomId? }` | Join existing room or create new one |
| `start_game` | `{}` | Only accepted from first player (host) |
| `tap` | `{ clientTime }` | Validate tap is within the game window |
| `time_sync_request` | `{ sentAt }` | Respond immediately with server time |

### Tap Validation (Anti-cheat)
```javascript
socket.on('tap', ({ clientTime }) => {
  const room = getPlayerRoom(socket.id);
  if (!room) return;
  if (room.phase !== 'playing') return; // reject taps outside play phase
  
  const now = Date.now();
  if (now < room.startAt || now > room.endAt) return; // reject out-of-window taps

  room.players[socket.id].taps++;
  
  // Emit acceptance back to sender
  socket.emit('tap_accepted', { taps: room.players[socket.id].taps });
  // Broadcast to room so everyone sees live counts
  io.to(room.roomId).emit('tap_update', { playerId: socket.id, taps: room.players[socket.id].taps });
});
```

### Game Lifecycle
```
1. Players join a room (via join_room event)
2. Any player can click "Start Game"
3. Server schedules:
   - countdownAt = Date.now() + 1000  (1 second from now)
   - startAt     = Date.now() + 4000  (4 seconds from now: 1s delay + 3s countdown)
   - endAt       = startAt + 15000    (15 seconds of play)
4. Server emits game_starting to all players with these timestamps
5. Each client runs its own countdown display using getServerTime()
6. Server uses setTimeout to enforce endAt server-side
7. On endAt: server sets phase='finished', sorts players, emits game_over
```

---

## Frontend Pages — Full Specification

### 1. `LobbyPage.jsx`
- Input field: "Enter your name"
- Input field: "Room code (optional — leave blank to create new room)"
- Button: "Join Game"
- On join → emit `join_room` with name and optional roomId
- After joining → show room code (so friends can join), player list, and "Start Game" button
- Player list updates live as people join/leave
- Start Game button only visible to the first player who joined (host)

### 2. `GamePage.jsx`
**Phase: Countdown (before startAt)**
- Show large animated countdown: 3... 2... 1... GO!
- Countdown is calculated using `getServerTime()` not `Date.now()`
- All players see the same number at the same real-world moment
- Tap button is **disabled and greyed out** during countdown

**Phase: Playing (between startAt and endAt)**
- Show a large, satisfying **TAP BUTTON** in the center
- Show countdown timer: time remaining (e.g. "12.4s")
- Show your own tap count prominently: "Your taps: 47"
- Show a live mini-leaderboard of all players' current tap counts
- Timer and tap restriction enforced using `getServerTime()`
- Accept keyboard input: **Spacebar** or any key press counts as a tap
- Also accept mouse/touch clicks on the button
- Each tap → emit `tap` event to server → wait for `tap_accepted` to update UI
- Do NOT increment tap count locally before server confirms — use server as source of truth

**Phase: Finished (after endAt)**
- Disable button immediately
- Wait for `game_over` event with final sorted results
- Auto-navigate to `ResultsPage`

### 3. `ResultsPage.jsx`
- Large title: "🏆 Results"
- Sorted leaderboard table:
  - Rank | Player Name | Taps | Status
  - Highlight the winner (rank 1) with a trophy icon
  - Highlight the current player's row
- "Play Again" button → emit `start_game` (if host) or wait for host
- "Leave Room" button → disconnect and go back to lobby

---

## Client Socket Hook (`hooks/useSocket.js`)

```javascript
import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { syncClock } from '../utils/timeSync';

export function useSocket(serverUrl) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [clockSynced, setClockSynced] = useState(false);

  useEffect(() => {
    socketRef.current = io(serverUrl);

    socketRef.current.on('connect', async () => {
      setConnected(true);
      await syncClock(socketRef.current); // sync clock on connect
      setClockSynced(true);
    });

    socketRef.current.on('disconnect', () => setConnected(false));

    return () => socketRef.current.disconnect();
  }, [serverUrl]);

  return { socket: socketRef.current, connected, clockSynced };
}
```

---

## Timing & Fairness — Detailed Logic

### Server sends start time in the future
```javascript
// server — when host starts the game
const startAt = Date.now() + 4000; // 4 seconds from now
const endAt = startAt + 15000;

io.to(roomId).emit('game_starting', {
  countdownAt: Date.now() + 1000,
  startAt,
  endAt
});

// Server enforces end time
setTimeout(() => endGame(roomId), startAt + 15000 - Date.now());
```

### Client converts server time to local time
```javascript
// client — when game_starting is received
socket.on('game_starting', ({ startAt, endAt }) => {
  // Convert server timestamps to local time using offset
  const localStartAt = startAt - clockOffset;
  const localEndAt   = endAt - clockOffset;

  // Use these with Date.now() (local) for scheduling
  const msUntilStart = localStartAt - Date.now();
  setTimeout(() => enableTapping(), msUntilStart);
  setTimeout(() => disableTapping(), localEndAt - Date.now());
});
```

### Why this is fair
- Every player receives `startAt` as an **absolute server timestamp**
- Every player has calculated their `clockOffset`
- Every player locally computes `localStartAt = startAt - clockOffset`
- Since `clockOffset` corrects for network delay, all players enable their button
  at the **same real-world moment**, regardless of their ping

---

## Implementation Steps for Copilot

### Phase 1 — Server Setup
1. `npm init` in `/server`, install: `express`, `socket.io`, `cors`
2. Create `app.js` — set up Express + Socket.io with CORS for localhost:5173
3. Create `gameManager.js`:
   - Implement room creation and joining logic
   - Implement `time_sync_request` handler
   - Implement `start_game` handler with future timestamp scheduling
   - Implement `tap` handler with validation
   - Implement `endGame()` function that sorts results and emits `game_over`
4. Test with a simple `socket.io` test client (wscat or a basic HTML page)

### Phase 2 — Client Setup
1. `npm create vite@latest client -- --template react`, install: `socket.io-client`, `tailwindcss`
2. Implement `utils/timeSync.js`
3. Implement `hooks/useSocket.js`
4. Build `LobbyPage.jsx` — join/create room
5. Build `GamePage.jsx`:
   - Countdown phase using `getServerTime()`
   - Tap phase with spacebar + click support
   - Live leaderboard updates
6. Build `ResultsPage.jsx`
7. Wire up React Router in `App.jsx`

### Phase 3 — Integration & Testing
1. Run server on port 4000, client on port 5173
2. Open two browser tabs (or two different browsers) simulating two players
3. Verify countdown shows the same number at the same time in both tabs
4. Verify taps are counted and broadcast correctly
5. Verify the game ends at exactly 15 seconds on the server
6. Test with browser devtools — throttle network on one tab to 200ms latency
   and verify it still starts at the same real-world time as the unthrottled tab

---

## Edge Cases to Handle

| Scenario | Expected Behaviour |
|---|---|
| Player disconnects mid-game | Remove from room, broadcast `player_left`, continue game for others |
| Player taps after game ends | Server rejects tap (phase check) |
| Only one player in room | Can still start and play solo (wins by default) |
| Two players finish with same tap count | Both shown as tied winners |
| Room code entered that doesn't exist | Create a new room with that code |
| Player refreshes during game | They rejoin lobby (game state is not persisted) |
| Rapid taps (holding spacebar) | Each keydown event counts; keyup/keypress not double-counted |

---

## UI/UX Notes
- The **tap button should be huge** — at least 200x200px — and centered on screen
- Add a satisfying visual effect on tap (scale pulse animation with CSS)
- Add a subtle sound on tap (Web Audio API beep — optional but impressive)
- The countdown timer should be large and change color as time runs out
  (e.g. green → yellow → red in the last 5 seconds)
- Show a connection status indicator (green dot = connected, red = reconnecting)

---

## Deliverables Checklist
- [ ] Players can join a room with a name
- [ ] Room code is displayed and shareable
- [ ] Multiple players can join the same room
- [ ] Countdown is synchronised — all players see "3...2...1...GO!" simultaneously
- [ ] Spacebar and click both register as taps
- [ ] Taps are validated server-side and rejected outside the 15s window
- [ ] Live tap counts visible for all players during the game
- [ ] Game ends after exactly 15 seconds (server-enforced)
- [ ] Final leaderboard shown with winner highlighted
- [ ] Clock synchronisation implemented using RTT offset
- [ ] Game is fair under simulated network latency conditions
