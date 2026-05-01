const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const {
  handleJoinRoom,
  handlePlayerDisconnect,
  handleStartGame,
  handleTap,
  getPlayerRoom,
} = require("./gameManager");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Per-socket tap limiter: max 30 taps per 1000ms window.
const tapRateLimiter = new Map();

// Middleware
app.use(cors());
app.use(express.json());

// Basic health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Socket.io connection handler
io.on("connection", (socket) => {
  console.log(`Player connected: ${socket.id}`);

  /**
   * time_sync_request — send server time immediately for clock synchronization
   */
  socket.on("time_sync_request", ({ sentAt }) => {
    socket.emit("time_sync_response", {
      serverTime: Date.now(),
      sentAt,
    });
  });

  /**
   * join_room — add player to a room
   */
  socket.on("join_room", ({ name, roomId }) => {
    const {
      roomId: joinedRoomId,
      players,
      phase,
      isHost,
    } = handleJoinRoom(socket.id, name, roomId);

    // Add socket to the Socket.io room
    socket.join(joinedRoomId);

    // Notify the joining player
    socket.emit("room_joined", {
      roomId: joinedRoomId,
      players,
      phase,
      isHost,
    });

    // Notify all other players in the room
    socket.to(joinedRoomId).emit("player_joined", {
      playerId: socket.id,
      name,
      players,
    });

    console.log(`Player ${name} (${socket.id}) joined room ${joinedRoomId}`);
  });

  /**
   * start_game — initiate countdown and game start
   */
  socket.on("start_game", () => {
    const room = getPlayerRoom(socket.id);
    if (!room) return;

    const timing = handleStartGame(
      room.roomId,
      // Callback for phase change to 'playing'
      (roomId, phase) => {
        io.to(roomId).emit("phase_change", { phase });
      },
      // Callback for game end
      (roomId, results) => {
        io.to(roomId).emit("game_over", { results });
      },
    );

    if (!timing) return; // Not allowed (already started or not waiting)

    // Emit game_starting to all players in room with timing info
    io.to(room.roomId).emit("game_starting", timing);
    console.log(`Game started in room ${room.roomId}`);
  });

  /**
   * tap — register a tap from the player
   */
  socket.on("tap", ({ clientTime }) => {
    const room = getPlayerRoom(socket.id);
    if (!room) return;

    // Reject taps if phase is not playing.
    if (room.phase !== "playing") return;

    const now = Date.now();

    // Reject taps outside [startAt, endAt] server-authoritative window.
    if (now < room.startAt || now > room.endAt) return;

    // Reject more than 30 taps per second per socket.
    const limiter = tapRateLimiter.get(socket.id) || {
      windowStart: now,
      count: 0,
    };

    if (now - limiter.windowStart >= 1000) {
      limiter.windowStart = now;
      limiter.count = 0;
    }

    limiter.count += 1;
    tapRateLimiter.set(socket.id, limiter);

    if (limiter.count > 30) return;

    const tapResult = handleTap(socket.id);

    if (!tapResult) return; // Tap was rejected (wrong phase or outside time window)

    // Emit tap_accepted to the sender
    socket.emit("tap_accepted", {
      taps: tapResult.taps,
      playerId: tapResult.playerId,
    });

    // Broadcast tap_update to all players in room
    io.to(room.roomId).emit("tap_update", {
      playerId: tapResult.playerId,
      taps: tapResult.taps,
    });
  });

  /**
   * disconnect — clean up when player leaves
   */
  socket.on("disconnect", () => {
    tapRateLimiter.delete(socket.id);
    const result = handlePlayerDisconnect(socket.id);

    if (result) {
      // Room still has players — broadcast player left event
      io.to(result.roomId).emit("player_left", {
        playerId: socket.id,
        players: result.players,
      });
      console.log(
        `Player ${socket.id} left room ${result.roomId}. Room now has ${Object.keys(result.players).length} players.`,
      );
    } else {
      console.log(`Player ${socket.id} disconnected. Room was deleted.`);
    }
  });
});

// Start server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🎮 Tap game server running on http://localhost:${PORT}`);
});

module.exports = { app, server, io };
