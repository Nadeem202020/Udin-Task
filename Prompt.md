# Prompt.md — AI Usage Log

## Tool Used
**Claude AI** was used throughout this project to assist with planning, architecture, and code generation.

---

## Prompt 1 — Task Analysis

**Prompt:**
> I have applied for a software engineer position at a software house called Udin, and they have sent me a task document, analyze it and tell me exactly what to do step by step.

**Reply Summary:**

### General Setup
1. Create a GitHub repository to host all code
2. Add a `Prompt.md` file — log every AI prompt used
3. Add a `Readme.md` — explain methodology and challenges
4. Install a screen recording tool (OBS, Loom, etc.) — needed for all 3 tasks

---

### Task 1 — Sokoban Game Clone
Build a classic Sokoban puzzle game with these rules:
- Player moves in all 4 directions (up, down, left, right)
- Blocks can be pushed only (not pulled)
- Only one block can be pushed at a time

**Deliverables:**
- Working game code in the repo
- A screencast showing the game fully running
- A written reflection covering:
  - How AI helped build it
  - Where AI fell short or made mistakes
  - The exact prompts used (goes in `Prompt.md`)

---

### Task 2 — Multi-User Platform (extends Task 1)
Upgrade the Sokoban game into a full web platform:
- User registration & login system
- 3 roles: Anonymous, Player, and Admin
- Admins can create new puzzles/levels
- Scores are stored per user
- A leaderboard is shown on the landing page

**Deliverables:**
- Updated code in the same repo
- A screencast demonstrating the full system (login, play, leaderboard, admin creating a level)
- Written reflection + prompts (same as Task 1)

---

### Task 3 — Multiplayer Button-Tapping Game
Build a real-time multiplayer game where:
- Multiple players tap a keyboard button as fast as possible
- The sprint lasts exactly 15 seconds
- The player with the most taps wins
- The start time must be synchronized fairly across players in different geographic locations (server-side clock, not client-side)

**Deliverables:**
- Code in the repo
- A screencast showing it working with multiple players
- An explanation of how the code works, especially the sync logic

---

### Summary Checklist

| Item | Details |
|---|---|
| GitHub Repo | All 3 tasks' code |
| `Prompt.md` | Every AI prompt used across all tasks |
| `Readme.md` | Challenges & methodology |
| Screencast x3 | One per task, showing full functionality |

**Recommended approach:**
1. Start with Task 1 (standalone, no backend needed)
2. Build Task 2 on top of it (add auth + DB + roles)
3. Do Task 3 separately (it's an independent app)

---

## Prompt 2 — README Generation

**Prompt:**
> Create a detailed readme file for each task to give to GitHub Copilot integrated inside VSCode to implement what is needed in each task.
>
> - **Task 1 Stack:** HTML5 (game canvas / DOM grid rendering), CSS3 (styling, grid layout, animations), Vanilla JavaScript ES6+ (game logic, keyboard input, state management)
> - **Task 2 Stack:** Frontend — React (Vite) + Tailwind CSS, Backend — Node.js + Express, Auth — JWT + bcrypt
> - **Task 3 Stack:** Frontend — React (Vite), Backend — Node.js + Express, Real-time — Socket.io (WebSockets), Time Sync — Server-side NTP-style clock authority, Styling — Tailwind CSS

**Reply Summary:**

Three detailed README files were generated:

**TASK1_README.md — Sokoban Game**
- Full tile map format with numeric codes
- Complete `game.js` state object and all function signatures
- Exact keyboard event handler code
- HTML layout structure and CSS class names
- All 5 edge cases (push into wall, push two boxes, win condition, etc.)

**TASK2_README.md — Multi-User Platform**
- Full database schema (SQLite) with all 3 tables
- Every API endpoint with request/response JSON examples
- JWT middleware and role-guard middleware code
- All 7 React pages fully described
- Step-by-step phased implementation plan (Backend → Frontend → Integration)

**TASK3_README.md — Multiplayer Tap Game**
- Full explanation of the fairness problem and the NTP-style clock sync solution
- `timeSync.js` utility with the RTT offset formula
- All Socket.io events (server→client and client→server) in a table
- Server-side tap validation logic (anti-cheat)
- Step-by-step instructions for testing fairness with browser network throttling

**How to use with Copilot:**
1. Place each README in the root of its respective project folder
2. Open the folder in VSCode
3. Open Copilot Chat and say: *"Follow the README.md and implement this project step by step"*
4. Work phase by phase as described in each file's Implementation Steps section

---

## Prompt 3 — Copilot Prompt Generation

**Prompt:**
> Give me the prompt for each to give to Copilot along with the readme file.

**Reply Summary:**

A `COPILOT_PROMPTS.md` file was generated containing sequential prompts for each task.

**How to use:**
1. Create a new folder per task (e.g. `task1-sokoban/`)
2. Drop the corresponding `TASKX_README.md` inside it and rename it to `README.md`
3. Open the folder in VSCode
4. Open Copilot Chat (`Ctrl+Shift+I`)
5. Run the prompts in order — each task has numbered prompts that build on each other. Never skip ahead.

**Prompt breakdown per task:**

| Task | Prompts | What They Cover |
|---|---|---|
| Task 1 (Sokoban) | 6 prompts | Scaffold → Levels → Logic → HTML → CSS → Bug Fix |
| Task 2 (Platform) | 8 prompts | DB → Auth → API → React setup → Pages → Game port → Admin panel → Wiring |
| Task 3 (Tap game) | 8 prompts | Server → Rooms → Game loop → Clock sync → Lobby → Game → Results → Fairness check |

> **Important:** Always start each prompt with the README open so Copilot has full context.
> If Copilot loses context midway, prepend *"Re-read README.md first, then..."* to your next prompt.
