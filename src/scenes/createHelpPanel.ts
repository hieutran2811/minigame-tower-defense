import type Phaser from 'phaser';
import {
  TOWER_DAMAGE,
  TOWER_FIRE_INTERVAL,
  TOWER_RANGE,
} from '../config/combatConfig';
import { COLS, ROWS, TILE } from '../config/gameConfig';
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
    `Keep at least one of your ${STARTING_LIVES} lives through all ${WAVE_COUNTS.length} waves.`,
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
      'BUILD    Choose BASIC TOWER, then click empty grass.',
      '         Green = valid. Red = path or occupied.',
      'INSPECT  Cancel building, then click a placed tower.',
      `WAVES    Start each wave manually: ${WAVE_COUNTS.join(' / ')} enemies.`,
      '         Wait until every enemy is defeated or has escaped.',
      'LIVES    Each escape costs 1 life; kills increase KILLS.',
      'RESTART  Resets the match, including all towers.',
    ].join('\n'),
    {
      fontFamily: 'monospace',
      fontSize: '15px',
      color: '#ffffff',
      lineSpacing: 9,
      wordWrap: { width: 640 },
    },
  );
  const stats = scene.add.text(
    -320,
    102,
    `Basic tower: ${TOWER_RANGE}px range / ${TOWER_FIRE_INTERVAL}s per shot / ${TOWER_DAMAGE} damage`,
    { fontFamily: 'monospace', fontSize: '14px', color: '#b9e8f5' },
  );
  const hint = scene.add
    .text(0, 140, 'Help is available between waves and after the match.', {
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
      stats,
      hint,
      closeButton,
    ])
    .setDepth(30)
    .setVisible(false);
}
