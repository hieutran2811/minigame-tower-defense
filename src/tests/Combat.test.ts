import { describe, expect, it } from 'vitest';
import {
  ENEMY_MAX_HEALTH,
  PROJECTILE_SPEED,
  TOWER_DAMAGE,
  TOWER_FIRE_INTERVAL,
  TOWER_RANGE,
} from '../config/combatConfig';
import {
  isInRange,
  selectTarget,
  ProjectileMotion,
  TowerAttack,
  type CombatTarget,
} from '../systems/Combat';

const origin = { x: 0, y: 0 };
const createTarget = (x = 100, y = 0): CombatTarget => ({
  position: { x, y },
  health: ENEMY_MAX_HEALTH,
  progress: 0,
});

describe('Tower targeting and cooldown', () => {
  it('includes the exact range boundary and excludes points just beyond it', () => {
    expect(isInRange(origin, createTarget(TOWER_RANGE), TOWER_RANGE)).toBe(true);
    expect(
      isInRange(origin, createTarget(TOWER_RANGE + 0.01), TOWER_RANGE),
    ).toBe(false);
    expect(isInRange(origin, createTarget(100, 100), TOWER_RANGE)).toBe(false);
  });

  it('does not target dead enemies', () => {
    const target = createTarget();
    target.health = 0;

    expect(isInRange(origin, target, TOWER_RANGE)).toBe(false);
    expect(new TowerAttack(TOWER_RANGE, 1).update(1, origin, target)).toBe(false);
  });

  it('fires immediately, then waits for a full interval', () => {
    const attack = new TowerAttack(TOWER_RANGE, TOWER_FIRE_INTERVAL);
    const target = createTarget();

    expect(attack.update(0, origin, target)).toBe(true);
    expect(attack.update(0.5, origin, target)).toBe(false);
    expect(attack.update(0.49, origin, target)).toBe(false);
    expect(attack.update(0.02, origin, target)).toBe(true);
    expect(attack.update(0, origin, target)).toBe(false);
  });

  it('does not spend a shot while the target is outside range', () => {
    const attack = new TowerAttack(TOWER_RANGE, TOWER_FIRE_INTERVAL);
    const target = createTarget(200);

    expect(attack.update(1, origin, target)).toBe(false);
    target.position.x = 100;
    expect(attack.update(0, origin, target)).toBe(true);
  });

  it('keeps cooldown when the enemy leaves and quickly reenters range', () => {
    const attack = new TowerAttack(TOWER_RANGE, TOWER_FIRE_INTERVAL);
    const target = createTarget();

    expect(attack.update(0, origin, target)).toBe(true);
    target.position.x = 200;
    expect(attack.update(0.25, origin, target)).toBe(false);
    target.position.x = 100;
    expect(attack.update(0.25, origin, target)).toBe(false);
    expect(attack.update(0.5, origin, target)).toBe(true);
  });

  it('does not queue a burst after a long frame', () => {
    const attack = new TowerAttack(TOWER_RANGE, TOWER_FIRE_INTERVAL);
    const target = createTarget();

    expect(attack.update(10, origin, target)).toBe(true);
    expect(attack.update(0, origin, target)).toBe(false);
  });

  it('does not advance cooldown for negative time', () => {
    const attack = new TowerAttack(TOWER_RANGE, TOWER_FIRE_INTERVAL);
    const target = createTarget();
    attack.update(0, origin, target);

    expect(attack.update(-1, origin, target)).toBe(false);
    expect(attack.update(0.5, origin, target)).toBe(false);
    expect(attack.update(0.5, origin, target)).toBe(true);
  });
});

