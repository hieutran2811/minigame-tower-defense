import { describe, expect, it } from 'vitest';
import { COLS, ROWS } from '../config/gameConfig';
import { PATH_TILES } from '../data/map';
import { TowerPlacement } from '../systems/TowerPlacement';

describe('TowerPlacement', () => {
  const createPlacement = () => new TowerPlacement(COLS, ROWS, PATH_TILES);

  it('places a tower on grass and marks the tile occupied', () => {
    const placement = createPlacement();
    const tile = { x: 0, y: 0 };

    expect(placement.getStatus(tile)).toBe('available');
    expect(placement.place(tile)).toBe(true);
    expect(placement.getStatus(tile)).toBe('occupied');
    expect(placement.count).toBe(1);
  });

  it('rejects a second tower on the same tile', () => {
    const placement = createPlacement();
    placement.place({ x: 0, y: 0 });

    expect(placement.place({ x: 0, y: 0 })).toBe(false);
    expect(placement.count).toBe(1);
  });

  it('rejects every tile on the enemy path without occupying it', () => {
    const placement = createPlacement();

    for (const tile of PATH_TILES) {
      expect(placement.getStatus(tile)).toBe('path');
      expect(placement.place(tile)).toBe(false);
      expect(placement.getStatus(tile)).toBe('path');
    }

    expect(placement.count).toBe(0);
  });

  it.each([
    { x: -1, y: 0 },
    { x: 0, y: -1 },
    { x: COLS, y: 0 },
    { x: 0, y: ROWS },
    { x: 1.5, y: 0 },
    { x: NaN, y: 0 },
    { x: 0, y: Infinity },
  ])('rejects coordinates outside integer map cells: %j', (tile) => {
    const placement = createPlacement();

    expect(placement.getStatus(tile)).toBe('outside-map');
    expect(placement.place(tile)).toBe(false);
    expect(placement.count).toBe(0);
  });

  it('allows placement on all four grass corners', () => {
    const placement = createPlacement();

    for (const tile of [
      { x: 0, y: 0 },
      { x: COLS - 1, y: 0 },
      { x: 0, y: ROWS - 1 },
      { x: COLS - 1, y: ROWS - 1 },
    ]) {
      expect(placement.place(tile)).toBe(true);
    }

    expect(placement.count).toBe(4);
  });

  it('does not reserve a tile when checking a preview', () => {
    const placement = createPlacement();

    expect(placement.getStatus({ x: 1, y: 0 })).toBe('available');
    expect(placement.getStatus({ x: 1, y: 0 })).toBe('available');
    expect(placement.count).toBe(0);
  });

  it('can fill all grass tiles while preserving the path', () => {
    const placement = createPlacement();
    const originalPath = PATH_TILES.map((tile) => ({ ...tile }));

    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const status = placement.getStatus({ x, y });
        expect(placement.place({ x, y })).toBe(status === 'available');
      }
    }

    expect(placement.count).toBe(COLS * ROWS - PATH_TILES.length);
    expect(PATH_TILES).toEqual(originalPath);
  });

  it('starts a new scene with no occupied tiles', () => {
    const first = createPlacement();
    first.place({ x: 0, y: 0 });

    const second = createPlacement();

    expect(second.count).toBe(0);
    expect(second.getStatus({ x: 0, y: 0 })).toBe('available');
  });
});
