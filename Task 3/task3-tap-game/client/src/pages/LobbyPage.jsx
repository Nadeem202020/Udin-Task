import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LobbyPage({ socket, connected, clockSynced }) {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [roomCodeInput, setRoomCodeInput] = useState("");

  const [joined, setJoined] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [players, setPlayers] = useState({});

  const latestPlayersRef = useRef(players);

  useEffect(() => {
    latestPlayersRef.current = players;
  }, [players]);

  useEffect(() => {
    if (!socket) return;

    const onRoomJoined = ({
      roomId: joinedRoomId,
      players: roomPlayers,
      isHost: hostFlag,
    }) => {
      setRoomId(joinedRoomId);
      setPlayers(roomPlayers || {});
      setIsHost(Boolean(hostFlag));
      setJoined(true);
    };

    const onPlayerJoined = ({ players: roomPlayers }) => {
      setPlayers(roomPlayers || {});
    };

    const onPlayerLeft = ({ players: roomPlayers }) => {
      setPlayers(roomPlayers || {});
    };

    const onGameStarting = ({ countdownAt, startAt, endAt }) => {
      navigate("/game", {
        state: {
          roomId,
          players: latestPlayersRef.current,
          countdownAt,
          startAt,
          endAt,
          isHost,
        },
      });
    };

    socket.on("room_joined", onRoomJoined);
    socket.on("player_joined", onPlayerJoined);
    socket.on("player_left", onPlayerLeft);
    socket.on("game_starting", onGameStarting);

    return () => {
      socket.off("room_joined", onRoomJoined);
      socket.off("player_joined", onPlayerJoined);
      socket.off("player_left", onPlayerLeft);
      socket.off("game_starting", onGameStarting);
    };
  }, [socket, navigate, roomId, isHost]);

  const playerRows = useMemo(() => Object.entries(players), [players]);

  const canJoin = Boolean(name.trim()) && connected && clockSynced;

  const handleJoinGame = () => {
    if (!socket || !canJoin) return;

    const normalizedRoomId = roomCodeInput.trim().toUpperCase();
    socket.emit("join_room", {
      name: name.trim(),
      roomId: normalizedRoomId || undefined,
    });
  };

  const handleStartGame = () => {
    if (!socket || !isHost) return;
    socket.emit("start_game", {});
  };

  const handleCopyRoomCode = async () => {
    if (!roomId) return;
    try {
      await navigator.clipboard.writeText(roomId);
    } catch {
      // Clipboard API can fail in some environments; ignore silently.
    }
  };

  if (!joined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
          <h1 className="text-4xl font-bold text-center mb-2">Tap Game</h1>
          <div className="text-center text-sm mb-6">
            {connected ? (
              <span className="text-green-600">🟢 Connected</span>
            ) : (
              <span className="text-red-600">🔴 Disconnected</span>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Enter your name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Room code (optional)
              </label>
              <input
                type="text"
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value)}
                placeholder="Leave blank to create new room"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 uppercase focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>

            <button
              type="button"
              onClick={handleJoinGame}
              disabled={!canJoin}
              className="w-full rounded-lg bg-purple-600 px-4 py-2 font-bold text-white enabled:hover:bg-purple-500 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              Join Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-lg w-full">
        <h1 className="text-4xl font-bold text-center mb-2">Tap Game Lobby</h1>
        <div className="text-center text-sm mb-6">
          {connected ? (
            <span className="text-green-600">🟢 Connected</span>
          ) : (
            <span className="text-red-600">🔴 Disconnected</span>
          )}
        </div>

        <div className="mb-6 rounded-lg border border-purple-200 bg-purple-50 p-4">
          <p className="text-sm font-semibold text-purple-700 mb-2">
            Room Code
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-md bg-white border border-purple-200 px-3 py-2 text-center text-2xl font-black tracking-[0.2em] text-purple-800">
              {roomId}
            </div>
            <button
              type="button"
              onClick={handleCopyRoomCode}
              className="rounded-md bg-purple-600 px-3 py-2 text-sm font-bold text-white hover:bg-purple-500"
            >
              Copy
            </button>
          </div>
        </div>

        <div className="mb-5">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-600">
            Players
          </h2>
          <div className="space-y-2">
            {playerRows.map(([playerId, player]) => (
              <div
                key={playerId}
                className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-2"
              >
                <span className="font-semibold text-gray-800">
                  {player.name}
                </span>
                <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700">
                  Ready
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-sm text-gray-600">
          Waiting for host to start...
        </p>

        {isHost && (
          <button
            type="button"
            onClick={handleStartGame}
            className="mt-4 w-full rounded-lg bg-emerald-600 px-4 py-2 font-bold text-white hover:bg-emerald-500"
          >
            Start Game
          </button>
        )}
      </div>
    </div>
  );
}
