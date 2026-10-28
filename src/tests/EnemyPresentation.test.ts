import type Phaser from 'phaser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ENEMY_TYPES, type EnemyKind } from '../config/enemyConfig';
import { TOWER_TYPES } from '../config/towerConfig';
import goblinAtlas from '../data/art/walk-v2/goblin.atlas.json';
import { ENEMY_ART, ENEMY_ART_FRAMES, ENEMY_DEATH_FRAMES, type EnemyArt } from '../data/artAssets';
import { Enemy } from '../entities/Enemy';
import { createEnemyAnimations, preloadEnemyArt } from '../entities/enemyArt';
import { Projectile } from '../entities/Projectile';

vi.mock('phaser', () => ({ default: { Textures: { FilterMode: { LINEAR: 0 } } } }));

class DisplayStub {
  scaleX = 1;
  scaleY = 1;
  alpha = 1;
  rotation = 0;
  destroyed = false;
  originX = 0.5;
  originY = 0.5;
  displayWidth = 0;
  displayHeight = 0;
  animation = '';
  frame: number | string = 0;
  texture = '';
  anims = { isPlaying: false };
  readonly listeners = new Map<string, () => void>();

  constructor(
    public x: number,
    public y: number,
    readonly children: DisplayStub[] = [],
  ) {}

  setStrokeStyle() { return this; }
  setOrigin(x: number, y = x) { this.originX = x; this.originY = y; return this; }
  setDisplaySize(width: number, height: number) {
    this.displayWidth = width;
    this.displayHeight = height;
    return this;
  }
  play(key: string) { this.animation = key; this.anims.isPlaying = true; return this; }
  stop() { this.anims.isPlaying = false; return this; }
  setFrame(frame: number | string) { this.frame = frame; return this; }
  once(event: string, callback: () => void) { this.listeners.set(event, callback); return this; }
  setDepth() { return this; }
  fillStyle() { return this; }
  fillRect() { return this; }
  setRotation(rotation: number) { this.rotation = rotation; return this; }
  setAlpha(alpha: number) { this.alpha = alpha; return this; }
  setPosition(x: number, y: number) { this.x = x; this.y = y; return this; }
  setY(y: number) { this.y = y; return this; }
  setScale(x: number, y: number) { this.scaleX = x; this.scaleY = y; return this; }
  destroy() {
    this.destroyed = true;
    this.children.forEach((child) => child.destroy());
  }
}

function createScene(artAvailable = false) {
  const containers: DisplayStub[] = [];
  const sprites: DisplayStub[] = [];
  const texts: { text: string; node: DisplayStub }[] = [];
  const shape = (x: number, y: number) => new DisplayStub(x, y);
  const tweens = { killTweensOf: vi.fn(), add: vi.fn() };
  const animations = new Map<string, unknown>();
  const anims = {
    exists: vi.fn((key: string) => animations.has(key)),
    create: vi.fn((config: { key: string }) => animations.set(config.key, config)),
  };
  const texture = { has: vi.fn(() => artAvailable), setFilter: vi.fn() };
  const textures = { exists: vi.fn(() => artAvailable), get: vi.fn(() => texture) };
  const load = { atlas: vi.fn() };
  const scene = {
    add: {
      rectangle: shape,
      ellipse: shape,
      polygon: shape,
      sprite(x: number, y: number, texture: string, frame: number | string = 0) {
        const node = shape(x, y);
        node.texture = texture;
        node.frame = frame;
        sprites.push(node);
        return node;
      },
      text(x: number, y: number, text: string) {
        const node = shape(x, y);
        texts.push({ text, node });
        return node;
      },
      graphics({ x, y }: { x: number; y: number }) { return shape(x, y); },
      container(x: number, y: number, children: DisplayStub[]) {
        const container = new DisplayStub(x, y, children);
        containers.push(container);
        return container;
      },
    },
    tweens,
    anims,
    textures,
    load,
  } as unknown as Phaser.Scene;
  return { scene, containers, sprites, texts, tweens, anims, animations, textures, texture, load };
}

const path = [{ x: 32, y: 32 }, { x: 160, y: 32 }, { x: 160, y: 224 }];

