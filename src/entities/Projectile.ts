import Phaser from 'phaser';
import { PROJECTILE_SPEED } from '../config/combatConfig';
import { TOWER_TYPES, type TowerProfile } from '../config/towerConfig';
import type { Point } from '../data/map';
import { ProjectileMotion, type CombatTarget } from '../systems/Combat';

export class Projectile {
  private readonly motion: ProjectileMotion;
  private readonly sprite: Phaser.GameObjects.Container;

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
    const color = profile.projectileColor;
    const content: Phaser.GameObjects.GameObject[] = [];

    if (profile.label === 'LONGBOW') {
      content.push(
        scene.add.rectangle(-5, 0, 15, 3, color),
        scene.add.polygon(4, 0, [0, 0, 9, 4, 0, 8, 2, 4], color),
        scene.add.rectangle(-14, -2, 4, 2, 0xb9e8f5),
        scene.add.rectangle(-14, 2, 4, 2, 0xb9e8f5),
      );
    } else {
      const rapid = profile.label === 'RAPID';
      content.push(
        scene.add.rectangle(-10, 0, 4, 2, color).setAlpha(0.3),
        scene.add.rectangle(-6, 0, 5, 3, color).setAlpha(0.55),
        scene.add.rectangle(0, 0, rapid ? 6 : 8, rapid ? 4 : 8, color)
          .setStrokeStyle(1, 0x9d6f2b),
      );
    }

    this.sprite = scene.add
      .container(origin.x, origin.y, content)
      .setRotation(Math.atan2(target.position.y - origin.y, target.position.x - origin.x))
      .setDepth(3);
  }

  update(deltaMs: number): boolean {
    const previousX = this.motion.position.x;
    const previousY = this.motion.position.y;
    const finished = this.motion.update(deltaMs / 1000);
    this.sprite.setPosition(this.motion.position.x, this.motion.position.y);
    const dx = this.motion.position.x - previousX;
    const dy = this.motion.position.y - previousY;

    if (dx !== 0 || dy !== 0) {
      this.sprite.setRotation(Math.atan2(dy, dx));
    }

    return finished;
  }

  destroy(): void {
    this.sprite.destroy();
  }
}
