import Phaser from 'phaser';
import { TOWER_FIRE_INTERVAL, TOWER_RANGE } from '../config/combatConfig';
import { TILE } from '../config/gameConfig';
import type { Point } from '../data/map';
import { selectTarget, TowerAttack, type CombatTarget } from '../systems/Combat';

export class Tower extends Phaser.GameObjects.Container {
  private readonly turret: Phaser.GameObjects.Container;
  private readonly muzzleFlash: Phaser.GameObjects.Rectangle;
  private readonly attack = new TowerAttack(TOWER_RANGE, TOWER_FIRE_INTERVAL);

  constructor(scene: Phaser.Scene, tile: Point) {
    super(scene, (tile.x + 0.5) * TILE, (tile.y + 0.5) * TILE);

    const base = scene.add
      .rectangle(0, 6, 40, 32, 0x33485c)
      .setStrokeStyle(3, 0x1b2c3b);
    const head = scene.add
      .rectangle(0, 0, 26, 26, 0x4bc5e8)
      .setStrokeStyle(3, 0x236b88);
    const barrel = scene.add
      .rectangle(0, -17, 10, 24, 0xb9e8f5)
      .setStrokeStyle(2, 0x236b88);

    this.muzzleFlash = scene.add
      .rectangle(0, -27, 12, 6, 0xffedb5)
      .setAlpha(0);

    this.turret = scene.add.container(0, 0, [head, barrel, this.muzzleFlash]);
    this.add([base, this.turret]);
    this.setDepth(1);
    scene.add.existing(this);
  }

  updateAttack(
    deltaMs: number,
    targets: readonly CombatTarget[],
  ): CombatTarget | null {
    const target = selectTarget(this, targets, TOWER_RANGE);

    if (target) {
      this.turret.setRotation(
        Phaser.Math.Angle.Between(
          this.x,
          this.y,
          target.position.x,
          target.position.y,
        ) + Math.PI / 2,
      );
    }

    if (!this.attack.update(deltaMs / 1000, this, target)) {
      return null;
    }

    this.scene.tweens.killTweensOf(this.muzzleFlash);
    this.muzzleFlash.setAlpha(1);
    this.scene.tweens.add({
      targets: this.muzzleFlash,
      alpha: 0,
      duration: 100,
    });

    return target;
  }
}