describe('Enemy sprite loading and lifecycle', () => {
  const art: EnemyArt = {
    texture: 'test-goblin', file: '/campaign/assets/enemies/test-goblin.png',
    atlas: goblinAtlas, displaySize: 64, originY: 0.8, stride: 48,
  };
  const original = { ...ENEMY_ART };

  beforeEach(() => {
    ENEMY_ART.basic = art;
    ENEMY_ART.runner = undefined;
    ENEMY_ART.guard = undefined;
  });
  afterEach(() => {
    ENEMY_ART.basic = original.basic;
    ENEMY_ART.runner = original.runner;
    ENEMY_ART.guard = original.guard;
  });

  it('maps all 40 frames exactly once to four directions and death', () => {
    const frames: number[] = Object.values(ENEMY_ART_FRAMES)
      .flatMap(({ idle, walk }) => [idle, ...walk]);
    frames.push(...ENEMY_DEATH_FRAMES);
    expect(frames.sort((a, b) => a - b)).toEqual(Array.from({ length: 40 }, (_, i) => i));
  });

  it('loads declared atlases without duplicating the resolved Vite base URL', () => {
    const { scene, load } = createScene();
    preloadEnemyArt(scene);
    expect(load.atlas).toHaveBeenCalledTimes(1);
    expect(load.atlas).toHaveBeenCalledWith(art.texture, art.file, goblinAtlas);
  });

  it('does not request any image before a reviewed sheet is declared', () => {
    ENEMY_ART.basic = undefined;
    const { scene, load } = createScene();
    preloadEnemyArt(scene);
    expect(load.atlas).not.toHaveBeenCalled();
  });

  it('reuses textures and animation keys through Restart', () => {
    const { scene, load, anims, animations, texture } = createScene(true);
    preloadEnemyArt(scene);
    createEnemyAnimations(scene);
    createEnemyAnimations(scene);
    expect(load.atlas).not.toHaveBeenCalled();
    expect(anims.create).toHaveBeenCalledTimes(5);
    expect(texture.setFilter).toHaveBeenCalledWith(0);
    expect(animations.has('test-goblin:east:walk')).toBe(false);
    expect(animations.get('test-goblin:east:idle')).toEqual({
      key: 'test-goblin:east:idle', frameRate: 1,
      frames: [{ key: art.texture, frame: 33 }],
    });
    expect(animations.get('test-goblin:death')).toEqual({
      key: 'test-goblin:death', frameRate: 10,
      frames: [36, 37, 38, 39].map((frame) => ({ key: art.texture, frame })),
    });
  });

  it('keeps the procedural figure on a failed or incomplete sheet', () => {
    for (const available of [false, true]) {
      const { scene, sprites, anims, texture } = createScene(available);
      texture.has.mockReturnValue(false);
      createEnemyAnimations(scene);
      const enemy = new Enemy(scene, path);
      enemy.update(250);
      expect(anims.create).not.toHaveBeenCalled();
      expect(sprites).toHaveLength(0);
      expect(enemy.target.position).toEqual({ x: 55.75, y: 32 });
      expect(enemy.target.health).toBe(3);
    }
  });

  it('rejects an atlas missing a middle pose even when its last frame exists', () => {
    const { scene, sprites, anims, texture } = createScene(true);
    texture.has.mockImplementation((name?: string) => name !== '10');
    createEnemyAnimations(scene);
    const enemy = new Enemy(scene, path);
    enemy.update(250);
    expect(anims.create).not.toHaveBeenCalled();
    expect(sprites).toHaveLength(0);
    expect(enemy.target.progress).toBe(23.75);
  });

  it('faces the next segment at exact corners and idles at the exit', () => {
    const { scene, sprites, containers } = createScene(true);
    createEnemyAnimations(scene);
    const route = [
      { x: 32, y: 32 }, { x: 127, y: 32 }, { x: 127, y: 127 },
      { x: 32, y: 127 }, { x: 32, y: 32 },
    ];
    const enemy = new Enemy(scene, route);
    const figure = sprites[0];
    expect(figure.animation).toBe('test-goblin:east:idle');
    for (const facing of ['south', 'west', 'north'] as const) {
      enemy.update(1000);
      expect(figure.frame).toBe(ENEMY_ART_FRAMES[facing].walk[7]);
      expect(figure.anims.isPlaying).toBe(false);
      expect(figure.rotation).toBe(0);
      expect(containers[0].y).toBe(0);
      expect(figure.y).toBe(18);
      expect(figure.originY).toBe(0.8);
      expect(figure.displayHeight).toBe(64);
      expect(containers[1].children[3].y).toBe(-36);
    }
    enemy.update(1000);
    expect(figure.animation).toBe('test-goblin:north:idle');
    expect(enemy.finished).toBe(true);
    expect(enemy.target.progress).toBe(380);
    expect(enemy.target.position).toEqual(route[4]);
  });

  it('uses the final segment after crossing multiple corners in one frame', () => {
    const { scene, sprites } = createScene(true);
    createEnemyAnimations(scene);
    const enemy = new Enemy(scene, [
      { x: 32, y: 32 }, { x: 127, y: 32 }, { x: 127, y: 127 }, { x: 32, y: 127 },
    ]);
    enemy.update(2500);
    expect(sprites[0].frame).toBe(31);
    expect(sprites[0].anims.isPlaying).toBe(false);
    expect(enemy.target.position).toEqual({ x: 79.5, y: 127 });
    expect(enemy.target.progress).toBe(237.5);
    enemy.update(0);
    expect(sprites[0].animation).toBe('test-goblin:west:idle');
  });

  for (const kind of Object.keys(ENEMY_TYPES) as EnemyKind[]) {
    it(`preserves ${kind} health, speed and target invalidation with sprite art`, () => {
      ENEMY_ART[kind] = art;
      const { scene, sprites, containers } = createScene(true);
      createEnemyAnimations(scene);
      const enemy = new Enemy(scene, path, kind);
      enemy.update(250);
      expect(enemy.target.progress).toBe(ENEMY_TYPES[kind].speed / 4);
      expect(enemy.target.health).toBe(ENEMY_TYPES[kind].maxHealth);
      expect(sprites[0].frame).toBe({ basic: 11, runner: 13, guard: 10 }[kind]);
      enemy.target.health--;
      enemy.refreshHealthBar();
      expect(containers[1].children[3].scaleX).toBe(
        (ENEMY_TYPES[kind].maxHealth - 1) / ENEMY_TYPES[kind].maxHealth,
      );
      enemy.destroy();
      expect(enemy.target.health).toBe(0);
      expect(sprites[0].destroyed).toBe(true);
    });
  }

  it('lets the death visual finish after the target has been destroyed', () => {
    const { scene, sprites } = createScene(true);
    createEnemyAnimations(scene);
    const enemy = new Enemy(scene, path);
    enemy.target.health = 0;
    enemy.showDeathEffect();
    enemy.destroy();
    expect(enemy.dead).toBe(true);
    expect(sprites[0].destroyed).toBe(true);
    expect(sprites[1].animation).toBe('test-goblin:death');
    expect(sprites[1].destroyed).toBe(false);
    sprites[1].listeners.get('animationcomplete')!();
    expect(sprites[1].destroyed).toBe(true);
  });


  it('visits eight distinct poses and wraps after one full stride', () => {
    ENEMY_ART.basic = { ...art, stride: 95 };
    const { scene, sprites } = createScene(true);
    createEnemyAnimations(scene);
    const enemy = new Enemy(scene, [{ x: 0, y: 0 }, { x: 1000, y: 0 }]);
    const poses = [];
    for (let i = 0; i < 8; i++) {
      enemy.update(125);
      poses.push(sprites[0].frame);
    }
    expect(poses).toEqual([9, 10, 11, 12, 13, 14, 15, 8]);
    expect(enemy.target.progress).toBe(95);
  });

  it('preserves stride phase across idle and different update sizes', () => {
    const { scene, sprites } = createScene(true);
    createEnemyAnimations(scene);
    const route = [
      { x: 0, y: 0 }, { x: 95, y: 0 }, { x: 95, y: 95 }, { x: 0, y: 95 },
    ];
    const longFrame = new Enemy(scene, route);
    const shortFrames = new Enemy(scene, route);
    longFrame.update(2500);
    for (let i = 0; i < 10; i++) shortFrames.update(250);
    expect(sprites[0].frame).toBe(31);
    expect(sprites[1].frame).toBe(31);
    expect(shortFrames.target.position).toEqual(longFrame.target.position);
    shortFrames.update(0);
    expect(sprites[1].animation).toBe('test-goblin:west:idle');
    shortFrames.update(100);
    longFrame.update(100);
    expect(sprites[1].frame).toBe(sprites[0].frame);
    expect(sprites[1].anims.isPlaying).toBe(false);
  });

  it('loads and plays a separately verified death sheet without delaying removal', () => {
    const death = original.guard!.death!;
    ENEMY_ART.basic = { ...art, death };
    const pending = createScene();
    preloadEnemyArt(pending.scene);
    expect(pending.load.atlas).toHaveBeenCalledTimes(2);
    expect(pending.load.atlas).toHaveBeenCalledWith(death.texture, death.file, death.atlas);

    const { scene, sprites, animations } = createScene(true);
    createEnemyAnimations(scene);
    expect(animations.get('test-goblin:death')).toEqual({
      key: 'test-goblin:death', frameRate: 10,
      frames: [5, 11, 17, 23].map((frame) => ({ key: death.texture, frame })),
    });
    const enemy = new Enemy(scene, path);
    enemy.target.health = 0;
    enemy.showDeathEffect();
    enemy.destroy();
    expect(sprites[0].destroyed).toBe(true);
    expect(sprites[1].texture).toBe(death.texture);
    expect(sprites[1].displayHeight).toBe(death.displaySize);
    expect(sprites[1].originY).toBe(death.originY);
    expect(sprites[1].animation).toBe('test-goblin:death');
    expect(sprites[1].destroyed).toBe(false);
    sprites[1].listeners.get('animationcomplete')!();
    expect(sprites[1].destroyed).toBe(true);
  });

  it('falls back when the separate death texture is unavailable', () => {
    const death = original.guard!.death!;
    ENEMY_ART.basic = { ...art, death };
    const { scene, sprites, anims, textures } = createScene(true);
    textures.exists.mockImplementation((key?: string) => key !== death.texture);
    createEnemyAnimations(scene);
    const enemy = new Enemy(scene, path);
    enemy.update(250);
    expect(anims.create).not.toHaveBeenCalled();
    expect(sprites).toHaveLength(0);
    expect(enemy.target.progress).toBe(23.75);
  });

  it('does not leave a corpse for escape or result cleanup', () => {
    const { scene, sprites } = createScene(true);
    createEnemyAnimations(scene);
    const enemy = new Enemy(scene, path);
    enemy.update(10000);
    expect(enemy.finished).toBe(true);
    enemy.destroy();
    expect(sprites).toHaveLength(1);
    expect(sprites[0].destroyed).toBe(true);
  });
});

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
    expect(tweens.add).toHaveBeenCalledWith(expect.objectContaining({ duration: 120, alpha: 0 }));
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

