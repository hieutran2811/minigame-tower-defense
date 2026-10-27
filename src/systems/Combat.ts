import type { Point } from '../data/map';

export type CombatTarget = {
  readonly position: Point;
  health: number;
};

export function isInRange(
  origin: Point,
  target: CombatTarget,
  range: number,
): boolean {
  const dx = target.position.x - origin.x;
  const dy = target.position.y - origin.y;

  return target.health > 0 && dx * dx + dy * dy <= range * range;
}

export class TowerAttack {
  private cooldown = 0;

  constructor(
    private readonly range: number,
    private readonly interval: number,
  ) {}

  update(deltaSeconds: number, origin: Point, target: CombatTarget): boolean {
    this.cooldown = Math.max(0, this.cooldown - Math.max(0, deltaSeconds));

    if (this.cooldown > 0 || !isInRange(origin, target, this.range)) {
      return false;
    }

    // Fire once per update; a slow frame does not queue a burst of old shots.
    this.cooldown = this.interval;
    return true;
  }
}

export class ProjectileMotion {
  readonly position: Point;
  private finished = false;

  constructor(
    origin: Point,
    private readonly target: CombatTarget,
    private readonly speed: number,
    private readonly damage: number,
  ) {
    this.position = { ...origin };
  }

  update(deltaSeconds: number): boolean {
    if (this.finished) {
      return true;
    }

    if (this.target.health <= 0) {
      this.finished = true;
      return true;
    }

    const dx = this.target.position.x - this.position.x;
    const dy = this.target.position.y - this.position.y;
    const distance = Math.hypot(dx, dy);
    const travel = this.speed * Math.max(0, deltaSeconds);

    if (distance <= travel) {
      this.position.x = this.target.position.x;
      this.position.y = this.target.position.y;
      this.target.health = Math.max(0, this.target.health - this.damage);
      this.finished = true;
    } else if (travel > 0) {
      this.position.x += (dx / distance) * travel;
      this.position.y += (dy / distance) * travel;
    }

    return this.finished;
  }
}
