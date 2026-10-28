import type Phaser from 'phaser';
import { COLS, TILE } from '../config/gameConfig';

export function showWaveBanner(
  scene: Phaser.Scene,
  waveNumber: number,
  enemyCount: number,
): void {
  const background = scene.add
    .rectangle(0, 0, 300, 36, 0x15202b, 0.94)
    .setStrokeStyle(2, 0xf5e6ae);
  const label = scene.add
    .text(0, 0, `WAVE ${waveNumber} / ${enemyCount} ENEMIES`, {
      fontFamily: 'monospace', fontSize: '14px', color: '#ffedb5',
    })
    .setOrigin(0.5);
  const banner = scene.add
    .container((COLS * TILE) / 2, 30, [background, label])
    .setDepth(12);

  // Presentation only: input and the first spawn continue immediately.
  scene.tweens.add({
    targets: banner,
    alpha: 0,
    delay: 650,
    duration: 180,
    onComplete: () => banner.destroy(),
  });
}
