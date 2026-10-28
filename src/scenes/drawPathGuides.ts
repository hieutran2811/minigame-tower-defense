import type Phaser from 'phaser';
import { TILE } from '../config/gameConfig';
import { PATH_TILES } from '../data/map';

export function drawPathGuides(scene: Phaser.Scene): void {
  // Ground markings stay below towers and enemies.
  const graphics = scene.add.graphics().setDepth(0.5);

  for (let index = 1; index < PATH_TILES.length - 1; index++) {
    const previous = PATH_TILES[index - 1];
    const current = PATH_TILES[index];
    const next = PATH_TILES[index + 1];
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

  const endpoints = [
    { tile: PATH_TILES[0], label: 'IN', color: 0x236044, textColor: '#d7ffe1' },
    {
      tile: PATH_TILES[PATH_TILES.length - 1],
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
