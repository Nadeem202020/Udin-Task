/**
 * Game Manager — handles room state, player management, and game logic
 */

// In-memory storage of all active game rooms
const rooms = {};

/**
 * Generate a random 6-character alphanumeric room code
 */
function generateRoomId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Get a room by roomId
 */
function getRoom(roomId) {
  return rooms[roomId] || null;
}

/**
 * Find which room a player (socket) belongs to
 */
function getPlayerRoom(socketId) {
  for (const roomId in rooms) {
    if (rooms[roomId].players[socketId]) {
      return rooms[roomId];
    }
  }
  return null;
}

/**
 * Create a new room object
 */
function createRoom(roomId) {
  return {
    roomId,
    players: {},
    phase: "waiting", // 'waiting' | 'countdown' | 'playing' | 'finished'
    startAt: null,
    endAt: null,
    countdownAt: null,
  };
}

/**
 * Handle player joining a room
 * Returns { roomId, players, phase, isHost }
 */
function handleJoinRoom(socketId, name, requestedRoomId) {
  let roomId = requestedRoomId;
  let room = null;

  // If no room requested, generate a new one
  if (!roomId) {
    roomId = generateRoomId();
    room = createRoom(roomId);
    rooms[roomId] = room;
  } else {
    // Room requested — fetch or create it
    room = getRoom(roomId);
    if (!room) {
      room = createRoom(roomId);
      rooms[roomId] = room;
    }
  }

  // Add the player to the room
  const isHost = Object.keys(room.players).length === 0;
  room.players[socketId] = {
    name,
    taps: 0,
    connected: true,
  };

  return {
    roomId,
    players: room.players,
    phase: room.phase,
    isHost,
  };
}

/**
 * Handle player disconnection from their room
 */
function handlePlayerDisconnect(socketId) {
  const room = getPlayerRoom(socketId);
  if (!room) return null;

  // Remove player from room
  delete room.players[socketId];

  // If room is now empty, delete it
  if (Object.keys(room.players).length === 0) {
    delete rooms[room.roomId];
    return null;
  }

  // Return room info for broadcasting player_left event
  return {
    roomId: room.roomId,
    players: room.players,
  };
}

/**
 * Start a game in a room
 * Only allowed if room phase is 'waiting'
 * Returns { countdownAt, startAt, endAt } or null if not allowed
 * Also schedules phase transitions and endGame internally
 */
function handleStartGame(roomId, onPhaseChange, onGameEnd) {
  const room = getRoom(roomId);
  if (!room) return null;
  if (room.phase !== "waiting") return null;

  // Set phase to countdown
  room.phase = "countdown";

  // Calculate timing
  const countdownAt = Date.now() + 1000; // 1 second from now
  const startAt = Date.now() + 4000; // 4 seconds from now (1s + 3s countdown)
  const endAt = startAt + 15000; // 15 seconds of gameplay

  // Store on room
  room.countdownAt = countdownAt;
  room.startAt = startAt;
  room.endAt = endAt;

  // Schedule phase change to 'playing' at startAt
  const msUntilStart = startAt - Date.now();
  setTimeout(() => {
    if (room.phase === "countdown") {
      room.phase = "playing";
      onPhaseChange(roomId, "playing");
    }
  }, msUntilStart);

  // Schedule endGame at endAt
  const msUntilEnd = endAt - Date.now();
  setTimeout(() => {
    endGame(roomId, onGameEnd);
  }, msUntilEnd);

  return { countdownAt, startAt, endAt };
}

/**
 * Handle a tap from a player
 * Returns { taps, playerId } if valid, or null if rejected
 */
function handleTap(socketId) {
  const room = getPlayerRoom(socketId);
  if (!room) return null;

  // Reject if not in playing phase
  if (room.phase !== "playing") return null;

  const now = Date.now();

  // Reject if outside the game window
  if (now < room.startAt || now > room.endAt) return null;

  // Increment tap count
  room.players[socketId].taps++;

  return {
    playerId: socketId,
    taps: room.players[socketId].taps,
  };
}

/**
 * End a game and calculate results
 * Called automatically when time expires
 * Returns sorted results for broadcasting
 */
function endGame(roomId, onGameEnd) {
  const room = getRoom(roomId);
  if (!room) return null;

  // Set phase to finished
  room.phase = "finished";

  // Sort players by taps (descending)
  const results = Object.entries(room.players)
    .map(([id, player]) => ({
      id,
      name: player.name,
      taps: player.taps,
    }))
    .sort((a, b) => b.taps - a.taps);

  // Notify if callback provided
  if (onGameEnd) {
    onGameEnd(roomId, results);
  }

  return results;
}

module.exports = {
  rooms,
  generateRoomId,
  getRoom,
  getPlayerRoom,
  createRoom,
  handleJoinRoom,
  handlePlayerDisconnect,
  handleStartGame,
  handleTap,
  endGame,
};
