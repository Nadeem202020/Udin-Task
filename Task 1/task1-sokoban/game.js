// Core game logic for the Sokoban browser game project.

let state = {
  level: 0, // current level index
  map: [], // deep copy of current level map (2D array)
  playerPos: { x: 0, y: 0 }, // current player position
  moves: 0, // move counter
  pushes: 0, // push counter
  startTime: null, // Date.now() when level starts
  solved: false, // whether the current level is complete
};

let historyStack = [];
let timerId = null;

function updateStatsDisplay() {
  const stats = document.getElementById("stats");
  if (!stats) return;
  const seconds = state.startTime
    ? Math.floor((Date.now() - state.startTime) / 1000)
    : 0;
  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  stats.textContent = `Moves: ${state.moves}    Pushes: ${state.pushes}    Time: ${mins}:${secs}`;
}

function loadLevel(levelIndex) {
  if (!Array.isArray(window.LEVELS) || !window.LEVELS[levelIndex]) {
    return;
  }

  state.level = levelIndex;
  state.map = window.LEVELS[levelIndex].map.map((row) => row.slice());
  state.playerPos = { x: 0, y: 0 };

  for (let y = 0; y < state.map.length; y += 1) {
    for (let x = 0; x < state.map[y].length; x += 1) {
      if (
        state.map[y][x] === window.TILE.PLAYER ||
        state.map[y][x] === window.TILE.PLAYER_ON_GOAL
      ) {
        state.playerPos = { x, y };
      }
    }
  }

  state.moves = 0;
  state.pushes = 0;
  state.startTime = Date.now();
  state.solved = false;
  historyStack = [];

  // UI visibility: hide level select and show game screen if present
  const levelSelect = document.getElementById("level-select");
  const gameScreen = document.getElementById("game-screen");
  const levelNameEl = document.getElementById("level-name");
  if (levelSelect) levelSelect.hidden = true;
  if (gameScreen) gameScreen.hidden = false;
  if (levelNameEl && window.LEVELS && window.LEVELS[levelIndex]) {
    levelNameEl.textContent = `Level: ${window.LEVELS[levelIndex].name}`;
  }

  // clear any existing timer and start a new one to update the UI timer every second
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
  timerId = setInterval(() => updateStatsDisplay(), 1000);

  render();
}

/**
 * Loads a level map into game state, finds player position, resets counters, and renders the board.
 */
function render() {
  const board = document.getElementById("game-board");
  if (!board || !Array.isArray(state.map) || state.map.length === 0) {
    return;
  }

  board.innerHTML = "";
  board.style.display = "grid";
  board.style.gridTemplateColumns = `repeat(${state.map[0].length}, 64px)`;

  for (let y = 0; y < state.map.length; y += 1) {
    for (let x = 0; x < state.map[y].length; x += 1) {
      const tile = state.map[y][x];
      const cell = document.createElement("div");
      cell.classList.add("tile");

      if (tile === window.TILE.WALL) {
        cell.classList.add("tile-wall");
      } else if (tile === window.TILE.EMPTY) {
        cell.classList.add("tile-empty");
      } else if (tile === window.TILE.PLAYER) {
        cell.classList.add("tile-player");
      } else if (tile === window.TILE.BOX) {
        cell.classList.add("tile-box");
      } else if (tile === window.TILE.GOAL) {
        cell.classList.add("tile-goal");
      } else if (tile === window.TILE.BOX_ON_GOAL) {
        cell.classList.add("tile-box-goal");
      } else if (tile === window.TILE.PLAYER_ON_GOAL) {
        cell.classList.add("tile-player", "tile-goal");
      }

      board.appendChild(cell);
    }
  }

  const stats = document.getElementById("stats");
  if (stats) {
    updateStatsDisplay();
  }
}

/**
 * Renders the current map as a DOM grid and updates basic UI stats.
 */
