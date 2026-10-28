import { describe, expect, it } from 'vitest';
import { PROJECTILE_SPEED, TOWER_DAMAGE, TOWER_RANGE } from '../config/combatConfig';
import { ENEMY_TYPES, type EnemyKind } from '../config/enemyConfig';
import { PathFollower } from '../systems/PathFollower';
import { ProjectileMotion, selectTarget, type CombatTarget } from '../systems/Combat';

function createEnemy(kind: EnemyKind) {
  const profile = ENEMY_TYPES[kind];
  const follower = new PathFollower([{ x: 0, y: 0 }, { x: 1000, y: 0 }], profile.speed);
  const target: CombatTarget = {
    position: follower.position,
    health: profile.maxHealth,
    get progress() {
      return follower.distanceTraveled;
    },
  };

  return { follower, target };
}

describe('Enemy profiles in movement and combat', () => {
  const profiles = [
    { kind: 'basic', speed: 95, hp: 3 },
    { kind: 'runner', speed: 140, hp: 2 },
    { kind: 'guard', speed: 65, hp: 7 },
  ] as const;

  for (const { kind, speed, hp } of profiles) {
    it(`${kind} moves at its configured speed and takes ${hp} basic hits`, () => {
      const { follower, target } = createEnemy(kind);
      follower.update(1);
      expect(target.position).toEqual({ x: speed, y: 0 });
      expect(target.progress).toBe(speed);
      expect(target.health).toBe(hp);

      for (let hit = 1; hit <= hp; hit++) {
        const projectile = new ProjectileMotion(
          { x: 0, y: 0 }, target, PROJECTILE_SPEED, TOWER_DAMAGE,
        );
        expect(projectile.update(1)).toBe(true);
        expect(target.health).toBe(hp - hit);
      }
    });
  }

  it('prioritizes a later runner that overtakes an earlier guard', () => {
    const guard = createEnemy('guard');
    const runner = createEnemy('runner');
    guard.follower.update(1.5);
    runner.follower.update(1);

    expect(selectTarget({ x: 100, y: 0 }, [guard.target, runner.target], TOWER_RANGE))
      .toBe(runner.target);
  });

  it('keeps spawn order when different kinds have equal progress', () => {
    const guard = createEnemy('guard');
    const runner = createEnemy('runner');

    expect(selectTarget({ x: 0, y: 0 }, [guard.target, runner.target], TOWER_RANGE))
      .toBe(guard.target);
  });

  it('keeps a projectile on its original guard after a runner becomes the priority', () => {
    const guard = createEnemy('guard');
    const runner = createEnemy('runner');
    guard.follower.update(1);
    const projectile = new ProjectileMotion(
      { x: 0, y: 0 }, guard.target, PROJECTILE_SPEED, TOWER_DAMAGE,
    );
    runner.follower.update(1.5);

    expect(selectTarget({ x: 100, y: 0 }, [guard.target, runner.target], TOWER_RANGE))
      .toBe(runner.target);
    expect(projectile.update(1)).toBe(true);
    expect(guard.target.health).toBe(6);
    expect(runner.target.health).toBe(2);

    const expired = new ProjectileMotion(
      { x: 0, y: 0 }, guard.target, PROJECTILE_SPEED, TOWER_DAMAGE,
    );
    guard.target.health = 0;
    expect(expired.update(1)).toBe(true);
    expect(runner.target.health).toBe(2);
  });
});
