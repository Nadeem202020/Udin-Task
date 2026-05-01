import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import GameBoard from "../components/GameBoard";
import { useAuth } from "../context/AuthContext";

export default function GamePage() {
  const { levelId } = useParams();
  const [level, setLevel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [winData, setWinData] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/levels/${levelId}`);
        setLevel(res.data);
      } catch (err) {
        setLevel(null);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [levelId]);

  const handleWin = (moves, pushes, timeSeconds) => {
    setWinData({ moves, pushes, timeSeconds });
  };

  const submitScore = async () => {
    if (!winData || !user) return;
    setSubmitting(true);
    try {
      await api.post("/scores", {
        level_id: level.id,
        moves: winData.moves,
        pushes: winData.pushes,
        time_seconds: winData.timeSeconds,
      });
      // keep winData and show success
      setWinData((w) => ({ ...w, submitted: true }));
    } catch (err) {
      // ignore error for now
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6">Loading level...</div>;
  if (!level) return <div className="p-6">Level not found</div>;
  if (!user) return <div className="p-6">You must be logged in to play.</div>;

  return (
    <div className="container mx-auto p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{level.name}</h1>
        <div className="text-sm text-gray-600">
          By {level.createdBy || "unknown"}
        </div>
      </div>

      <div className="bg-white rounded shadow p-4">
        <GameBoard mapData={level.mapData} onWin={handleWin} />
      </div>

      {winData && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-2">Level Complete!</h2>
            <p className="mb-2">
              Moves: {winData.moves} | Pushes: {winData.pushes} | Time:{" "}
              {winData.timeSeconds}s
            </p>
            {!winData.submitted ? (
              <div className="flex gap-3">
                <button
                  onClick={submitScore}
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  {submitting ? "Saving..." : "Submit Score"}
                </button>
                <button
                  onClick={() => navigate("/levels")}
                  className="px-4 py-2 border rounded"
                >
                  Back to Levels
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <div className="text-green-600 font-semibold">
                  Score submitted!
                </div>
                <button
                  onClick={() => navigate("/levels")}
                  className="px-4 py-2 border rounded"
                >
                  Back to Levels
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
