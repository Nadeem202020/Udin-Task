import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function ResultsPage({ socket, connected }) {
  const location = useLocation();
  const navigate = useNavigate();

  const results = location.state?.results ?? [];
  const isHost = Boolean(location.state?.isHost);
  const currentPlayerId = location.state?.currentPlayerId ?? socket?.id ?? null;

  const tableRows = useMemo(() => {
    let previousTaps = null;
    let previousRank = 0;

    const tapsFrequency = results.reduce((acc, player) => {
      acc[player.taps] = (acc[player.taps] || 0) + 1;
      return acc;
    }, {});

    return results.map((player, index) => {
      const rank =
        previousTaps !== null && player.taps === previousTaps
          ? previousRank
          : index + 1;

      previousTaps = player.taps;
      previousRank = rank;

      return {
        rank,
        id: player.id,
        name: player.name,
        taps: player.taps,
        isTied: tapsFrequency[player.taps] > 1,
      };
    });
  }, [results]);

  const handlePlayAgain = () => {
    if (!socket || !isHost) return;
    socket.emit("start_game", {});
  };

  const handleLeaveRoom = () => {
    if (socket) {
      socket.disconnect();
    }
    navigate("/");
  };

  if (results.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-500 to-cyan-600 p-4 text-white">
        <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center rounded-2xl border border-white/25 bg-white/10 p-8 backdrop-blur">
          <p className="text-xl font-bold">
            No results yet. Return to lobby and start a game.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500 to-cyan-600 p-4 text-white">
      <div className="mx-auto max-w-3xl rounded-2xl border border-white/25 bg-white/10 p-6 backdrop-blur">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-4xl font-black tracking-tight">🏆 Results</h1>
          <span className="text-sm font-semibold text-white/90">
            {connected ? "Connected" : "Disconnected"}
          </span>
        </div>

        <div className="overflow-hidden rounded-xl border border-white/20">
          <table className="w-full text-left">
            <thead className="bg-slate-900/50 text-sm uppercase tracking-wider text-white/80">
              <tr>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Player</th>
                <th className="px-4 py-3">Taps</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row) => {
                const isWinner = row.rank === 1;
                const isCurrentPlayer = row.id === currentPlayerId;
                const isTied = row.isTied;

                const rowClassName = [
                  isTied ? "bg-amber-300/25" : "bg-slate-900/20",
                  isCurrentPlayer ? "ring-1 ring-cyan-300" : "",
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <tr
                    key={row.id}
                    className={`border-t border-white/15 ${rowClassName}`}
                  >
                    <td className="px-4 py-3 font-bold">
                      {isWinner ? "🏆 1" : row.rank}
                    </td>
                    <td className="px-4 py-3 font-semibold">{row.name}</td>
                    <td className="px-4 py-3 font-black">{row.taps}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {isHost ? (
            <button
              type="button"
              onClick={handlePlayAgain}
              className="flex-1 rounded-xl bg-emerald-500 px-4 py-3 font-bold text-slate-950 transition hover:bg-emerald-400"
            >
              Play Again
            </button>
          ) : (
            <div className="flex-1 rounded-xl border border-white/20 bg-slate-900/30 px-4 py-3 text-center font-semibold text-white/85">
              Waiting for host
            </div>
          )}

          <button
            type="button"
            onClick={handleLeaveRoom}
            className="flex-1 rounded-xl bg-rose-500 px-4 py-3 font-bold text-white transition hover:bg-rose-400"
          >
            Leave Room
          </button>
        </div>
      </div>
    </div>
  );
}
