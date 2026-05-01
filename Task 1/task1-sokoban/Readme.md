# Sokoban Game

A classic warehouse puzzle game built with vanilla HTML5, CSS3, and JavaScript. Push boxes onto goal tiles to complete each level. No frameworks, no build tools—just open and play.

## Quick Start

### Option 1: VS Code Live Server (Recommended)

1. Open `index.html` in VS Code
2. Right-click and select **"Open with Live Server"** (requires Live Server extension)
3. The game will open in your default browser

### Option 2: Direct File Open

1. Locate the project folder: `Task 1/task1-sokoban/`
2. Double-click `index.html` to open in your browser
3. The game loads immediately—no server required

### Option 3: Terminal with Python (macOS/Linux)

```bash
cd Task\ 1/task1-sokoban
python3 -m http.server 8000
```

Then navigate to `http://localhost:8000` in your browser.

## How to Play

### Game Rules

- **Push boxes** onto goal tiles (marked with red circles) to complete a level
- **You cannot pull** boxes—only push them
- **One box at a time** can be pushed
- **Boxes cannot go through walls** or other boxes
- Solve all levels to win

### Keyboard Controls

| Key            | Action                                                                 |
| -------------- | ---------------------------------------------------------------------- |
| **Arrow Keys** | Move player (↑ ↓ ← →)                                                  |
| **R**          | Restart current level                                                  |
| **U**          | Undo last move                                                         |
| **Mouse**      | Click level cards to select, click buttons for Restart/Undo/Next Level |

## Features

- **5 progressively harder levels** — from tutorial to warehouse challenges
- **Live move & push counters** — track your performance
- **Real-time timer** — see how fast you can solve
- **Undo system** — rewind mistakes without restarting
- **Level selector** — replay any level anytime
- **Dark warehouse theme** — immersive puzzle-solving atmosphere
- **Responsive design** — works on desktop and tablets (1024px+)

## Browser Compatibility

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Any modern browser with ES6+ support

## Project Structure

```
task1-sokoban/
├── index.html       # Game entry point
├── style.css        # All styling & layout
├── game.js          # Core game engine
├── levels.js        # Level maps & tile definitions
├── assets/          # Sprites (empty for now)
└── Readme.md        # This file
```

## Tips for Solving

1. **Plan ahead** — boxes can get stuck; think two moves ahead
2. **Use Undo** — experiment without fear (press U)
3. **Restart freely** — press R to reset and try a new strategy
4. **Watch the timer** — speedrun for a challenge

## Troubleshooting

**Game won't load?**

- Ensure you have `index.html`, `game.js`, `levels.js`, and `style.css` in the same folder
- Try opening in a different browser
- Check browser console (F12) for error messages

**Timer not updating?**

- Reload the page (Ctrl+R or Cmd+R)

**Undo not working?**

- Undo only works during active gameplay; once you complete a level, the history resets

**Can't push a box?**

- Boxes cannot be pushed into walls or other boxes
- Check that there's empty space or a goal tile on the other side
