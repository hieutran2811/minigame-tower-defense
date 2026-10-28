import Phaser from 'phaser';
import { PROJECTILE_SPEED } from '../config/combatConfig';
import { TOWER_TYPES, type TowerProfile } from '../config/towerConfig';
import type { Point } from '../data/map';
import { ProjectileMotion, type CombatTarget } from '../systems/Combat';

export class Projectile {
  private readonly motion: ProjectileMotion;
  private readonly sprite: Phaser.GameObjects.Rectangle;

  constructor(
    scene: Phaser.Scene,
    origin: Point,
    target: CombatTarget,
    profile: TowerProfile = TOWER_TYPES.basic,
  ) {
    this.motion = new ProjectileMotion(
      origin,
      target,
      PROJECTILE_SPEED,
      profile.damage,
    );
    this.sprite = scene.add
      .rectangle(origin.x, origin.y, 8, 8, profile.projectileColor)
      .setStrokeStyle(1, 0x9d6f2b)
      .setDepth(3);
  }

  update(deltaMs: number): boolean {
    const finished = this.motion.update(deltaMs / 1000);
    this.sprite.setPosition(this.motion.position.x, this.motion.position.y);
    return finished;
  }

  destroy(): void {
    this.sprite.destroy();
  }
}
