import Phaser from 'phaser';
import { ENEMY_MAX_HEALTH } from '../config/combatConfig';
import { COLS, ROWS, TILE, WIDTH } from '../config/gameConfig';
import { PATH_TILES, type Point } from '../data/map';
import { Enemy } from '../entities/Enemy';
import { Projectile } from '../entities/Projectile';
import { Tower } from '../entities/Tower';
import { TowerPlacement } from '../systems/TowerPlacement';

export class GameScene extends Phaser.Scene {
  private enemy?: Enemy;
  private towers: Tower[] = [];
  private projectiles: Projectile[] = [];
  private kills = 0;
  private combatText!: Phaser.GameObjects.Text;
  private fpsText?: Phaser.GameObjects.Text;
  private placement!: TowerPlacement;
  private placementPreview!: Phaser.GameObjects.Graphics;
  private towerButton!: Phaser.GameObjects.Text;
  private placementText!: Phaser.GameObjects.Text;
  private towerCountText!: Phaser.GameObjects.Text;
  private towerSelected = false;

  constructor() {
    super('GameScene');
  }

  create(): void {
    this.placement = new TowerPlacement(COLS, ROWS, PATH_TILES);
    this.towerSelected = false;
    this.towers = [];
    this.projectiles = [];
    this.kills = 0;
    this.fpsText = undefined;

    this.drawMap();
    this.createHud();
    this.createPlacementControls();
    this.spawnEnemy();

    this.input.on('pointermove', this.updatePlacementPreview, this);
    this.input.on('pointerdown', this.placeTower, this);
    this.input.on('gameout', this.hidePlacementPreview, this);
    this.input.keyboard?.on('keydown-ESC', this.cancelPlacement, this);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.off('pointermove', this.updatePlacementPreview, this);
      this.input.off('pointerdown', this.placeTower, this);
      this.input.off('gameout', this.hidePlacementPreview, this);
      this.input.keyboard?.off('keydown-ESC', this.cancelPlacement, this);
    });
  }

  private drawMap(): void {
    const pathSet = new Set(PATH_TILES.map((point) => `${point.x},${point.y}`));
    const graphics = this.add.graphics();

    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const isPath = pathSet.has(`${x},${y}`);
        const base = isPath
          ? 0xb9905e
          : (x + y) % 2 === 0
            ? 0x70a855
            : 0x669e4d;

        graphics.fillStyle(base).fillRect(x * TILE, y * TILE, TILE, TILE);
        graphics
          .lineStyle(1, isPath ? 0x967046 : 0x598747, 0.55)
          .strokeRect(x * TILE, y * TILE, TILE, TILE);

        if (!isPath && (x * 17 + y * 23) % 7 === 0) {
          graphics
            .fillStyle(0x3c753e)
            .fillRect(x * TILE + 15, y * TILE + 18, 8, 5);
          graphics
            .fillStyle(0x9dc875)
            .fillRect(x * TILE + 18, y * TILE + 15, 4, 4);
        }
      }
    }

    graphics
      .fillStyle(0x202d39)
      .fillRect(COLS * TILE, 0, WIDTH - COLS * TILE, ROWS * TILE);
  }

  private createHud(): void {
    this.add.text(786, 24, 'TOWER DEFENSE', {
      fontFamily: 'monospace',
      fontSize: '17px',
      color: '#f5e6ae',
    });
    this.add.text(786, 68, 'MILESTONE 3', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#b4d9bc',
    });
    this.combatText = this.add.text(786, 112, 'ENEMY 3/3 HP\nKILLS 0\nWAVE DEMO', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#ffffff',
      lineSpacing: 14,
    });

    const title = import.meta.env.DEV
      ? 'PIXEL DEFENSE  /  DEVELOPMENT BUILD'
      : 'PIXEL DEFENSE';

    this.add.text(24, 540, title, {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#e6e6e6',
    });
    this.add.text(24, 580, 'Select a tower, then click grass. Esc cancels.', {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#aab7bd',
    });

    if (import.meta.env.DEV) {
      this.fpsText = this.add.text(786, 450, 'FPS: --', {
        fontFamily: 'monospace',
        fontSize: '15px',
        color: '#91ff9e',
      });
    }
  }

  private createPlacementControls(): void {
    this.towerButton = this.add
      .text(786, 216, 'BASIC TOWER', {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#ffffff',
        backgroundColor: '#33485c',
        fixedWidth: 148,
        align: 'center',
        padding: { x: 8, y: 10 },
      })
      .setInteractive({ useHandCursor: true });

    this.towerButton.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!pointer.leftButtonDown()) {
        return;
      }

      if (this.towerSelected) {
        this.cancelPlacement();
      } else {
        this.towerSelected = true;
        this.towerButton.setBackgroundColor('#236b88');
        this.placementText.setText('Click grass to place.\nEsc to cancel.');
      }
    });

    this.add.text(786, 266, '128px / 1s / 1 DMG', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#b4d9bc',
    });
    this.placementText = this.add.text(786, 300, 'Select BASIC TOWER\nto start building.', {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#ffffff',
      wordWrap: { width: 156 },
      lineSpacing: 5,
    });
    this.towerCountText = this.add.text(786, 400, 'TOWERS  0', {
      fontFamily: 'monospace',
      fontSize: '15px',
      color: '#b9e8f5',
    });
    this.placementPreview = this.add.graphics().setDepth(10);
  }

  private pointerTile(pointer: Phaser.Input.Pointer): Point {
    return {
      x: Math.floor(pointer.x / TILE),
      y: Math.floor(pointer.y / TILE),
    };
  }

  private updatePlacementPreview(pointer: Phaser.Input.Pointer): void {
    this.placementPreview.clear();

    if (!this.towerSelected) {
      return;
    }

    const tile = this.pointerTile(pointer);
    const status = this.placement.getStatus(tile);

    if (status === 'outside-map') {
      return;
    }

    const color = status === 'available' ? 0x91ff9e : 0xff7373;

    this.placementPreview
      .fillStyle(color, 0.25)
      .fillRect(tile.x * TILE, tile.y * TILE, TILE, TILE)
      .lineStyle(2, color)
      .strokeRect(tile.x * TILE + 1, tile.y * TILE + 1, TILE - 2, TILE - 2);
  }

  private hidePlacementPreview(): void {
    this.placementPreview.clear();
  }

  private cancelPlacement(): void {
    this.towerSelected = false;
    this.towerButton.setBackgroundColor('#33485c');
    this.placementText.setText('Select BASIC TOWER\nto start building.');
    this.hidePlacementPreview();
  }

  private placeTower(pointer: Phaser.Input.Pointer): void {
    if (!this.towerSelected || !pointer.leftButtonDown()) {
      return;
    }

    const tile = this.pointerTile(pointer);
    const status = this.placement.getStatus(tile);

    if (status === 'outside-map') {
      this.hidePlacementPreview();
      return;
    }

    if (status === 'path') {
      this.placementText.setText('Keep the enemy\npath clear.');
    } else if (status === 'occupied') {
      this.placementText.setText('This tile already\nhas a tower.');
    } else if (this.placement.place(tile)) {
      this.towers.push(new Tower(this, tile));
      this.towerCountText.setText(`TOWERS  ${this.placement.count}`);
      this.placementText.setText('Tower placed.\nChoose another tile.');
    }

    this.updatePlacementPreview(pointer);
  }

  private spawnEnemy(): void {
    const path = PATH_TILES.map((point) => ({
      x: (point.x + 0.5) * TILE,
      y: (point.y + 0.5) * TILE,
    }));

    this.enemy = new Enemy(this, path);
  }

  update(_time: number, delta: number): void {
    const enemy = this.enemy;

    if (!enemy) {
      return;
    }

    enemy.update(delta);

    // An escaped enemy is removed before towers can shoot at the next spawn.
    if (!enemy.finished) {
      for (const tower of this.towers) {
        if (tower.updateAttack(delta, enemy.target)) {
          this.projectiles.push(new Projectile(this, tower, enemy.target));
        }
      }

      this.projectiles = this.projectiles.filter((projectile) => {
        if (projectile.update(delta)) {
          projectile.destroy();
          return false;
        }

        return true;
      });
    }

    if (enemy.dead || enemy.finished) {
      if (enemy.dead) {
        this.kills++;
      }

      for (const projectile of this.projectiles) {
        projectile.destroy();
      }

      this.projectiles = [];
      enemy.destroy();
      this.spawnEnemy();
    } else {
      enemy.refreshHealthBar();
    }

    this.combatText.setText(
      `ENEMY ${this.enemy!.target.health}/${ENEMY_MAX_HEALTH} HP\nKILLS ${this.kills}\nWAVE DEMO`,
    );
    this.fpsText?.setText(`FPS: ${Math.round(this.game.loop.actualFps)}`);
  }
}
