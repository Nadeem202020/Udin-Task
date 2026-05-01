# Task 1 — Sokoban Game Clone

## Overview
Build a fully functional **Sokoban puzzle game** that runs in the browser. Sokoban is a classic
puzzle game where a player pushes boxes onto goal tiles inside a warehouse. This task uses
**vanilla HTML, CSS, and JavaScript** (no frameworks required).

---

## Tech Stack
- **HTML5** — Game canvas / DOM grid rendering
- **CSS3** — Styling, grid layout, animations
- **Vanilla JavaScript (ES6+)** — Game logic, keyboard input, state management
- No build tools required — must run by opening `index.html` in a browser

---

## Project Structure
```
task1-sokoban/
├── index.html          # Main HTML entry point
├── style.css           # All game styling
├── game.js             # Core game logic
├── levels.js           # Level definitions (maps)
├── assets/
│   ├── player.png      # Player sprite (or use emoji/CSS)
│   ├── box.png         # Box sprite
│   ├── goal.png        # Goal tile sprite
│   └── wall.png        # Wall tile sprite
└── README.md
```

---

## Game Rules (Implement Exactly)
1. The **player can move** in all 4 directions: **Up, Down, Left, Right**
2. When the player moves into a box, the box is **pushed** in the same direction
3. A box **cannot be pulled** — only pushed
4. **Only one box can be pushed at a time** — if two boxes are adjacent, the push is blocked
5. A box **cannot be pushed into a wall**
6. The level is **complete** when all boxes are on goal tiles
7. The player **cannot walk through walls**

---

## Grid / Map Format
Define levels as 2D arrays using these tile codes:

```javascript
// levels.js
const TILE = {
  EMPTY:       0,  // walkable floor
  WALL:        1,  // solid wall
  PLAYER:      2,  // player start position
  BOX:         3,  // movable box
  GOAL:        4,  // target/goal tile
  BOX_ON_GOAL: 5,  // box already placed on a goal
  PLAYER_ON_GOAL: 6 // player standing on a goal tile
};

const LEVELS = [
  {
    id: 1,
    name: "Level 1 — Tutorial",
    map: [
      [1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 1],
      [1, 0, 2, 3, 4, 0, 1],
      [1, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1],
    ]
  },
  {
    id: 2,
    name: "Level 2 — Two Boxes",
    map: [
      [1, 1, 1, 1, 1, 1, 1],
      [1, 0, 4, 0, 4, 0, 1],
      [1, 0, 3, 2, 3, 0, 1],
      [1, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1],
    ]
  }
  // Add at least 3 more progressively harder levels
];
```

---

## Core Game Logic (`game.js`)

### State Object
```javascript
let state = {
  level: 0,           // current level index
  map: [],            // deep copy of current level map (2D array)
  playerPos: { x, y },// current player position
  moves: 0,           // move counter
  pushes: 0,          // push counter
  startTime: null,    // Date.now() when level starts
  solved: false       // whether the current level is complete
};
```

### Functions to Implement

#### `loadLevel(levelIndex)`
- Deep-copy the level map from `LEVELS[levelIndex]`
- Scan the map to find the player's starting position
- Reset moves, pushes, startTime, solved
- Call `render()`

#### `movePlayer(dx, dy)`
- `dx` and `dy` are each `-1`, `0`, or `1` (direction deltas)
- Calculate `newX = playerPos.x + dx`, `newY = playerPos.y + dy`
- If `newX/newY` is a wall → do nothing
- If `newX/newY` is a box or box-on-goal:
  - Calculate `boxNewX = newX + dx`, `boxNewY = newY + dy`
  - If `boxNewX/boxNewY` is a wall OR another box → do nothing (blocked)
  - Otherwise: move box to `(boxNewX, boxNewY)`, update its tile
  - Increment `pushes`
- Update player tile at old and new position
- Update `playerPos`
- Increment `moves`
- Call `checkWin()`
- Call `render()`

#### `checkWin()`
- Iterate over the entire map
- If NO tile equals `BOX` (i.e., all boxes are on goals) → set `solved = true`
- Show a win message with moves and time taken

#### `render()`
- Clear the game board DOM element
- Iterate over `state.map` 2D array
- For each tile, create a `<div>` with the correct CSS class
- Append all divs into the grid container

