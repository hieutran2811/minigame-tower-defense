import type { Point } from '../data/map';

export type PlacementStatus = 'available' | 'outside-map' | 'path' | 'occupied';

export class TowerPlacement {
  private readonly pathTiles: Set<string>;
  private readonly occupiedTiles = new Set<string>();

  constructor(
    private readonly cols: number,
    private readonly rows: number,
    path: readonly Point[],
  ) {
    this.pathTiles = new Set(path.map((tile) => this.key(tile)));
  }

  get count(): number {
    return this.occupiedTiles.size;
  }

  getStatus(tile: Point): PlacementStatus {
    if (
      !Number.isInteger(tile.x) ||
      !Number.isInteger(tile.y) ||
      tile.x < 0 ||
      tile.x >= this.cols ||
      tile.y < 0 ||
      tile.y >= this.rows
    ) {
      return 'outside-map';
    }

    const key = this.key(tile);

    if (this.pathTiles.has(key)) {
      return 'path';
    }

    if (this.occupiedTiles.has(key)) {
      return 'occupied';
    }

    return 'available';
  }

  place(tile: Point): boolean {
    if (this.getStatus(tile) !== 'available') {
      return false;
    }

    this.occupiedTiles.add(this.key(tile));
    return true;
  }

  private key(tile: Point): string {
    return `${tile.x},${tile.y}`;
  }
}
