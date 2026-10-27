import Phaser from 'phaser';
import { TILE } from '../config/gameConfig';
import type { Point } from '../data/map';

export class Tower extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, tile: Point) {
    super(scene, (tile.x + 0.5) * TILE, (tile.y + 0.5) * TILE);

    const base = scene.add
      .rectangle(0, 6, 40, 32, 0x33485c)
      .setStrokeStyle(3, 0x1b2c3b);
    const turret = scene.add
      .rectangle(0, 0, 26, 26, 0x4bc5e8)
      .setStrokeStyle(3, 0x236b88);
    const barrel = scene.add
      .rectangle(0, -17, 10, 24, 0xb9e8f5)
      .setStrokeStyle(2, 0x236b88);

    this.add([base, turret, barrel]);
    scene.add.existing(this);
  }
}
