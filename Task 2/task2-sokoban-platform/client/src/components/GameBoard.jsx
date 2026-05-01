import React, { useEffect, useState, useRef } from "react";

// Tile constants same as Task 1 levels.js
const TILE = {
  EMPTY: 0,
  WALL: 1,
  PLAYER: 2,
  BOX: 3,
  GOAL: 4,
  BOX_ON_GOAL: 5,
  PLAYER_ON_GOAL: 6,
};

// Convert string-based map from API to numeric tile constants
const convertMapFromAPI = (stringMap) => {
  if (!stringMap || !Array.isArray(stringMap)) return [];
  return stringMap.map((row) =>
    row.map((tile) => {
      if (typeof tile === "number") return tile; // already numeric
      switch (tile) {
        case "#":
          return TILE.WALL;
        case " ":
          return TILE.EMPTY;
        case "@":
          return TILE.PLAYER;
        case "$":
          return TILE.BOX;
        case ".":
          return TILE.GOAL;
        default:
          return TILE.EMPTY;
      }
    }),
  );
};

export default function GameBoard({ mapData, onWin }) {
  const [map, setMap] = useState(() =>
    mapData ? convertMapFromAPI(mapData) : [],
  );
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0 });
  const [moves, setMoves] = useState(0);
  const [pushes, setPushes] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [solved, setSolved] = useState(false);

  const historyRef = useRef([]);

  // initialize map and player pos when mapData changes
  useEffect(() => {
    if (!mapData) return;
    const copy = convertMapFromAPI(mapData);
    setMap(copy);
    // find player
    let found = { x: 0, y: 0 };
    for (let y = 0; y < copy.length; y++) {
      for (let x = 0; x < copy[y].length; x++) {
        if (copy[y][x] === TILE.PLAYER || copy[y][x] === TILE.PLAYER_ON_GOAL) {
          found = { x, y };
        }
      }
    }
    setPlayerPos(found);
    setMoves(0);
    setPushes(0);
    setSolved(false);
    historyRef.current = [];
    setStartTime(Date.now());
  }, [mapData]);

  // helper: try move
  const tryMove = (dx, dy) => {
    if (solved) return;
    const h = historyRef.current;
    const rows = map.length;
    const cols = map[0]?.length || 0;
    const nx = playerPos.x + dx;
    const ny = playerPos.y + dy;
    if (ny < 0 || ny >= rows || nx < 0 || nx >= cols) return;
    const target = map[ny][nx];
    if (target === TILE.WALL) return;

    // snapshot
    h.push({
      map: map.map((r) => r.slice()),
      playerPos: { ...playerPos },
      moves,
      pushes,
      startTime,
      solved,
    });

    let didPush = false;
    const newMap = map.map((r) => r.slice());

    if (target === TILE.BOX || target === TILE.BOX_ON_GOAL) {
      const bx = nx + dx;
      const by = ny + dy;
      if (by < 0 || by >= rows || bx < 0 || bx >= cols) return;
      const boxTarget = newMap[by][bx];
      if (
        boxTarget === TILE.WALL ||
        boxTarget === TILE.BOX ||
        boxTarget === TILE.BOX_ON_GOAL
      ) {
        // cannot push
        return;
      }

      // move box
      newMap[by][bx] = boxTarget === TILE.GOAL ? TILE.BOX_ON_GOAL : TILE.BOX;
      newMap[ny][nx] = target === TILE.BOX_ON_GOAL ? TILE.GOAL : TILE.EMPTY;
      didPush = true;
    }

    // move player
    const prevTile = newMap[playerPos.y][playerPos.x];
    newMap[playerPos.y][playerPos.x] =
      prevTile === TILE.PLAYER_ON_GOAL ? TILE.GOAL : TILE.EMPTY;

    const destTile = newMap[ny][nx];
    newMap[ny][nx] = destTile === TILE.GOAL ? TILE.PLAYER_ON_GOAL : TILE.PLAYER;

    setMap(newMap);
    setPlayerPos({ x: nx, y: ny });
    setMoves((m) => m + 1);
    if (didPush) setPushes((p) => p + 1);

    // check win
    let stillBox = false;
    for (let y = 0; y < newMap.length && !stillBox; y++) {
      for (let x = 0; x < newMap[y].length; x++) {
        if (newMap[y][x] === TILE.BOX) {
          stillBox = true;
          break;
        }
      }
    }
    if (!stillBox) {
      setSolved(true);
      const seconds = startTime
        ? Math.floor((Date.now() - startTime) / 1000)
        : 0;
      if (onWin) onWin(moves + 1, pushes + (didPush ? 1 : 0), seconds);
    }
  };

  const handleKey = (e) => {
    switch (e.key) {
      case "ArrowUp":
        tryMove(0, -1);
        break;
      case "ArrowDown":
        tryMove(0, 1);
        break;
      case "ArrowLeft":
        tryMove(-1, 0);
        break;
      case "ArrowRight":
        tryMove(1, 0);
        break;
      case "r":
      case "R":
        // restart
        if (mapData) {
          const converted = convertMapFromAPI(mapData);
          setMap(converted);
          setMoves(0);
          setPushes(0);
          setSolved(false);
          historyRef.current = [];
          setStartTime(Date.now());
          // find player pos
          for (let y = 0; y < converted.length; y++)
            for (let x = 0; x < converted[y].length; x++)
              if (
                converted[y][x] === TILE.PLAYER ||
                converted[y][x] === TILE.PLAYER_ON_GOAL
              )
                setPlayerPos({ x, y });
        }
        break;
      case "u":
      case "U":
        // undo
        const prev = historyRef.current.pop();
        if (prev) {
          setMap(prev.map.map((r) => r.slice()));
          setPlayerPos(prev.playerPos);
          setMoves(prev.moves);
          setPushes(prev.pushes);
          setStartTime(prev.startTime);
          setSolved(prev.solved);
        }
        break;
      default:
        return;
    }
    e.preventDefault();
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, playerPos, moves, pushes, startTime, solved]);

  if (!map || map.length === 0) return <div>No map</div>;

  const cols = map[0].length;

  const tileClass = (tile) => {
    switch (tile) {
      case TILE.WALL:
        return "bg-gray-700";
      case TILE.EMPTY:
        return "bg-gray-100";
      case TILE.PLAYER:
        return "bg-blue-500";
      case TILE.BOX:
        return "bg-yellow-500";
      case TILE.GOAL:
        return "bg-green-200";
      case TILE.BOX_ON_GOAL:
        return "bg-yellow-500 ring-2 ring-green-400";
      case TILE.PLAYER_ON_GOAL:
        return "bg-blue-500 ring-2 ring-green-400";
      default:
        return "bg-gray-100";
    }
  };

  return (
    <div>
      <div className="mb-3 text-sm text-gray-700">
        Moves: {moves} — Pushes: {pushes}
      </div>
      <div
        className="inline-block"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 48px)`,
        }}
      >
        {map.map((row, y) =>
          row.map((tile, x) => (
            <div
              key={`${x}-${y}`}
              className={`w-12 h-12 border flex items-center justify-center ${tileClass(tile)}`}
            ></div>
          )),
        )}
      </div>
    </div>
  );
}
