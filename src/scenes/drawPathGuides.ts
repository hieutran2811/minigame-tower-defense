import type Phaser from 'phaser';
import { TILE } from '../config/gameConfig';
import { PATH_TILES, type Point } from '../data/map';

export function drawPathGuides(
  scene: Phaser.Scene,
  path: readonly Point[] = PATH_TILES,
): void {
  // Ground markings stay below towers and enemies.
  const graphics = scene.add.graphics().setDepth(0.5);

  for (let index = 1; index < path.length - 1; index++) {
    const previous = path[index - 1];
    const current = path[index];
    const next = path[index + 1];
    const dx = next.x - current.x;
    const dy = next.y - current.y;

    if (current.x - previous.x === dx && current.y - previous.y === dy) {
      continue;
    }

    const x = (current.x + 0.5) * TILE;
    const y = (current.y + 0.5) * TILE;

    graphics
      .lineStyle(2, 0x684627, 0.8)
      .beginPath()
      .moveTo(x - dx * 4 - dy * 5, y - dy * 4 + dx * 5)
      .lineTo(x + dx * 6, y + dy * 6)
      .lineTo(x - dx * 4 + dy * 5, y - dy * 4 - dx * 5)
      .strokePath();
  }

  const exit = path[path.length - 1];
  const gateX = exit.x * TILE;
  const gateY = exit.y * TILE;
  graphics
    .fillStyle(0x15202b, 0.35)
    .fillRect(gateX + 8, gateY + 56, 48, 6)
    .fillStyle(0x33485c)
    .fillRect(gateX + 18, gateY + 35, 28, 25)
    .fillRect(gateX + 8, gateY + 28, 13, 32)
    .fillRect(gateX + 43, gateY + 28, 13, 32)
    .fillRect(gateX + 8, gateY + 24, 5, 8)
    .fillRect(gateX + 16, gateY + 24, 5, 8)
    .fillRect(gateX + 43, gateY + 24, 5, 8)
    .fillRect(gateX + 51, gateY + 24, 5, 8)
    .fillStyle(0x71899a)
    .fillRect(gateX + 10, gateY + 32, 3, 24)
    .fillRect(gateX + 45, gateY + 32, 3, 24)
    .fillRect(gateX + 22, gateY + 36, 20, 3)
    .fillStyle(0x15202b)
    .fillRect(gateX + 12, gateY + 38, 4, 7)
    .fillRect(gateX + 48, gateY + 38, 4, 7)
    .fillRect(gateX + 26, gateY + 45, 12, 15)
    .fillRect(gateX + 28, gateY + 42, 8, 5)
    .fillStyle(0x967046)
    .fillRect(gateX + 28, gateY + 48, 2, 12)
    .fillRect(gateX + 34, gateY + 48, 2, 12)
    .fillStyle(0x71899a)
    .fillRect(gateX + 25, gateY + 32, 14, 3)
    .fillStyle(0xf5e6ae)
    .fillRect(gateX + 28, gateY + 29, 8, 3);

  const beacon = scene.add
    .rectangle(gateX + 32, gateY + 26, 4, 6, 0xffedb5)
    .setDepth(0.5);
  scene.tweens.add({
    targets: beacon,
    alpha: 0.45,
    duration: 700,
    yoyo: true,
    repeat: -1,
  });

  const endpoints = [
    { tile: path[0], label: 'IN', color: 0x236044, textColor: '#d7ffe1' },
    {
      tile: exit,
      label: 'OUT',
      color: 0x873d34,
      textColor: '#ffe1d8',
    },
  ];

  for (const { tile, label, color, textColor } of endpoints) {
    graphics
      .lineStyle(2, color)
      .strokeRect(tile.x * TILE + 4, tile.y * TILE + 4, TILE - 8, TILE - 8);

    scene.add
      .text((tile.x + 0.5) * TILE, tile.y * TILE + 6, label, {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: textColor,
        backgroundColor: `#${color.toString(16).padStart(6, '0')}`,
        padding: { x: 3, y: 1 },
      })
      .setOrigin(0.5, 0)
      .setDepth(0.5);
  }
}
