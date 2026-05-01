import React, { useEffect, useState, useRef } from "react";
import api from "../services/api";

const TILE = {
  FLOOR: 0,
  WALL: 1,
  PLAYER: 2,
  BOX: 3,
  GOAL: 4,
};

const PALETTE = [
  { key: "WALL", label: "Wall", value: TILE.WALL, className: "bg-gray-700" },
  { key: "FLOOR", label: "Floor", value: TILE.FLOOR, className: "bg-gray-100" },
  {
    key: "PLAYER",
    label: "Player",
    value: TILE.PLAYER,
    className: "bg-blue-500",
  },
  { key: "BOX", label: "Box", value: TILE.BOX, className: "bg-yellow-500" },
  { key: "GOAL", label: "Goal", value: TILE.GOAL, className: "bg-green-300" },
];

export default function AdminPage() {
  const [width, setWidth] = useState(8);
  const [height, setHeight] = useState(8);
  const [selected, setSelected] = useState(TILE.WALL);
  const [grid, setGrid] = useState(() => createEmptyGrid(8, 8));
  const [painting, setPainting] = useState(false);
  const paintingRef = useRef(false);

  const [levelName, setLevelName] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const [levels, setLevels] = useState([]);
  const [loadingLevels, setLoadingLevels] = useState(true);

  useEffect(() => {
    setGrid(createEmptyGrid(width, height));
  }, [width, height]);

  useEffect(() => {
    fetchLevels();
  }, []);

  function createEmptyGrid(w, h) {
    return Array.from({ length: h }, () =>
      Array.from({ length: w }, () => TILE.FLOOR),
    );
  }

  async function fetchLevels() {
    setLoadingLevels(true);
    try {
      const res = await api.get("/levels");
      // server returns only active levels; show those
      setLevels(res.data || []);
    } catch (err) {
      setLevels([]);
    } finally {
      setLoadingLevels(false);
    }
  }

  function handleMouseDown(r, c) {
    paintingRef.current = true;
    setPainting(true);
    paintCell(r, c, selected);
  }

  function handleMouseEnter(r, c) {
    if (!paintingRef.current) return;
    paintCell(r, c, selected);
  }

  function handleMouseUp() {
    paintingRef.current = false;
    setPainting(false);
  }

  function paintCell(r, c, val) {
    setGrid((g) => {
      const copy = g.map((row) => row.slice());
      copy[r][c] = val;
      return copy;
    });
  }

  function countTiles(g) {
    let player = 0,
      boxes = 0,
      goals = 0;
    for (let y = 0; y < g.length; y++) {
      for (let x = 0; x < g[y].length; x++) {
        const v = g[y][x];
        if (v === TILE.PLAYER) player += 1;
        if (v === TILE.BOX) boxes += 1;
        if (v === TILE.GOAL) goals += 1;
      }
    }
    return { player, boxes, goals };
  }

  async function handleSave() {
    setError(null);
    setMessage(null);
    const counts = countTiles(grid);
    if (counts.player !== 1) {
      setError("Map must have exactly 1 Player tile");
      return;
    }
    if (counts.boxes < 1) {
      setError("Map must have at least 1 Box");
      return;
    }
    if (counts.goals < 1) {
      setError("Map must have at least 1 Goal");
      return;
    }
    if (counts.boxes !== counts.goals) {
      setError("Number of Boxes must equal number of Goals");
      return;
    }
    if (!levelName.trim()) {
      setError("Level name is required");
      return;
    }

    try {
      await api.post("/levels", {
        name: levelName.trim(),
        difficulty,
        map_data: grid,
      });
      setMessage("Level saved");
      setLevelName("");
      setDifficulty("medium");
      setGrid(createEmptyGrid(width, height));
      fetchLevels();
      // clear message after 3s
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to save level");
    }
  }

  async function handleDeactivate(id) {
    try {
      await api.delete(`/levels/${id}`);
      fetchLevels();
    } catch (err) {
      // ignore
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Admin — Level Creator</h1>

      <div className="bg-white rounded shadow p-4">
        <div className="flex gap-6 flex-col md:flex-row">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <label className="text-sm">Width</label>
              <input
                type="number"
                min={5}
                max={15}
                value={width}
                onChange={(e) =>
                  setWidth(
                    Math.max(5, Math.min(15, Number(e.target.value || 8))),
                  )
                }
                className="w-20 border px-2 py-1 rounded"
              />
              <label className="text-sm">Height</label>
              <input
                type="number"
                min={5}
                max={15}
                value={height}
                onChange={(e) =>
                  setHeight(
                    Math.max(5, Math.min(15, Number(e.target.value || 8))),
                  )
                }
                className="w-20 border px-2 py-1 rounded"
              />
            </div>

            <div className="mb-3">
              <div className="flex gap-2">
                {PALETTE.map((p) => (
                  <button
                    key={p.key}
                    onClick={() => setSelected(p.value)}
                    className={`px-3 py-2 rounded flex items-center gap-2 border ${selected === p.value ? "ring-2 ring-blue-500" : ""}`}
                  >
                    <span className={`w-5 h-5 rounded ${p.className}`} />
                    <span className="text-sm">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-3 border">
              <div onMouseLeave={handleMouseUp} className="select-none">
                {grid.map((row, r) => (
                  <div key={r} className="flex">
                    {row.map((cell, c) => {
                      const paletteItem = PALETTE.find((p) => p.value === cell);
                      const color = paletteItem
                        ? paletteItem.className
                        : "bg-gray-100";
                      return (
                        <div
                          key={c}
                          onMouseDown={() => handleMouseDown(r, c)}
                          onMouseEnter={() => handleMouseEnter(r, c)}
                          onMouseUp={handleMouseUp}
                          className={`w-10 h-10 border flex items-center justify-center ${color} cursor-pointer`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="mb-3">
              <label className="block text-sm font-medium">Level Name</label>
              <input
                value={levelName}
                onChange={(e) => setLevelName(e.target.value)}
                className="w-full border px-3 py-2 rounded mt-1"
              />
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full border px-3 py-2 rounded mt-1"
              >
                <option value="easy">easy</option>
                <option value="medium">medium</option>
                <option value="hard">hard</option>
              </select>
            </div>

            {error && (
              <div className="mb-3 text-sm text-red-700 bg-red-100 p-2 rounded">
                {error}
              </div>
            )}
            {message && (
              <div className="mb-3 text-sm text-green-700 bg-green-100 p-2 rounded">
                {message}
              </div>
            )}

            <div>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Save Level
              </button>
            </div>
          </div>
        </div>
      </div>

      <section className="mt-6">
        <h2 className="text-xl font-semibold mb-3">Existing Levels</h2>
        {loadingLevels ? (
          <div>Loading...</div>
        ) : (
          <div className="grid gap-3">
            {levels.map((lvl) => (
              <div
                key={lvl.id}
                className="bg-white p-3 rounded shadow flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold">{lvl.name}</div>
                  <div className="text-sm text-gray-600">
                    {lvl.difficulty} — By {lvl.created_by || "unknown"}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className={`px-2 py-1 rounded text-sm ${lvl.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
                  >
                    {lvl.is_active ? "Active" : "Inactive"}
                  </div>
                  {lvl.is_active && (
                    <button
                      onClick={() => handleDeactivate(lvl.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded"
                    >
                      Deactivate
                    </button>
                  )}
                </div>
              </div>
            ))}
            {levels.length === 0 && (
              <div className="text-sm text-gray-600">No levels found.</div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
