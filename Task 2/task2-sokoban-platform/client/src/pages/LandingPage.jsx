import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LandingPage() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    try {
      const res = await api.get("/scores/leaderboard");
      setLeaderboard(res.data || []);
    } catch (err) {
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    const id = setInterval(fetchLeaderboard, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100">
      <header className="py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-extrabold mb-2">Sokoban Multiplayer</h1>
          <p className="text-gray-600">
            Compete for the fastest solves and climb the leaderboard.
          </p>

          <div className="mt-6 flex justify-center gap-3">
            {user ? (
              <Link
                to="/levels"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg"
              >
                Play Now
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-3 border border-blue-600 text-blue-600 rounded-lg"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pb-12">
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">Leaderboard</h2>

          {loading ? (
            <div>Loading leaderboard...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-sm text-gray-600 border-b">
                    <th className="py-2">Rank</th>
                    <th className="py-2">Username</th>
                    <th className="py-2">Level</th>
                    <th className="py-2">Moves</th>
                    <th className="py-2">Time (s)</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-4 text-center text-gray-500"
                      >
                        No scores yet
                      </td>
                    </tr>
                  )}
                  {leaderboard.map((row, i) => (
                    <tr
                      key={i}
                      className={`border-b ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                    >
                      <td className="py-2">{i + 1}</td>
                      <td className="py-2">{row.username}</td>
                      <td className="py-2">{row.level_name}</td>
                      <td className="py-2">{row.moves}</td>
                      <td className="py-2">{row.time_seconds}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
