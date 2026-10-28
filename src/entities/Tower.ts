import Phaser from 'phaser';
import { TILE } from '../config/gameConfig';
import { TOWER_TYPES, type TowerKind, type TowerProfile } from '../config/towerConfig';
import type { Point } from '../data/map';
import { selectTarget, TowerAttack, type CombatTarget } from '../systems/Combat';

export class Tower extends Phaser.GameObjects.Container {
  readonly profile: TowerProfile;
  private readonly turret: Phaser.GameObjects.Container;
  private readonly muzzleFlash: Phaser.GameObjects.Rectangle;
  private readonly attack: TowerAttack;

  constructor(scene: Phaser.Scene, tile: Point, readonly kind: TowerKind = 'basic') {
    super(scene, (tile.x + 0.5) * TILE, (tile.y + 0.5) * TILE);
    const profile = TOWER_TYPES[kind];
    this.profile = profile;
    this.attack = new TowerAttack(profile.range, profile.interval);

    const shadow = scene.add.ellipse(0, 24, 46, 12, 0x15202b, 0.3);
    const base = scene.add
      .rectangle(0, 6, 40, 32, 0x33485c)
      .setStrokeStyle(3, 0x1b2c3b);
    const masonry = scene.add.graphics()
      .fillStyle(0x71899a)
      .fillRect(-16, 17, 11, 3)
      .fillRect(5, 17, 11, 3)
      .fillStyle(0x1b2c3b)
      .fillRect(-1, 13, 2, 9);
    const head = kind === 'rapid'
      ? scene.add
        .polygon(0, 0, [0, 13, 13, 0, 26, 13, 13, 26], profile.color)
        .setStrokeStyle(3, profile.outline)
      : scene.add
        .rectangle(0, 0, 26, 26, profile.color)
        .setStrokeStyle(3, profile.outline);
    const content: Phaser.GameObjects.GameObject[] = [head];

    if (kind === 'rapid') {
      for (const x of [-6, 6]) {
        content.push(scene.add
          .rectangle(x, -17, 6, 22, 0xb9e8f5)
          .setStrokeStyle(2, profile.outline));
      }
    } else {
      content.push(scene.add
        .rectangle(0, -17, kind === 'longbow' ? 6 : 10, 24, 0xb9e8f5)
        .setStrokeStyle(2, profile.outline));
    }

    if (kind === 'longbow') {
      content.push(scene.add.graphics()
        .lineStyle(1, 0xf5e6ae)
        .beginPath()
        .moveTo(-15, -8)
        .lineTo(0, 3)
        .lineTo(15, -8)
        .strokePath()
        .lineStyle(3, profile.outline)
        .beginPath()
        .moveTo(-15, -8)
        .lineTo(0, -19)
        .lineTo(15, -8)
        .strokePath());
    }

    this.muzzleFlash = scene.add
      .rectangle(0, -27, kind === 'rapid' ? 20 : 12, 6, 0xffedb5)
      .setAlpha(0);

    content.push(this.muzzleFlash);
    this.turret = scene.add.container(0, 0, content);
    this.add([shadow, base, masonry, this.turret]);
    this.setDepth(1);
    scene.add.existing(this);
  }

  updateAttack(
    deltaMs: number,
    targets: readonly CombatTarget[],
  ): CombatTarget | null {
    const target = selectTarget(this, targets, this.profile.range);

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