#### `undoMove()` *(optional but recommended)*
- Keep a history stack of previous states
- On undo, pop the last state and restore it

---

## Keyboard Controls
```javascript
document.addEventListener('keydown', (e) => {
  switch(e.key) {
    case 'ArrowUp':    movePlayer(0, -1); break;
    case 'ArrowDown':  movePlayer(0,  1); break;
    case 'ArrowLeft':  movePlayer(-1, 0); break;
    case 'ArrowRight': movePlayer( 1, 0); break;
    case 'r': case 'R': loadLevel(state.level); break; // restart
    case 'u': case 'U': undoMove(); break;             // undo
  }
  e.preventDefault();
});
```

---

## UI Requirements

### Game Screen Layout
```
+---------------------------------------------+
|         SOKOBAN                             |
|  Level: 1 — Tutorial                        |
+---------------------------------------------+
|                                             |
|         [ GAME GRID HERE ]                  |
|                                             |
+---------------------------------------------+
|  Moves: 12    Pushes: 3    Time: 00:42      |
|  [Restart]  [Undo]  [Next Level]            |
+---------------------------------------------+
```

### CSS Classes for Tiles
```css
.tile           { width: 64px; height: 64px; display: inline-block; }
.tile-wall      { background: #555; border: 2px solid #333; }
.tile-empty     { background: #f5deb3; }
.tile-player    { background: url('assets/player.png') center/cover; }
.tile-box       { background: url('assets/box.png') center/cover; border-radius: 4px; }
.tile-goal      { background: radial-gradient(circle, #f00 20%, transparent 21%); }
.tile-box-goal  { background: url('assets/box.png') center/cover; filter: hue-rotate(90deg); }
```

### Win Screen
- Display overlay with: "🎉 Level Complete!", moves count, pushes count, time taken
- Button: "Next Level" → calls `loadLevel(state.level + 1)`
- If no more levels → show "You beat all levels!"

### Level Selector
- Show a simple level select screen on load
- Display each level as a card with level number and name

---

## Implementation Steps for Copilot

Follow these steps **in order**:

1. **Create `index.html`** with:
   - A `<div id="game-board">` for the grid
   - A stats bar `<div id="stats">`
   - A win overlay `<div id="win-screen" hidden>`
   - Link to `style.css`, `levels.js`, `game.js`

2. **Create `levels.js`** with at least 5 levels of increasing difficulty using the tile format above

3. **Create `style.css`** with:
   - CSS grid layout for the board (columns auto-calculated from map width)
   - Tile styles for all 7 tile types
   - Responsive design (works on 1024px+ screens)
   - Smooth transition animations on player/box moves

4. **Create `game.js`** with:
   - The `state` object
   - `loadLevel(index)` function
   - `movePlayer(dx, dy)` function with full push and collision logic
   - `checkWin()` function
   - `render()` function
   - Keyboard event listener
   - Timer using `setInterval` to update the UI every second
   - Move and push counters updating on every move

5. **Test all edge cases:**
   - Player cannot walk into wall
   - Player cannot push box into wall
   - Player cannot push two boxes at once
   - Box stays on goal tile when pushed there
   - Win condition triggers only when ALL boxes are on goals

---

## Edge Cases to Handle
| Scenario | Expected Behaviour |
|---|---|
| Push box into wall | Move blocked, nothing happens |
| Push box into another box | Move blocked, nothing happens |
| Player walks on empty goal | Player sprite changes to show they're on a goal |
| Box pushed onto goal | Show box-on-goal sprite |
| Box pushed off a goal | Revert to normal box sprite |
| All boxes on goals | Trigger win screen |
| Last level completed | Show "All levels complete" screen |

---

## Deliverables Checklist
- [ ] `index.html` loads and shows the game
- [ ] Player moves in all 4 directions with arrow keys
- [ ] Boxes push correctly, one at a time
- [ ] Boxes cannot be pulled
- [ ] Win condition works correctly
- [ ] At least 5 levels defined
- [ ] Move and push counters visible
- [ ] Timer visible
- [ ] Restart (R key) works
- [ ] Level selector screen
- [ ] No console errors
