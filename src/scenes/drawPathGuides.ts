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
    .fillStyle(0x33485c)
    .fillRect(gateX + 16, gateY + 28, 32, 24)
    .fillRect(gateX + 12, gateY + 22, 10, 30)
    .fillRect(gateX + 42, gateY + 22, 10, 30)
    .fillStyle(0x15202b)
    .fillRect(gateX + 28, gateY + 39, 8, 13)
    .fillStyle(0xf5e6ae)
    .fillRect(gateX + 29, gateY + 23, 6, 8);

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
