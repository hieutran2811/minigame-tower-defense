import { describe, expect, it } from 'vitest';
import { COLS, HEIGHT, ROWS, TILE, WIDTH } from '../config/gameConfig';
import { PATH_TILES } from '../data/map';
import { PathFollower } from '../systems/PathFollower';

describe('Milestone 1 map', () => {
  it('fits a 12 by 8 map of 64px tiles inside the 960 by 640 canvas', () => {
    expect({ COLS, ROWS, TILE, WIDTH, HEIGHT }).toEqual({
      COLS: 12,
      ROWS: 8,
      TILE: 64,
      WIDTH: 960,
      HEIGHT: 640,
    });
    expect(COLS * TILE).toBeLessThan(WIDTH);
    expect(ROWS * TILE).toBeLessThanOrEqual(HEIGHT);
  });

  it('keeps every path tile on the map', () => {
    expect(PATH_TILES.length).toBeGreaterThanOrEqual(2);

    for (const point of PATH_TILES) {
      expect(Number.isInteger(point.x)).toBe(true);
      expect(Number.isInteger(point.y)).toBe(true);
      expect(point.x).toBeGreaterThanOrEqual(0);
      expect(point.x).toBeLessThan(COLS);
      expect(point.y).toBeGreaterThanOrEqual(0);
      expect(point.y).toBeLessThan(ROWS);
    }
  });

  it('connects neighboring tiles without diagonal steps or gaps', () => {
    for (let index = 1; index < PATH_TILES.length; index++) {
      const previous = PATH_TILES[index - 1];
      const current = PATH_TILES[index];
      const distance =
        Math.abs(current.x - previous.x) + Math.abs(current.y - previous.y);

      expect(distance).toBe(1);
    }
  });

  it('moves through the actual path centers and can start again after finishing', () => {
    const waypoints = PATH_TILES.map((point) => ({
      x: (point.x + 0.5) * TILE,
      y: (point.y + 0.5) * TILE,
    }));

    // Repeat the follower lifecycle used by the scene when an enemy finishes.
    for (let lap = 0; lap < 2; lap++) {
      const follower = new PathFollower(waypoints, TILE);
      expect(follower.position).toEqual(waypoints[0]);

      for (let index = 1; index < waypoints.length; index++) {
        const previous = waypoints[index - 1];
        const target = waypoints[index];

        follower.update(0.5);
        expect(follower.position).toEqual({
          x: (previous.x + target.x) / 2,
          y: (previous.y + target.y) / 2,
        });

        follower.update(0.5);
        expect(follower.position).toEqual(target);
        expect(follower.finished).toBe(index === waypoints.length - 1);
      }
    }
  });
});
