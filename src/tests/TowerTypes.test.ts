import type Phaser from 'phaser';
import { describe, expect, it, vi } from 'vitest';
import { TOWER_TYPES } from '../config/towerConfig';
import { Projectile } from '../entities/Projectile';
import { Tower } from '../entities/Tower';
import type { CombatTarget } from '../systems/Combat';

// Stub drawing only; use the real entities, targeting, cooldown and projectile motion.
vi.mock('phaser', () => ({
  default: {
    GameObjects: {
      Container: class {
        constructor(public scene: unknown, public x: number, public y: number) {}
        add() { return this; }
        setDepth() { return this; }
      },
    },
    Math: {
      Angle: {
        Between: (x1: number, y1: number, x2: number, y2: number) =>
          Math.atan2(y2 - y1, x2 - x1),
      },
    },
  },
}));

function createScene(): Phaser.Scene {
  const shape = () => ({
    setStrokeStyle() { return this; },
    setAlpha() { return this; },
    setDepth() { return this; },
    setRotation() { return this; },
    setPosition() { return this; },
    destroy() {},
  });
  const graphics = () => ({
    lineStyle() { return this; },
    beginPath() { return this; },
    moveTo() { return this; },
    lineTo() { return this; },
    strokePath() { return this; },
  });
  return {
    add: {
      rectangle: shape,
      polygon: shape,
      graphics,
      container: shape,
      existing() {},
    },
    tweens: { killTweensOf() {}, add() {} },
  } as unknown as Phaser.Scene;
}

function targetAt(x: number, y: number, health = 7, progress = 0): CombatTarget {
  return { position: { x, y }, health, progress };
}

describe('Tower types through entity combat', () => {
  const cases = [
    { kind: 'basic', range: 128, interval: 1, damage: 1 },
    { kind: 'rapid', range: 96, interval: 0.4, damage: 1 },
    { kind: 'longbow', range: 192, interval: 1.5, damage: 2 },
  ] as const;

  for (const { kind, range, interval, damage } of cases) {
    it(`${kind} uses its own range and cadence without queued bursts`, () => {
      const tower = new Tower(createScene(), { x: 0, y: 0 }, kind);
      const target = targetAt(tower.x + range + 0.01, tower.y);

      expect(tower.updateAttack(0, [target])).toBeNull();
      target.position.x = tower.x + range;
      expect(tower.updateAttack(0, [target])).toBe(target);
      expect(tower.updateAttack((interval - 0.01) * 1000, [target])).toBeNull();
      expect(tower.updateAttack(20, [target])).toBe(target);
      expect(tower.updateAttack(10_000, [target])).toBe(target);
      expect(tower.updateAttack(0, [target])).toBeNull();
    });

    it(`${kind} projectiles apply ${damage} damage exactly once`, () => {
      const scene = createScene();
      const tower = new Tower(scene, { x: 0, y: 0 }, kind);
      const target = targetAt(tower.x + range, tower.y);
      const projectile = new Projectile(scene, tower, target, tower.profile);

      expect(projectile.update(1000)).toBe(true);
      expect(target.health).toBe(7 - damage);
      expect(projectile.update(1000)).toBe(true);
      expect(target.health).toBe(7 - damage);
    });
  }

  it('keeps default constructors compatible with the original Basic tower', () => {
    const scene = createScene();
    const tower = new Tower(scene, { x: 0, y: 0 });
    const target = targetAt(tower.x + 100, tower.y, 3);
    expect(tower.kind).toBe('basic');
    expect(tower.profile).toBe(TOWER_TYPES.basic);
    expect(tower.updateAttack(0, [target])).toBe(target);

    new Projectile(scene, tower, target).update(1000);
    expect(target.health).toBe(2);
  });

  it('keeps cooldowns independent between Rapid and Longbow', () => {
    const scene = createScene();
    const rapid = new Tower(scene, { x: 0, y: 0 }, 'rapid');
    const longbow = new Tower(scene, { x: 0, y: 0 }, 'longbow');
    const target = targetAt(rapid.x + 50, rapid.y);
    expect(rapid.updateAttack(0, [target])).toBe(target);
    expect(longbow.updateAttack(0, [target])).toBe(target);
    expect(rapid.updateAttack(400, [target])).toBe(target);
    expect(longbow.updateAttack(400, [target])).toBeNull();
  });

  it('uses path progress and spawn-order ties for each tower kind', () => {
    for (const { kind } of cases) {
      const tower = new Tower(createScene(), { x: 0, y: 0 }, kind);
      const first = targetAt(tower.x + 50, tower.y, 3, 200);
      const tied = targetAt(tower.x + 20, tower.y, 3, 200);
      const behind = targetAt(tower.x + 10, tower.y, 3, 100);
      expect(tower.updateAttack(0, [behind, first, tied])).toBe(first);
    }
  });

  it('keeps Longbow damage on its original living target outside tower range', () => {
    const scene = createScene();
    const tower = new Tower(scene, { x: 0, y: 0 }, 'longbow');
    const original = targetAt(tower.x + 100, tower.y, 7, 100);
    const replacement = targetAt(tower.x + 50, tower.y, 2, 200);
    const projectile = new Projectile(scene, tower, original, tower.profile);
    original.position.x = tower.x + 400;

    expect(tower.updateAttack(0, [original, replacement])).toBe(replacement);
    expect(projectile.update(2000)).toBe(true);
    expect(original.health).toBe(5);
    expect(replacement.health).toBe(2);

    const expired = new Projectile(scene, tower, original, tower.profile);
    original.health = 0;
    expect(expired.update(2000)).toBe(true);
    expect(replacement.health).toBe(2);
  });

  it('clamps a lethal Longbow hit and expires other shots on that target', () => {
    const scene = createScene();
    const tower = new Tower(scene, { x: 0, y: 0 }, 'longbow');
    const target = targetAt(tower.x + 100, tower.y, 1);
    const first = new Projectile(scene, tower, target, tower.profile);
    const second = new Projectile(scene, tower, target, tower.profile);

    expect(first.update(1000)).toBe(true);
    expect(target.health).toBe(0);
    expect(second.update(1000)).toBe(true);
    expect(target.health).toBe(0);
  });
});