describe('Combat feedback follows actual damage and motion', () => {
  it('combines multiple impacts into one damage number without replaying it', () => {
    const { scene, texts } = createScene();
    const enemy = new Enemy(scene, path, 'guard');
    new Projectile(scene, path[0], enemy.target, TOWER_TYPES.longbow).update(1000);
    new Projectile(scene, path[0], enemy.target, TOWER_TYPES.rapid).update(1000);

    expect(enemy.target.health).toBe(4);
    expect(enemy.refreshHealthBar()).toBe(true);
    expect(texts.filter(({ text }) => text.startsWith('-')).map(({ text }) => text)).toEqual(['-3']);
    expect(enemy.refreshHealthBar()).toBe(false);
    expect(texts.filter(({ text }) => text.startsWith('-'))).toHaveLength(1);
  });

  it('shows remaining HP removed by a lethal hit, without counting overkill', () => {
    const { scene, texts } = createScene();
    const enemy = new Enemy(scene, path, 'guard');
    enemy.target.health = 1;
    enemy.refreshHealthBar();
    new Projectile(scene, path[0], enemy.target, TOWER_TYPES.longbow).update(1000);
    expect(enemy.dead).toBe(true);
    enemy.showDeathEffect();

    expect(texts.filter(({ text }) => text.startsWith('-')).map(({ text }) => text))
      .toEqual(['-6', '-1']);
    expect(enemy.target.health).toBe(0);
  });

  it('does not create a damage number for removal or an expired projectile', () => {
    const { scene, texts } = createScene();
    const enemy = new Enemy(scene, path, 'guard');
    const shot = new Projectile(scene, path[0], enemy.target, TOWER_TYPES.longbow);
    enemy.destroy();

    expect(shot.update(1000)).toBe(true);
    expect(texts.filter(({ text }) => text.startsWith('-'))).toHaveLength(0);
  });

  it('bounds floating text near the map edge and destroys it after fading', () => {
    const { scene, texts, tweens } = createScene();
    const enemy = new Enemy(scene, [{ x: 736, y: 32 }, { x: 736, y: 96 }], 'guard');
    enemy.target.health--;
    enemy.refreshHealthBar();
    const label = texts.find(({ text }) => text === '-1')!.node;
    const animation = tweens.add.mock.calls.find(([config]) => config.targets === label)![0];

    expect(label.x).toBeLessThanOrEqual(754);
    expect(Math.abs(label.x - 736)).toBeGreaterThanOrEqual(36);
    expect(label.y).toBeGreaterThanOrEqual(14);
    expect(animation.y).toBeGreaterThanOrEqual(10);
    animation.onComplete();
    expect(label.destroyed).toBe(true);
    expect(enemy.target.health).toBe(6);
  });

  it('turns the Longbow arrow with actual homing travel without changing damage', () => {
    const { scene, containers } = createScene();
    const target = { position: { x: 100, y: 0 }, progress: 0, health: 3 };
    const shot = new Projectile(scene, { x: 0, y: 0 }, target, TOWER_TYPES.longbow);
    const arrow = containers[0];
    expect(shot.update(100)).toBe(false);
    expect(arrow.rotation).toBe(0);
    expect({ x: arrow.x, y: arrow.y }).toEqual({ x: 32, y: 0 });

    target.position = { x: 32, y: 100 };
    expect(shot.update(100)).toBe(false);
    expect(arrow.rotation).toBeCloseTo(Math.PI / 2);
    expect(shot.update(1000)).toBe(true);
    expect(target.health).toBe(1);
    expect(shot.update(1000)).toBe(true);
    expect(target.health).toBe(1);
  });
});