describe('Projectile motion and damage', () => {
  it('moves by speed and elapsed time without damaging a distant target', () => {
    const target = createTarget();
    const projectile = new ProjectileMotion(origin, target, 20, TOWER_DAMAGE);

    expect(projectile.update(1)).toBe(false);
    expect(projectile.position).toEqual({ x: 20, y: 0 });
    expect(target.health).toBe(3);
    expect(origin).toEqual({ x: 0, y: 0 });
  });

  it('homes toward the latest target position', () => {
    const target = createTarget();
    const projectile = new ProjectileMotion(origin, target, 20, TOWER_DAMAGE);
    projectile.update(1);
    target.position.x = 20;
    target.position.y = 100;

    expect(projectile.update(1)).toBe(false);
    expect(projectile.position).toEqual({ x: 20, y: 20 });
  });

  it('hits at the exact travel distance and applies damage only once', () => {
    const target = createTarget();
    const projectile = new ProjectileMotion(origin, target, 100, TOWER_DAMAGE);

    expect(projectile.update(1)).toBe(true);
    expect(projectile.position).toEqual(target.position);
    expect(target.health).toBe(2);
    expect(projectile.update(100)).toBe(true);
    expect(target.health).toBe(2);
  });

  it('hits instead of overshooting during a long frame', () => {
    const target = createTarget();
    const projectile = new ProjectileMotion(
      origin,
      target,
      PROJECTILE_SPEED,
      TOWER_DAMAGE,
    );

    expect(projectile.update(10)).toBe(true);
    expect(target.health).toBe(2);
  });

  it('kills a full-health enemy with three separate hits', () => {
    const target = createTarget();

    for (let hit = 1; hit <= 3; hit++) {
      const projectile = new ProjectileMotion(
        origin,
        target,
        PROJECTILE_SPEED,
        TOWER_DAMAGE,
      );
      expect(projectile.update(1)).toBe(true);
      expect(target.health).toBe(3 - hit);
    }
  });

  it('never reduces health below zero', () => {
    const target = createTarget();
    target.health = 1;
    const projectile = new ProjectileMotion(origin, target, 100, 10);

    projectile.update(1);

    expect(target.health).toBe(0);
  });

  it('expires without damage when its target dies before impact', () => {
    const target = createTarget();
    const projectile = new ProjectileMotion(origin, target, 20, TOWER_DAMAGE);
    target.health = 0;

    expect(projectile.update(1)).toBe(true);
    expect(projectile.position).toEqual(origin);
    expect(target.health).toBe(0);
  });

  it('does not transfer damage from an expired enemy to its replacement', () => {
    const oldTarget = createTarget();
    const projectile = new ProjectileMotion(origin, oldTarget, 20, TOWER_DAMAGE);
    projectile.update(1);
    oldTarget.health = 0;
    const replacement = createTarget();

    expect(projectile.update(100)).toBe(true);
    expect(replacement.health).toBe(ENEMY_MAX_HEALTH);
  });

  it('ignores zero and negative time while traveling', () => {
    const target = createTarget();
    const projectile = new ProjectileMotion(origin, target, 20, TOWER_DAMAGE);

    expect(projectile.update(0)).toBe(false);
    expect(projectile.update(-1)).toBe(false);
    expect(projectile.position).toEqual(origin);
    expect(target.health).toBe(3);
  });
});

describe('Multiple-enemy targeting', () => {
  it('chooses the in-range enemy with the most path progress', () => {
    const near = { ...createTarget(20), progress: 10 };
    const ahead = { ...createTarget(100), progress: 200 };
    const outOfRange = { ...createTarget(200), progress: 300 };

    expect(selectTarget(origin, [near, ahead, outOfRange], TOWER_RANGE)).toBe(ahead);
  });

  it('ignores dead enemies and keeps spawn order when progress is tied', () => {
    const first = { ...createTarget(50), progress: 100 };
    const second = { ...createTarget(60), progress: 100 };
    const dead = { ...createTarget(40), progress: 200, health: 0 };

    expect(selectTarget(origin, [dead, first, second], TOWER_RANGE)).toBe(first);
  });

  it('returns no target when none are alive in range', () => {
    expect(selectTarget(origin, [], TOWER_RANGE)).toBeNull();
    expect(selectTarget(origin, [createTarget(500)], TOWER_RANGE)).toBeNull();
  });

  it('advances cooldown even while there is no target', () => {
    const attack = new TowerAttack(TOWER_RANGE, TOWER_FIRE_INTERVAL);
    const target = createTarget();

    expect(attack.update(0, origin, target)).toBe(true);
    expect(attack.update(1, origin, null)).toBe(false);
    expect(attack.update(0, origin, target)).toBe(true);
  });

  it('keeps projectiles tied to their original target while another enemy lives', () => {
    const first = createTarget();
    const second = createTarget();
    const projectile = new ProjectileMotion(origin, first, 100, 1);
    first.health = 0;

    expect(projectile.update(1)).toBe(true);
    expect(second.health).toBe(ENEMY_MAX_HEALTH);
  });
});
