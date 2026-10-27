import type { Point } from '../data/map';

export class PathFollower {
  private index = 0;
  readonly position: Point;

  constructor(
    private readonly waypoints: readonly Point[],
    private readonly speed: number,
  ) {
    if (waypoints.length < 2 || speed <= 0) {
      throw new Error('Invalid path or speed');
    }

    this.position = { ...waypoints[0] };
  }

  get finished(): boolean {
    return this.index >= this.waypoints.length - 1;
  }

  update(deltaSeconds: number): void {
    let remaining = Math.max(0, deltaSeconds) * this.speed;

    while (remaining > 0 && !this.finished) {
      const target = this.waypoints[this.index + 1];
      const dx = target.x - this.position.x;
      const dy = target.y - this.position.y;
      const distance = Math.hypot(dx, dy);

      if (distance <= remaining) {
        this.position.x = target.x;
        this.position.y = target.y;
        remaining -= distance;
        this.index++;
      } else {
        this.position.x += (dx / distance) * remaining;
        this.position.y += (dy / distance) * remaining;
        remaining = 0;
      }
    }
  }
}
