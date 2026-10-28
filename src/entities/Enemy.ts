import Phaser from 'phaser';
import { ENEMY_TYPES, type EnemyKind } from '../config/enemyConfig';
import type { Point } from '../data/map';
import type { CombatTarget } from '../systems/Combat';
import { PathFollower } from '../systems/PathFollower';

export class Enemy {
  readonly target: CombatTarget;
  private readonly sprite: Phaser.GameObjects.Container;
  private readonly figure: Phaser.GameObjects.Container;
  private readonly feet: Phaser.GameObjects.Rectangle[];
  private readonly footY: number;
  private readonly healthBar: Phaser.GameObjects.Rectangle;
  private readonly hitFlash: Phaser.GameObjects.Rectangle;
  private readonly follower: PathFollower;
  private readonly maxHealth: number;
  private readonly deathColor: number;
  private displayedHealth: number;

  constructor(
    private readonly scene: Phaser.Scene,
    path: Point[],
    kind: EnemyKind = 'basic',
  ) {
    const profile = ENEMY_TYPES[kind];
    this.maxHealth = profile.maxHealth;
    this.displayedHealth = profile.maxHealth;
    this.deathColor = profile.burst;
    this.follower = new PathFollower(path, profile.speed);
    const follower = this.follower;
    this.target = {
      position: this.follower.position,
      health: profile.maxHealth,
      get progress() {
        return follower.distanceTraveled;
      },
    };

    const width = kind === 'guard' ? 34 : kind === 'runner' ? 30 : 26;
    const height = kind === 'guard' ? 32 : kind === 'runner' ? 24 : 26;
    const shadow = scene.add.ellipse(0, 18, width + 8, 10, 0x15202b, 0.28);
    this.footY = height / 2 + 1;
    this.feet = [-7, 7].map((x) =>
      scene.add.rectangle(x, this.footY, 6, 6, profile.outline),
    );
    const content: Phaser.GameObjects.GameObject[] = [...this.feet];

    if (kind === 'runner') {
      content.push(scene.add.polygon(-11, 4, [0, 0, 18, 0, 18, 14, 0, 9], profile.outline));
    } else if (kind === 'guard') {
      content.push(
        scene.add.rectangle(-17, -4, 6, 12, profile.outline),
        scene.add.rectangle(17, -4, 6, 12, profile.outline),
        scene.add.rectangle(0, -17, 10, 5, profile.outline),
        scene.add.rectangle(0, -17, 2, 5, 0xb9e8f5),
      );
    } else {
      content.push(
        scene.add.rectangle(-10, -15, 5, 6, profile.outline),
        scene.add.rectangle(10, -15, 5, 6, profile.outline),
      );
    }

    const body = kind === 'runner'
      ? scene.add
        .polygon(0, 0, [0, 12, 15, 0, 30, 12, 15, 24], profile.color)
        .setStrokeStyle(2, profile.outline)
      : scene.add
        .rectangle(0, 0, width, height, profile.color)
        .setStrokeStyle(kind === 'guard' ? 4 : 3, profile.outline);
    const eyes = scene.add.rectangle(5, -3, 8, 5, 0xffffff);
    content.push(body, eyes);

    if (kind === 'guard') {
      content.push(
        scene.add.rectangle(0, 7, 14, 14, 0xb9e8f5).setStrokeStyle(2, profile.outline),
        scene.add.rectangle(0, 1, 10, 2, 0xffffff),
      );
    }

    this.hitFlash = scene.add.rectangle(0, 0, width, height, 0xffffff).setAlpha(0);
    content.push(this.hitFlash);

    if (kind !== 'basic') {
      content.push(
        scene.add.text(0, kind === 'guard' ? 7 : 5, kind === 'runner' ? 'R' : 'G', {
          fontFamily: 'monospace', fontSize: '9px', color: '#263d52',
        }).setOrigin(0.5),
      );
    }

    this.figure = scene.add.container(0, 0, content);
    const barWidth = kind === 'guard' ? 42 : 30;
    const barY = kind === 'guard' ? -27 : -23;
    const healthBackground = scene.add.rectangle(0, barY, barWidth, 5, 0x633545);
    this.healthBar = scene.add
      .rectangle(-barWidth / 2, barY, barWidth, 5, 0x91ff9e)
      .setOrigin(0, 0.5);
    this.sprite = scene.add
      .container(path[0].x, path[0].y, [shadow, this.figure, healthBackground, this.healthBar])
      .setDepth(2);
  }

  update(deltaMs: number): void {
    this.follower.update(deltaMs / 1000);
    this.sprite.setPosition(this.follower.position.x, this.follower.position.y);
    // Animate only the figure: combat position, shadow and HP bars stay anchored.
    const distance = this.follower.distanceTraveled;
    this.figure.setY(Math.round(Math.sin(distance / 8)));
    const step = Math.round(Math.sin(distance / 5));
    this.feet[0].setY(this.footY + step);
    this.feet[1].setY(this.footY - step);
  }

  refreshHealthBar(): boolean {
    const damaged = this.target.health < this.displayedHealth;

    if (damaged) {
      this.scene.tweens.killTweensOf(this.hitFlash);
      this.hitFlash.setAlpha(0.75);
      this.scene.tweens.add({
        targets: this.hitFlash,
        alpha: 0,
        duration: 120,
      });
    }

    this.displayedHealth = this.target.health;
    this.healthBar.setScale(this.target.health / this.maxHealth, 1);
    return damaged;
  }

  showDeathEffect(): void {
    const burst = this.scene.add
      .graphics({ x: this.sprite.x, y: this.sprite.y })
      .setDepth(4);

    burst
      .fillStyle(this.deathColor)
      .fillRect(-10, -10, 6, 6)
      .fillRect(4, -10, 6, 6)
      .fillRect(-10, 4, 6, 6)
      .fillRect(4, 4, 6, 6)
      .fillStyle(0xffdc73)
      .fillRect(-2, -2, 4, 4);

    this.scene.tweens.add({
      targets: burst,
      alpha: 0,
      scaleX: 1.8,
      scaleY: 1.8,
      duration: 180,
      onComplete: () => burst.destroy(),
    });
  }

  get finished(): boolean {
    return this.follower.finished;
  }

  get dead(): boolean {
    return this.target.health <= 0;
  }

  destroy(): void {
    // In-flight shots keep this target reference and expire after its removal.
    this.target.health = 0;
    this.scene.tweens.killTweensOf(this.hitFlash);
    this.sprite.destroy();
  }
}
