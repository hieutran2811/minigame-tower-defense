import { describe, expect, it } from 'vitest';
import { COLS, ROWS, TILE } from '../config/gameConfig';
import { ENEMY_TYPES } from '../config/enemyConfig';
import { WAVE_COUNTS } from '../config/waveConfig';
import { LEVELS } from '../data/levels';
import { PATH_TILES } from '../data/map';
import { PathFollower } from '../systems/PathFollower';
import { TowerPlacement } from '../systems/TowerPlacement';

describe('Campaign level data', () => {
  it('preserves the original map in chapter one', () => {
    expect(LEVELS[0].path).toEqual(PATH_TILES);
  });

  it('provides three distinct chapters and paths for the level menu', () => {
    expect(LEVELS).toHaveLength(3);
    expect(new Set(LEVELS.map((level) => level.id)).size).toBe(3);
    expect(new Set(LEVELS.map((level) => JSON.stringify(level.path))).size).toBe(3);
  });

  it('keeps Border Watch entirely basic for the original match', () => {
    expect(LEVELS[0].waves.flat().every((kind) => kind === 'basic')).toBe(true);
  });

  it('introduces runners before guards in Whispering Grove', () => {
    expect(LEVELS[1].waves[0]).toContain('runner');
    expect(LEVELS[1].waves[0]).not.toContain('guard');
    expect(LEVELS[1].waves.slice(1).flat()).toContain('guard');
  });

  it('mixes all three enemy kinds in Dawn Keep', () => {
    expect(new Set(LEVELS[2].waves.flat())).toEqual(new Set(Object.keys(ENEMY_TYPES)));
  });

  for (const level of LEVELS) {
    describe(level.title, () => {
      it('keeps exact wave counts and valid enemy kinds', () => {
        expect(level.waves.map((wave) => wave.length)).toEqual(WAVE_COUNTS);
        for (const kind of level.waves.flat()) {
          expect(ENEMY_TYPES[kind]).toBeDefined();
        }
      });

      it('keeps a continuous, non-repeating orthogonal path inside the map', () => {
        expect(level.path.length).toBeGreaterThan(1);
        const cells = new Set(level.path.map((point) => `${point.x},${point.y}`));
        expect(cells.size).toBe(level.path.length);
        expect(level.path[0].x).toBe(0);
        expect(level.path[level.path.length - 1].x).toBe(COLS - 1);

        level.path.forEach((point, index) => {
          expect(Number.isInteger(point.x) && Number.isInteger(point.y)).toBe(true);
          expect(point.x).toBeGreaterThanOrEqual(0);
          expect(point.x).toBeLessThan(COLS);
          expect(point.y).toBeGreaterThanOrEqual(0);
          expect(point.y).toBeLessThan(ROWS);

          if (index > 0) {
            const previous = level.path[index - 1];
            expect(Math.abs(point.x - previous.x) + Math.abs(point.y - previous.y)).toBe(1);
          }
        });
      });

      it('builds on grass while rejecting the selected map path', () => {
        const placement = new TowerPlacement(COLS, ROWS, level.path);
        const path = new Set(level.path.map((point) => `${point.x},${point.y}`));

        for (let y = 0; y < ROWS; y++) {
          for (let x = 0; x < COLS; x++) {
            const isPath = path.has(`${x},${y}`);
            expect(placement.getStatus({ x, y })).toBe(isPath ? 'path' : 'available');
            expect(placement.place({ x, y })).toBe(!isPath);
          }
        }

        expect(placement.count).toBe(COLS * ROWS - level.path.length);
      });

      it('moves along actual tile centers without cutting corners', () => {
        const points = level.path.map(({ x, y }) => ({
          x: (x + 0.5) * TILE,
          y: (y + 0.5) * TILE,
        }));
        const follower = new PathFollower(points, TILE);

        for (let index = 1; index < points.length; index++) {
          follower.update(0.5);
          expect(follower.position).toEqual({
            x: (points[index - 1].x + points[index].x) / 2,
            y: (points[index - 1].y + points[index].y) / 2,
          });
          follower.update(0.5);
          expect(follower.position).toEqual(points[index]);
          expect(follower.finished).toBe(index === points.length - 1);
        }

        expect(follower.distanceTraveled).toBe((points.length - 1) * TILE);
      });
    });
  }
});
