import type Phaser from 'phaser';
import { COLS, ROWS, TILE } from '../config/gameConfig';
import type { LevelDefinition } from '../data/levels';

export function drawTerrain(scene: Phaser.Scene, level: LevelDefinition): void {
  const colors = level.colors;
  const path = new Set(level.path.map(({ x, y }) => `${x},${y}`));
  const forest = level.id === 'whispering-grove';
  const ruins = level.id === 'dawn-keep';
  const graphics = scene.add.graphics();

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const px = x * TILE;
      const py = y * TILE;
      const isPath = path.has(`${x},${y}`);
      const seed = x * 17 + y * 23;
      graphics
        .fillStyle(isPath ? colors.path : colors.grass[(x + y) % 2])
        .fillRect(px, py, TILE, TILE)
        .lineStyle(1, isPath ? colors.pathEdge : colors.grassEdge, 0.55)
        .strokeRect(px, py, TILE, TILE);

      if (isPath) {
        // Edge strips follow the route's outline, never crossing connected tiles.
        graphics.fillStyle(colors.pathEdge, 0.5);
        if (!path.has(`${x},${y - 1}`)) graphics.fillRect(px, py, TILE, 4);
        if (!path.has(`${x},${y + 1}`)) graphics.fillRect(px, py + TILE - 4, TILE, 4);
        if (!path.has(`${x - 1},${y}`)) graphics.fillRect(px, py, 4, TILE);
        if (!path.has(`${x + 1},${y}`)) graphics.fillRect(px + TILE - 4, py, 4, TILE);
        graphics
          .fillStyle(colors.pathEdge, 0.65)
          .fillRect(px + 13, py + 44, 5, 2)
          .fillRect(px + 47, py + 19, 3, 3);
        continue;
      }

      // Flat details sit near tile corners; every empty ground tile stays buildable.
      graphics
        .fillStyle(colors.grassDark, 0.65)
        .fillRect(px + 7, py + 51, 12, 3)
        .fillStyle(colors.grassLight, 0.7)
        .fillRect(px + 10, py + 47, 2, 5)
        .fillRect(px + 15, py + 49, 2, 4);

      if (forest && seed % 3 === 0) {
        graphics
          .fillStyle(colors.grassDark)
          .fillRect(px + 48, py + 7, 3, 14)
          .fillRect(px + 43, py + 10, 13, 3)
          .fillRect(px + 45, py + 16, 9, 3)
          .fillStyle(colors.grassLight)
          .fillRect(px + 48, py + 7, 2, 7)
          .fillStyle(0xc7b2db)
          .fillRect(px + 8, py + 48, 5, 3);
      } else if (ruins && seed % 3 === 0) {
        graphics
          .fillStyle(colors.grassDark)
          .fillRect(px + 44, py + 10, 13, 7)
          .fillStyle(colors.grassLight)
          .fillRect(px + 44, py + 8, 8, 5)
          .fillRect(px + 53, py + 12, 4, 3)
          .fillStyle(colors.grassDark)
          .fillRect(px + 48, py + 8, 1, 3);
      } else if (!forest && !ruins && seed % 4 === 0) {
        graphics
          .fillStyle(colors.grassDark)
          .fillRect(px + 47, py + 10, 2, 11)
          .fillRect(px + 53, py + 13, 2, 8)
          .fillStyle(0xe8d28b)
          .fillRect(px + 45, py + 9, 6, 3)
          .fillRect(px + 51, py + 12, 6, 3);
      }
    }
  }
}
