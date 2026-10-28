import type Phaser from 'phaser';
import { describe, expect, it, vi } from 'vitest';
import { ENEMY_TYPES, type EnemyKind } from '../config/enemyConfig';
import { Enemy } from '../entities/Enemy';

vi.mock('phaser', () => ({ default: {} }));

class DisplayStub {
  scaleX = 1;
  scaleY = 1;
  alpha = 1;
  destroyed = false;

  constructor(
    public x: number,
    public y: number,
    readonly children: DisplayStub[] = [],
  ) {}

  setStrokeStyle() { return this; }
  setOrigin() { return this; }
  setDepth() { return this; }
  setAlpha(alpha: number) { this.alpha = alpha; return this; }
  setPosition(x: number, y: number) { this.x = x; this.y = y; return this; }
  setY(y: number) { this.y = y; return this; }
  setScale(x: number, y: number) { this.scaleX = x; this.scaleY = y; return this; }
  destroy() {
    this.destroyed = true;
    this.children.forEach((child) => child.destroy());
  }
}

function createScene() {
  const containers: DisplayStub[] = [];
  const shape = (x: number, y: number) => new DisplayStub(x, y);
  const tweens = { killTweensOf: vi.fn(), add: vi.fn() };
  const scene = {
    add: {
      rectangle: shape,
      ellipse: shape,
      polygon: shape,
      text: shape,
      container(x: number, y: number, children: DisplayStub[]) {
        const container = new DisplayStub(x, y, children);
        containers.push(container);
        return container;
      },
    },
    tweens,
  } as unknown as Phaser.Scene;
  return { scene, containers, tweens };
}

const path = [{ x: 32, y: 32 }, { x: 160, y: 32 }, { x: 160, y: 224 }];

describe('Enemy presentation keeps combat coordinates stable', () => {
  for (const kind of Object.keys(ENEMY_TYPES) as EnemyKind[]) {
    it(`${kind} moves its root and target together with anchored HP and shadow`, () => {
      const { scene, containers } = createScene();
      const enemy = new Enemy(scene, path, kind);
      const root = containers[1];
      const [shadow, figure, healthBackground, healthBar] = root.children;
      const barY = healthBar.y;
      const shadowY = shadow.y;

      enemy.update(250);

      const distance = ENEMY_TYPES[kind].speed / 4;
      expect(enemy.target.position).toEqual({ x: 32 + distance, y: 32 });
      expect(enemy.target.progress).toBe(distance);
      expect({ x: root.x, y: root.y }).toEqual(enemy.target.position);
      expect(enemy.target.health).toBe(ENEMY_TYPES[kind].maxHealth);
      expect(Math.abs(figure.y)).toBeLessThanOrEqual(1);
      expect(shadow.y).toBe(shadowY);
      expect(healthBackground.y).toBe(barY);
      expect(healthBar.y).toBe(barY);
    });
  }

  it('keeps the Guard HP bar anchored and normalized after damage while walking', () => {
    const { scene, containers, tweens } = createScene();
    const enemy = new Enemy(scene, path, 'guard');
    const healthBar = containers[1].children[3];
    const barY = healthBar.y;
    enemy.update(128);
    enemy.target.health -= 2;

    expect(enemy.refreshHealthBar()).toBe(true);
    expect(healthBar.scaleX).toBe(5 / 7);
    expect(healthBar.scaleY).toBe(1);
    expect(healthBar.y).toBe(barY);
    expect(tweens.add).toHaveBeenCalledOnce();
    expect(enemy.refreshHealthBar()).toBe(false);
  });

  it('keeps exact corner and exit coordinates through long frames', () => {
    const { scene, containers } = createScene();
    const enemy = new Enemy(scene, path, 'runner');
    enemy.update(1000);
    expect(enemy.target.position).toEqual({ x: 160, y: 44 });
    expect(enemy.target.progress).toBe(140);
    expect(enemy.finished).toBe(false);

    enemy.update(2000);
    expect(enemy.target.position).toEqual(path[2]);
    expect(enemy.target.progress).toBe(320);
    expect(enemy.finished).toBe(true);
    expect({ x: containers[1].x, y: containers[1].y }).toEqual(path[2]);
  });

  it('destroys the figure and shadow together and invalidates the original target', () => {
    const { scene, containers, tweens } = createScene();
    const enemy = new Enemy(scene, path, 'guard');
    enemy.target.health--;
    enemy.refreshHealthBar();
    const flash = tweens.add.mock.calls[0][0].targets;

    enemy.destroy();

    expect(enemy.target.health).toBe(0);
    expect(tweens.killTweensOf).toHaveBeenLastCalledWith(flash);
    expect(containers[1].destroyed).toBe(true);
    expect(containers[1].children.every((child) => child.destroyed)).toBe(true);
  });
});
