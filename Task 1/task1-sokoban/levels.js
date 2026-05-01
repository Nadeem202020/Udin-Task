// Level definitions and tile constants for the Sokoban browser game project.

const TILE = {
	EMPTY: 0, // walkable floor
	WALL: 1, // solid wall
	PLAYER: 2, // player start position
	BOX: 3, // movable box
	GOAL: 4, // target/goal tile
	BOX_ON_GOAL: 5, // box already placed on a goal
	PLAYER_ON_GOAL: 6 // player standing on a goal tile
};

const LEVELS = [
	{
		id: 1,
		name: "Level 1 - Tutorial",
		map: [
			[1, 1, 1, 1, 1, 1, 1],
			[1, 0, 0, 0, 0, 0, 1],
			[1, 0, 2, 3, 4, 0, 1],
			[1, 0, 0, 0, 0, 0, 1],
			[1, 1, 1, 1, 1, 1, 1]
		]
	},
	{
		id: 2,
		name: "Level 2 - Two Boxes",
		map: [
			[1, 1, 1, 1, 1, 1, 1],
			[1, 0, 4, 0, 4, 0, 1],
			[1, 0, 3, 2, 3, 0, 1],
			[1, 0, 0, 0, 0, 0, 1],
			[1, 1, 1, 1, 1, 1, 1]
		]
	},
	{
		id: 3,
		name: "Level 3 - Corridor Setup",
		map: [
			[1, 1, 1, 1, 1, 1, 1, 1, 1],
			[1, 0, 0, 0, 0, 0, 0, 0, 1],
			[1, 0, 4, 0, 3, 0, 4, 0, 1],
			[1, 0, 0, 1, 0, 1, 0, 0, 1],
			[1, 0, 0, 0, 2, 0, 0, 0, 1],
			[1, 0, 0, 0, 3, 0, 0, 0, 1],
			[1, 1, 1, 1, 1, 1, 1, 1, 1]
		]
	},
	{
		id: 4,
		name: "Level 4 - Split Lanes",
		map: [
			[1, 1, 1, 1, 1, 1, 1, 1, 1],
			[1, 0, 0, 4, 0, 4, 0, 0, 1],
			[1, 0, 3, 0, 3, 0, 0, 0, 1],
			[1, 0, 0, 1, 0, 1, 0, 0, 1],
			[1, 0, 0, 0, 2, 0, 0, 0, 1],
			[1, 0, 0, 0, 0, 0, 0, 0, 1],
			[1, 1, 1, 1, 1, 1, 1, 1, 1]
		]
	},
	{
		id: 5,
		name: "Level 5 - Warehouse Shuffle",
		map: [
			[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
			[1, 0, 0, 0, 4, 0, 4, 0, 0, 0, 1],
			[1, 0, 3, 1, 0, 1, 0, 1, 3, 0, 1],
			[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
			[1, 0, 1, 0, 3, 2, 0, 0, 1, 0, 1],
			[1, 0, 0, 0, 0, 1, 0, 0, 0, 4, 1],
			[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
			[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
		]
	}
];

window.TILE = TILE;
window.LEVELS = LEVELS;