function movePlayer(dx, dy) {
  if (state.solved) {
    return;
  }

  const newX = state.playerPos.x + dx;
  const newY = state.playerPos.y + dy;
  const targetTile = state.map[newY][newX];

  if (targetTile === window.TILE.WALL) {
    return;
  }

  const snapshot = {
    map: state.map.map((row) => row.slice()),
    playerPos: { x: state.playerPos.x, y: state.playerPos.y },
    moves: state.moves,
    pushes: state.pushes,
    startTime: state.startTime,
    solved: state.solved,
  };

  let didPush = false;

  if (
    targetTile === window.TILE.BOX ||
    targetTile === window.TILE.BOX_ON_GOAL
  ) {
    const boxNewX = newX + dx;
    const boxNewY = newY + dy;
    const boxTargetTile = state.map[boxNewY][boxNewX];

    if (
      boxTargetTile === window.TILE.WALL ||
      boxTargetTile === window.TILE.BOX ||
      boxTargetTile === window.TILE.BOX_ON_GOAL
    ) {
      return;
    }

    state.map[boxNewY][boxNewX] =
      boxTargetTile === window.TILE.GOAL
        ? window.TILE.BOX_ON_GOAL
        : window.TILE.BOX;

    state.map[newY][newX] =
      targetTile === window.TILE.BOX_ON_GOAL
        ? window.TILE.GOAL
        : window.TILE.EMPTY;

    state.pushes += 1;
    didPush = true;
  }

  const previousTile = state.map[state.playerPos.y][state.playerPos.x];
  state.map[state.playerPos.y][state.playerPos.x] =
    previousTile === window.TILE.PLAYER_ON_GOAL
      ? window.TILE.GOAL
      : window.TILE.EMPTY;

  const destinationTile = state.map[newY][newX];
  state.map[newY][newX] =
    destinationTile === window.TILE.GOAL
      ? window.TILE.PLAYER_ON_GOAL
      : window.TILE.PLAYER;

  state.playerPos = { x: newX, y: newY };
  state.moves += 1;

  if (didPush || targetTile !== window.TILE.WALL) {
    historyStack.push(snapshot);
  }

  checkWin();
  render();
}

/**
 * Moves the player by one tile, handles collisions and legal box pushes, and updates tile states.
 */
function checkWin() {
  for (let y = 0; y < state.map.length; y += 1) {
    for (let x = 0; x < state.map[y].length; x += 1) {
      if (state.map[y][x] === window.TILE.BOX) {
        return;
      }
    }
  }

  state.solved = true;
  // stop timer when solved
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }

  const winScreen = document.getElementById("win-screen");
  if (winScreen) {
    const seconds = state.startTime
      ? Math.floor((Date.now() - state.startTime) / 1000)
      : 0;
    const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    // update existing win-screen elements rather than replacing innerHTML
    const titleEl = winScreen.querySelector("h2");
    const statsEl = document.getElementById("win-stats");
    if (titleEl) {
      titleEl.textContent =
        state.level >= window.LEVELS.length - 1
          ? "You beat all levels!"
          : "Level Complete!";
    }
    if (statsEl) {
      statsEl.textContent = `Moves: ${state.moves} | Pushes: ${state.pushes} | Time: ${mins}:${secs}`;
    }
    winScreen.hidden = false;
  }
}

/**
 * Checks whether all boxes are on goals and shows a win overlay when the level is complete.
 */
function undoMove() {
  const previousState = historyStack.pop();
  if (!previousState) {
    return;
  }

  state.map = previousState.map.map((row) => row.slice());
  state.playerPos = {
    x: previousState.playerPos.x,
    y: previousState.playerPos.y,
  };
  state.moves = previousState.moves;
  state.pushes = previousState.pushes;
  state.startTime = previousState.startTime;
  state.solved = previousState.solved;

  const winScreen = document.getElementById("win-screen");
  if (winScreen) {
    winScreen.hidden = true;
  }

  render();
}

/**
 * Restores the most recent previous state from history and re-renders the board.
 */
document.addEventListener("keydown", (e) => {
  let handled = true;

  switch (e.key) {
    case "ArrowUp":
      movePlayer(0, -1);
      break;
    case "ArrowDown":
      movePlayer(0, 1);
      break;
    case "ArrowLeft":
      movePlayer(-1, 0);
      break;
    case "ArrowRight":
      movePlayer(1, 0);
      break;
    case "r":
    case "R":
      loadLevel(state.level);
      break;
    case "u":
    case "U":
      undoMove();
      break;
    default:
      handled = false;
      break;
  }

  if (handled) {
    e.preventDefault();
  }
});
