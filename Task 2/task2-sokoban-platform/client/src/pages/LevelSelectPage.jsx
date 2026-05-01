import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LevelSelectPage() {
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/levels");
        setLevels(res.data || []);
      } catch (err) {
        setLevels([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const colorForDifficulty = (d) => {
    if (d === "easy") return "bg-green-200 text-green-800";
    if (d === "hard") return "bg-red-200 text-red-800";
    return "bg-yellow-200 text-yellow-800";
  };

  if (!user) {
    return <div className="p-6">You must be logged in to access levels.</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Select a Level</h1>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {levels.map((lvl) => (
            <div
              key={lvl.id}
              className="bg-white rounded shadow p-4 flex flex-col justify-between"
            >
              <div>
                <h3 className="text-lg font-semibold">{lvl.name}</h3>
                <p className="text-sm text-gray-600">
                  By {lvl.createdBy || "unknown"}
                </p>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${colorForDifficulty(lvl.difficulty)}`}
                >
                  {lvl.difficulty}
                </span>
                <button
                  onClick={() => navigate(`/game/${lvl.id}`)}
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Play
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
