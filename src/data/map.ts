export type Point = {
  x: number;
  y: number;
};

// Tile coordinates; consecutive tiles share an edge.
export const PATH_TILES: Point[] = [
  { x: 0, y: 3 },
  { x: 1, y: 3 },
  { x: 2, y: 3 },
  { x: 3, y: 3 },
  { x: 3, y: 4 },
  { x: 3, y: 5 },
  { x: 4, y: 5 },
  { x: 5, y: 5 },
  { x: 5, y: 4 },
  { x: 5, y: 3 },
  { x: 5, y: 2 },
  { x: 6, y: 2 },
  { x: 7, y: 2 },
  { x: 8, y: 2 },
  { x: 8, y: 3 },
  { x: 8, y: 4 },
  { x: 9, y: 4 },
  { x: 10, y: 4 },
  { x: 11, y: 4 },
];
