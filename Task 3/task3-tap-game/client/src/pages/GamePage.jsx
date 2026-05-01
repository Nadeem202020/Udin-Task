import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getServerTime } from "../utils/timeSync";

const PHASES = {
  COUNTDOWN: "countdown",
  PLAYING: "playing",
  FINISHED: "finished",
};

export default function GamePage({ socket, connected }) {
  const location = useLocation();
  const navigate = useNavigate();

  const hasGameState = Boolean(
    location.state?.startAt && location.state?.endAt,
  );
  const startAt = location.state?.startAt ?? null;
  const endAt = location.state?.endAt ?? null;
  const roomId = location.state?.roomId ?? null;
  const isHost = Boolean(location.state?.isHost);

  const [phase, setPhase] = useState(PHASES.COUNTDOWN);
  const [countdownDisplay, setCountdownDisplay] = useState(3);
  const [remainingSeconds, setRemainingSeconds] = useState(15);
  const [myTaps, setMyTaps] = useState(0);
  const [players, setPlayers] = useState(() => location.state?.players ?? {});
  const [resultsReceived, setResultsReceived] = useState(false);
  const [tapPulse, setTapPulse] = useState(false);

  const mySocketId = socket?.id;

  useEffect(() => {
    // If GamePage is opened directly without required timing state, return to lobby.
    if (!hasGameState) {
      navigate("/");
    }
  }, [hasGameState, navigate]);

  useEffect(() => {
    if (!startAt || !endAt) return;

    const intervalId = setInterval(() => {
      const now = getServerTime();

      if (now < startAt) {
        setPhase(PHASES.COUNTDOWN);
        const countdownValue = Math.ceil((startAt - now) / 1000);
        if (countdownValue <= 0) {
          setCountdownDisplay("GO!");
        } else {
          setCountdownDisplay(Math.min(3, countdownValue));
        }
        return;
      }

      if (now >= startAt && now < endAt) {
        setPhase(PHASES.PLAYING);
        const nextRemaining = Math.max(0, (endAt - now) / 1000);
        setRemainingSeconds(nextRemaining);
        return;
      }

      setPhase(PHASES.FINISHED);
      setRemainingSeconds(0);
    }, 100);

    return () => clearInterval(intervalId);
  }, [startAt, endAt]);

  useEffect(() => {
    if (!socket) return;

    const onTapAccepted = ({ taps }) => {
      setMyTaps(taps);

      // Keep local leaderboard in sync for this player too.
      if (mySocketId) {
        setPlayers((prev) => ({
          ...prev,
          [mySocketId]: {
            ...(prev[mySocketId] ?? { name: "You" }),
            taps,
          },
        }));
      }
    };

    const onTapUpdate = ({ playerId, taps }) => {
      setPlayers((prev) => ({
        ...prev,
        [playerId]: {
          ...(prev[playerId] ?? { name: "Player" }),
          taps,
        },
      }));
    };

    const onGameOver = ({ results }) => {
      setResultsReceived(true);
      navigate("/results", {
        state: {
          results,
          roomId,
          isHost,
          currentPlayerId: socket?.id ?? null,
        },
      });
    };

    socket.on("tap_accepted", onTapAccepted);
    socket.on("tap_update", onTapUpdate);
    socket.on("game_over", onGameOver);

    return () => {
      socket.off("tap_accepted", onTapAccepted);
      socket.off("tap_update", onTapUpdate);
      socket.off("game_over", onGameOver);
    };
  }, [socket, mySocketId, navigate, roomId, isHost]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (phase !== PHASES.PLAYING || !socket) return;
      event.preventDefault();
      socket.emit("tap", { clientTime: getServerTime() });
      setTapPulse(true);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [phase, socket]);

  useEffect(() => {
    if (!tapPulse) return;
    const timeoutId = setTimeout(() => setTapPulse(false), 220);
    return () => clearTimeout(timeoutId);
  }, [tapPulse]);

  const canTap = phase === PHASES.PLAYING;

  const leaderboardRows = useMemo(() => {
    return Object.entries(players)
      .map(([id, player]) => ({
        id,
        name: player?.name ?? "Player",
        taps: player?.taps ?? 0,
      }))
      .sort((a, b) => b.taps - a.taps);
  }, [players]);

  const timerClassName =
    remainingSeconds < 3
      ? "text-red-500"
      : remainingSeconds < 5
        ? "text-yellow-400"
        : "text-emerald-300";

  const handleTap = () => {
    if (!canTap || !socket) return;
    socket.emit("tap", { clientTime: getServerTime() });
    setTapPulse(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-cyan-900 text-white p-4">
      {!connected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
          <div className="rounded-xl border border-white/20 bg-slate-900/80 px-6 py-4 text-lg font-bold text-white">
            Reconnecting...
          </div>
        </div>
      )}

      <div className="fixed right-4 top-4 z-40 flex items-center gap-2 rounded-full border border-white/15 bg-slate-900/70 px-3 py-1 text-xs font-semibold text-white/90">
        <span
          className={`inline-block h-2.5 w-2.5 rounded-full ${connected ? "bg-emerald-400" : "bg-red-400"}`}
        />
        {connected ? "Connected" : "Disconnected"}
      </div>

      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between pr-24">
          <h1 className="text-3xl font-black tracking-tight">Tap Sprint</h1>
          <span className="text-sm font-semibold text-white/80">
            {connected ? "Connected" : "Reconnecting..."}
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-[1fr_300px]">
          <div className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur">
            <div className="mb-5 text-center">
              {phase === PHASES.COUNTDOWN && (
                <div className="text-7xl font-black leading-none md:text-8xl">
                  {countdownDisplay}
                </div>
              )}

              {phase === PHASES.PLAYING && (
                <>
                  <div className="text-lg font-semibold text-white/80">
                    Time Remaining
                  </div>
                  <div className={`text-6xl font-black ${timerClassName}`}>
                    {remainingSeconds.toFixed(1)}s
                  </div>
                </>
              )}

              {phase === PHASES.FINISHED && (
                <div className="text-5xl font-black text-rose-300">
                  Time's up!
                </div>
              )}
            </div>

            <div className="mb-5 text-center text-3xl font-black">
              Your taps: <span className="text-cyan-300">{myTaps}</span>
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleTap}
                disabled={!canTap}
                className={`tap-button min-h-[220px] min-w-[220px] rounded-full border-4 text-2xl font-black uppercase tracking-wide transition ${
                  tapPulse ? "tap-button-pulse" : ""
                } ${
                  canTap
                    ? "border-cyan-200 bg-cyan-400 text-slate-900 shadow-[0_0_40px_rgba(34,211,238,0.45)] hover:scale-105 active:scale-95"
                    : "border-slate-400 bg-slate-500 text-slate-300 opacity-90"
                }`}
              >
                Tap
              </button>
            </div>

            <p className="mt-4 text-center text-sm text-white/70">
              Press any key or click to tap.
            </p>

            {phase === PHASES.FINISHED && !resultsReceived && (
              <p className="mt-3 text-center text-sm font-semibold text-white/80">
                Waiting for final results...
              </p>
            )}
          </div>

          <aside className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur">
            <h2 className="text-lg font-black">Live Leaderboard</h2>
            <div className="mt-3 space-y-2">
              {leaderboardRows.length === 0 && (
                <p className="text-sm text-white/70">No players yet.</p>
              )}
              {leaderboardRows.map((player, index) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between rounded-lg border border-white/15 bg-white/10 px-3 py-2"
                >
                  <span className="font-semibold">
                    {index + 1}. {player.name}
                  </span>
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-sm font-bold">
                    {player.taps}
                  </span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
