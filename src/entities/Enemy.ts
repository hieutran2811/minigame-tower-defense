import Phaser from 'phaser';
import type { Point } from '../data/map';
import { PathFollower } from '../systems/PathFollower';

export class Enemy {
  private sprite: Phaser.GameObjects.Container;
  private follower: PathFollower;

  constructor(scene: Phaser.Scene, path: Point[]) {
    this.follower = new PathFollower(path, 95);

    const body = scene.add
      .rectangle(0, 0, 26, 26, 0x9b5de5)
      .setStrokeStyle(3, 0x352044);
    const eyes = scene.add.rectangle(5, -3, 8, 5, 0xffffff);

    this.sprite = scene.add.container(path[0].x, path[0].y, [body, eyes]);
  }

  update(deltaMs: number): void {
    this.follower.update(deltaMs / 1000);
    this.sprite.setPosition(this.follower.position.x, this.follower.position.y);
  }

  get finished(): boolean {
    return this.follower.finished;
  }

  destroy(): void {
    this.sprite.destroy();
  }
}
