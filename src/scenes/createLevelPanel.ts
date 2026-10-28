import type Phaser from 'phaser';
import { COLS, ROWS, TILE } from '../config/gameConfig';
import { LEVELS } from '../data/levels';

export function createLevelPanel(
  scene: Phaser.Scene,
  selected: number,
  onSelect: (index: number) => void,
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
    ) => event.stopPropagation(),
  );

  const panel = scene.add
    .rectangle(0, 0, 704, 456, 0x202d39)
    .setStrokeStyle(2, 0xf5e6ae);
  const title = scene.add
    .text(0, -200, 'THE LAST BEACON', {
      fontFamily: 'monospace', fontSize: '24px', color: '#f5e6ae',
    })
    .setOrigin(0.5);
  const content: Phaser.GameObjects.GameObject[] = [backdrop, panel, title];

  LEVELS.forEach((level, index) => {
    const y = -112 + index * 104;
    const card = scene.add
      .rectangle(0, y, 640, 88, 0x15202b)
      .setStrokeStyle(1, index === selected ? 0xf5e6ae : 0x496174);
    const name = scene.add.text(-300, y - 30, `${index + 1}. ${level.title}`, {
      fontFamily: 'monospace', fontSize: '14px', color: '#b9e8f5',
    });
    const story = scene.add.text(-300, y - 5, level.story, {
      fontFamily: 'monospace', fontSize: '12px', color: '#d3ddd5',
      wordWrap: { width: 430 }, lineSpacing: 3,
    });
    const button = scene.add
      .text(240, y, 'PLAY', {
        fontFamily: 'monospace', fontSize: '13px', color: '#ffffff',
        backgroundColor: '#236b88', fixedWidth: 96, align: 'center',
        padding: { x: 6, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    button.on(
      'pointerdown',
      (
        pointer: Phaser.Input.Pointer,
        _x: number,
        _y: number,
        event: Phaser.Types.Input.EventData,
      ) => {
        event.stopPropagation();
        if (pointer.leftButtonDown()) {
          onSelect(index);
        }
      },
    );
    content.push(card, name, story, button);
  });

  const closeButton = scene.add
    .text(0, 190, 'CLOSE (ESC)', {
      fontFamily: 'monospace', fontSize: '14px', color: '#ffffff',
      backgroundColor: '#33485c', fixedWidth: 200, align: 'center',
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
  content.push(closeButton);

  return scene.add
    .container((COLS * TILE) / 2, (ROWS * TILE) / 2, content)
    .setDepth(30)
    .setVisible(false);
}
