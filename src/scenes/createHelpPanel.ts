import type Phaser from 'phaser';
import { COLS, ROWS, TILE } from '../config/gameConfig';
import { ENEMY_TYPES } from '../config/enemyConfig';
import { TOWER_KINDS, TOWER_TYPES } from '../config/towerConfig';
import { STARTING_LIVES, WAVE_COUNTS } from '../config/waveConfig';

export function createHelpPanel(
  scene: Phaser.Scene,
  onClose: () => void,
): Phaser.GameObjects.Container {
  const backdrop = scene.add
    .rectangle(0, 0, COLS * TILE, ROWS * TILE, 0x0b1420, 0.8)
    .setInteractive();

  backdrop.on(
    'pointerdown',
    (
      _pointer: Phaser.Input.Pointer,
      _x: number,
      _y: number,
      event: Phaser.Types.Input.EventData,
    ) => {
      event.stopPropagation();
    },
  );

  const panel = scene.add
    .rectangle(0, 0, 704, 456, 0x202d39)
    .setStrokeStyle(2, 0x7eddf5);
  const title = scene.add
    .text(0, -200, 'HOW TO PLAY', {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: '#f5e6ae',
    })
    .setOrigin(0.5);
  const objective = scene.add.text(
    -320,
    -162,
    `Each map: survive ${WAVE_COUNTS.length} waves with at least 1 of your ${STARTING_LIVES} lives.`,
    {
      fontFamily: 'monospace',
      fontSize: '15px',
      color: '#b4d9bc',
      wordWrap: { width: 640 },
    },
  );
  const instructions = scene.add.text(
    -320,
    -116,
    [
      'BUILD    Choose BASIC/RAPID/BOW; B builds the selected type.',
      '         Green = valid; red = blocked. Esc cancels building.',
      'INSPECT  Cancel building, then click a placed tower.',
      `WAVES    N starts ${WAVE_COUNTS.join(' / ')} enemies; wait until each wave clears.`,
      'LIVES    Escape: -1. Kill: +1 KILLS. R restarts; AUDIO toggles sound.',
    ].join('\n'),
    {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#ffffff',
      lineSpacing: 5,
      wordWrap: { width: 640 },
    },
  );
  const enemyLegend = scene.add.text(-320, -2, 'ENEMIES (Runner: R / Guard: G)', {
    fontFamily: 'monospace', fontSize: '13px', color: '#f5e6ae',
  });
  const enemyStats = scene.add.text(
    -320,
    18,
    Object.values(ENEMY_TYPES).map((profile) =>
      `${profile.label.padEnd(6)}  ${profile.maxHealth} HP / ${profile.speed}px/s`,
    ).join('\n'),
    {
      fontFamily: 'monospace', fontSize: '13px', color: '#ffffff', lineSpacing: 4,
    },
  );
  const towerLegend = scene.add.text(16, -2, 'TOWERS (range / interval / damage)', {
    fontFamily: 'monospace', fontSize: '12px', color: '#f5e6ae',
  });
  const towerStats = scene.add.text(
    16,
    18,
    TOWER_KINDS.map((kind) => {
      const profile = TOWER_TYPES[kind];
      return `${profile.label.padEnd(7)} ${profile.range}px / ${profile.interval}s / ${profile.damage}`;
    }).join('\n'),
    {
      fontFamily: 'monospace', fontSize: '12px', color: '#ffffff', lineSpacing: 5,
    },
  );
  const stats = scene.add.text(
    -320,
    102,
    'B toggles building. Change type while building to update the preview.',
    { fontFamily: 'monospace', fontSize: '14px', color: '#b9e8f5' },
  );
  const hint = scene.add
    .text(0, 140, 'Use LEVEL to change maps. R restarts the current map.', {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#aab7bd',
    })
    .setOrigin(0.5);
  const closeButton = scene.add
    .text(0, 190, 'CLOSE (H / ESC)', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: '#236b88',
      fixedWidth: 220,
      align: 'center',
      padding: { x: 8, y: 10 },
    })
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true });

  closeButton.on(
    'pointerdown',
    (
      pointer: Phaser.Input.Pointer,
      _x: number,
      _y: number,
      event: Phaser.Types.Input.EventData,
    ) => {
      event.stopPropagation();

      if (pointer.leftButtonDown()) {
        onClose();
      }
    },
  );

  return scene.add
    .container((COLS * TILE) / 2, (ROWS * TILE) / 2, [
      backdrop,
      panel,
      title,
      objective,
      instructions,
      enemyLegend,
      enemyStats,
      towerLegend,
      towerStats,
      stats,
      hint,
      closeButton,
    ])
    .setDepth(30)
    .setVisible(false);
}
