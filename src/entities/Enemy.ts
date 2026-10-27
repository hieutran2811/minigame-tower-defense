import Phaser from 'phaser';
import { ENEMY_MAX_HEALTH, ENEMY_SPEED } from '../config/combatConfig';
import type { Point } from '../data/map';
import type { CombatTarget } from '../systems/Combat';
import { PathFollower } from '../systems/PathFollower';

export class Enemy {
  readonly target: CombatTarget;
  private readonly sprite: Phaser.GameObjects.Container;
  private readonly healthBar: Phaser.GameObjects.Rectangle;
  private readonly follower: PathFollower;

  constructor(scene: Phaser.Scene, path: Point[]) {
    this.follower = new PathFollower(path, ENEMY_SPEED);
    const follower = this.follower;
    this.target = {
      position: this.follower.position,
      health: ENEMY_MAX_HEALTH,
      get progress() {
        return follower.distanceTraveled;
      },
    };

    const body = scene.add
      .rectangle(0, 0, 26, 26, 0x9b5de5)
      .setStrokeStyle(3, 0x352044);
    const eyes = scene.add.rectangle(5, -3, 8, 5, 0xffffff);
    const healthBackground = scene.add.rectangle(0, -23, 30, 5, 0x633545);
    this.healthBar = scene.add
      .rectangle(-15, -23, 30, 5, 0x91ff9e)
      .setOrigin(0, 0.5);

    this.sprite = scene.add
      .container(path[0].x, path[0].y, [
        body,
        eyes,
        healthBackground,
        this.healthBar,
      ])
      .setDepth(2);
  }

  update(deltaMs: number): void {
    this.follower.update(deltaMs / 1000);
    this.sprite.setPosition(this.follower.position.x, this.follower.position.y);
  }

  refreshHealthBar(): void {
    this.healthBar.setScale(this.target.health / ENEMY_MAX_HEALTH, 1);
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
    this.sprite.destroy();
  }
}
