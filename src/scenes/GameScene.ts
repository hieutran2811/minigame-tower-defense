import Phaser from 'phaser';
import { COLS, ROWS, TILE, WIDTH } from '../config/gameConfig';
import { ENEMY_TYPES, type EnemyKind } from '../config/enemyConfig';
import { TOWER_KINDS, TOWER_TYPES, type TowerKind } from '../config/towerConfig';
import { SPAWN_INTERVAL, STARTING_LIVES } from '../config/waveConfig';
import { LEVELS, type LevelDefinition } from '../data/levels';
import type { Point } from '../data/map';
import { CombatAudio } from '../entities/CombatAudio';
import { Enemy } from '../entities/Enemy';
import { Projectile } from '../entities/Projectile';
import { Tower } from '../entities/Tower';
import { TowerPlacement } from '../systems/TowerPlacement';
import { WaveSystem } from '../systems/WaveSystem';
import { createHelpPanel } from './createHelpPanel';
import { createLevelPanel } from './createLevelPanel';
import { drawPathGuides } from './drawPathGuides';

export class GameScene extends Phaser.Scene {
  private enemies: Enemy[] = [];
  private towers: Tower[] = [];
  private projectiles: Projectile[] = [];
  private waves!: WaveSystem;
  private livesText!: Phaser.GameObjects.Text;
  private matchText!: Phaser.GameObjects.Text;
  private exitFlash!: Phaser.GameObjects.Rectangle;
  private phaseText!: Phaser.GameObjects.Text;
  private waveButton!: Phaser.GameObjects.Text;
  private helpButton!: Phaser.GameObjects.Text;
  private helpPanel!: Phaser.GameObjects.Container;
  private levelButton!: Phaser.GameObjects.Text;
  private levelPanel!: Phaser.GameObjects.Container;
  private levelIndex = 0;
  private campaignIntroShown = false;
  private audioButton!: Phaser.GameObjects.Text;
  private combatAudio?: CombatAudio;
  private audioEnabled = false;
  private fpsText?: Phaser.GameObjects.Text;
  private placement!: TowerPlacement;
  private placementPreview!: Phaser.GameObjects.Graphics;
  private towerInspection!: Phaser.GameObjects.Graphics;
  private towerButton!: Phaser.GameObjects.Text;
  private towerTypeButtons: Phaser.GameObjects.Text[] = [];
  private towerStatsText!: Phaser.GameObjects.Text;
  private selectedTowerKind: TowerKind = 'basic';
  private placementText!: Phaser.GameObjects.Text;
  private towerCountText!: Phaser.GameObjects.Text;
  private towerSelected = false;

  constructor() {
    super('GameScene');
  }

  private get level(): LevelDefinition {
    return LEVELS[this.levelIndex];
  }

  create(): void {
    this.placement = new TowerPlacement(COLS, ROWS, this.level.path);
    this.waves = new WaveSystem(
      this.level.waves.map((wave) => wave.length),
      SPAWN_INTERVAL,
      STARTING_LIVES,
    );
    this.towerSelected = false;
    this.selectedTowerKind = 'basic';
    this.towers = [];
    this.enemies = [];
    this.projectiles = [];
    this.fpsText = undefined;
    this.combatAudio =
      this.sound instanceof Phaser.Sound.WebAudioSoundManager
        ? new CombatAudio(this.sound.context, this.sound.destination)
        : undefined;
    this.combatAudio?.setEnabled(this.audioEnabled);

    this.drawMap();
    drawPathGuides(this, this.level.path);
    this.createHud();
    this.createPlacementControls();
    this.createMatchControls();
    this.createHelpControls();
    this.createLevelControls();
    this.createAudioControls();
    this.refreshHud();

    this.input.on('pointermove', this.updatePlacementPreview, this);
    this.input.on('pointerdown', this.handleMapPointerDown, this);
    this.input.on('gameout', this.hidePlacementPreview, this);
    this.input.keyboard?.on('keydown-ESC', this.cancelSelection, this);
    this.input.keyboard?.on('keydown-H', this.toggleHelp, this);
    this.input.keyboard?.on('keydown-B', this.toggleBuild, this);
    this.input.keyboard?.on('keydown-N', this.startNextWave, this);
    this.input.keyboard?.on('keydown-R', this.restartMatch, this);

    const audio = this.combatAudio;
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      audio?.stop();
      this.input.off('pointermove', this.updatePlacementPreview, this);
      this.input.off('pointerdown', this.handleMapPointerDown, this);
      this.input.off('gameout', this.hidePlacementPreview, this);
      this.input.keyboard?.off('keydown-ESC', this.cancelSelection, this);
      this.input.keyboard?.off('keydown-H', this.toggleHelp, this);
      this.input.keyboard?.off('keydown-B', this.toggleBuild, this);
      this.input.keyboard?.off('keydown-N', this.startNextWave, this);
      this.input.keyboard?.off('keydown-R', this.restartMatch, this);
    });
  }

  private drawMap(): void {
    const colors = this.level.colors;
    const pathSet = new Set(this.level.path.map((point) => `${point.x},${point.y}`));
    const graphics = this.add.graphics();

    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const isPath = pathSet.has(`${x},${y}`);
        const base = isPath
          ? colors.path
          : colors.grass[(x + y) % 2];

        graphics.fillStyle(base).fillRect(x * TILE, y * TILE, TILE, TILE);
        graphics
          .lineStyle(1, isPath ? colors.pathEdge : colors.grassEdge, 0.55)
          .strokeRect(x * TILE, y * TILE, TILE, TILE);

        if (!isPath && (x * 17 + y * 23) % 7 === 0) {
          graphics
            .fillStyle(colors.grassDark)
            .fillRect(x * TILE + 15, y * TILE + 18, 8, 5);
          graphics
            .fillStyle(colors.grassLight)
            .fillRect(x * TILE + 18, y * TILE + 15, 4, 4);
        }
      }
    }

    graphics
      .fillStyle(0x202d39)
      .fillRect(COLS * TILE, 0, WIDTH - COLS * TILE, ROWS * TILE);

    const exit = this.level.path[this.level.path.length - 1];
    this.exitFlash = this.add
      .rectangle(
        (exit.x + 0.5) * TILE,
        (exit.y + 0.5) * TILE,
        TILE - 8,
        TILE - 8,
        0xff7373,
      )
      .setDepth(0.6)
      .setAlpha(0);
  }

  private createHud(): void {
    this.add.text(786, 24, 'TOWER DEFENSE', {
      fontFamily: 'monospace',
      fontSize: '17px',
      color: '#f5e6ae',
    });
    this.levelButton = this.add
      .text(786, 68, '', {
        fontFamily: 'monospace',
        fontSize: '13px',
        color: '#f5e6ae',
        backgroundColor: '#33485c',
        fixedWidth: 148,
        align: 'center',
        padding: { x: 8, y: 6 },
      })
      .setInteractive({ useHandCursor: true });
    this.levelButton.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.leftButtonDown()) {
        this.toggleLevelPanel();
      }
    });
    this.livesText = this.add.text(786, 112, '', {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#ffffff',
    });
    this.matchText = this.add.text(786, 132, '', {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#ffffff',
      lineSpacing: 5,
    });

    const title = import.meta.env.DEV
      ? `${this.level.title} / DEVELOPMENT BUILD`
      : this.level.title;

    this.add.text(24, 540, title, {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#e6e6e6',
    });
    this.add.text(
      24,
      580,
      'B build / N next wave / R restart / H help / Esc cancel',
      {
        fontFamily: 'monospace',
        fontSize: '13px',
        color: '#aab7bd',
      },
    );
    this.phaseText = this.add.text(24, 610, '', {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#b4d9bc',
    });

    if (import.meta.env.DEV) {
      this.fpsText = this.add.text(786, 444, 'FPS: --', {
        fontFamily: 'monospace',
        fontSize: '15px',
        color: '#91ff9e',
      });
    }
  }

  private createPlacementControls(): void {
    this.towerTypeButtons = TOWER_KINDS.map((kind, index) => {
      const button = this.add
        .text(786 + index * 50, 208, TOWER_TYPES[kind].shortLabel, {
          fontFamily: 'monospace', fontSize: '11px', color: '#ffffff',
          backgroundColor: '#33485c', fixedWidth: 48, align: 'center',
          padding: { x: 2, y: 6 },
        })
        .setInteractive({ useHandCursor: true });
      button.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        if (pointer.leftButtonDown()) {
          this.selectTowerKind(kind);
        }
      });
      return button;
    });
    this.towerButton = this.add
      .text(786, 242, 'BUILD BASIC', {
        fontFamily: 'monospace',
        fontSize: '13px',
        color: '#ffffff',
        backgroundColor: '#33485c',
        fixedWidth: 148,
        align: 'center',
        padding: { x: 8, y: 8 },
      })
      .setInteractive({ useHandCursor: true });

    this.towerButton.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.leftButtonDown()) {
        this.toggleBuild();
      }
    });

    this.towerStatsText = this.add.text(
      786,
      282,
      '',
      {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: '#b4d9bc',
      },
    );
    this.placementText = this.add.text(786, 302, 'Choose type, then\nB / BUILD to place.', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#ffffff',
      wordWrap: { width: 156 },
      lineSpacing: 5,
    });
    this.towerCountText = this.add.text(786, 410, 'TOWERS  0', {
      fontFamily: 'monospace',
      fontSize: '15px',
      color: '#b9e8f5',
    });
    this.placementPreview = this.add.graphics().setDepth(10);
    this.towerInspection = this.add.graphics().setDepth(0.75);
    // Keep the range circle inside the map, away from the sidebar and footer.
    const mapMask = this.add.graphics().setVisible(false);
    mapMask.fillStyle(0xffffff).fillRect(0, 0, COLS * TILE, ROWS * TILE);
    const previewMask = mapMask.createGeometryMask();
    this.placementPreview.setMask(previewMask);
    this.towerInspection.setMask(previewMask);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => previewMask.destroy());
  }

  private selectTowerKind(kind: TowerKind): void {
    if (this.waves.finished || this.helpPanel.visible || this.levelPanel.visible) {
      return;
    }

    this.selectedTowerKind = kind;
    this.clearTowerInspection();
    this.refreshTowerControls();
    this.placementText.setText(
      this.towerSelected
        ? 'Click empty ground.\nB or Esc to cancel.'
        : 'Type selected.\nB / BUILD to place.',
    );

    if (this.input.manager.isOver) {
      this.updatePlacementPreview(this.input.activePointer);
    }
  }

  private refreshTowerControls(): void {
    const available =
      !this.waves.finished && !this.helpPanel.visible && !this.levelPanel.visible;
    const profile = TOWER_TYPES[this.selectedTowerKind];
    this.towerStatsText.setText(`${profile.range}px / ${profile.interval}s / ${profile.damage} DMG`);

    this.towerTypeButtons.forEach((button, index) => {
      button
        .setBackgroundColor(TOWER_KINDS[index] === this.selectedTowerKind ? '#236b88' : '#33485c')
        .setAlpha(available ? 1 : 0.55);
      button.input!.enabled = available;
    });
    this.towerButton
      .setText(
        this.waves.finished
          ? 'BUILD LOCKED'
          : this.towerSelected
            ? 'CANCEL BUILD'
            : `BUILD ${profile.label}`,
      )
      .setBackgroundColor(this.towerSelected ? '#236b88' : '#33485c')
      .setAlpha(available ? 1 : 0.55);
    this.towerButton.input!.enabled = available;
  }

  private toggleBuild(event?: KeyboardEvent): void {
    if (
      event?.repeat || this.waves.finished || this.helpPanel.visible ||
      this.levelPanel.visible
    ) {
      return;
    }

    if (this.towerSelected) {
      this.cancelPlacement();
    } else {
      this.clearTowerInspection();
      this.towerSelected = true;
      this.refreshTowerControls();
      this.placementText.setText('Click empty ground.\nB or Esc to cancel.');

      if (this.input.manager.isOver) {
        this.updatePlacementPreview(this.input.activePointer);
      }
    }
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
    const centerX = (tile.x + 0.5) * TILE;
    const centerY = (tile.y + 0.5) * TILE;
    const range = TOWER_TYPES[this.selectedTowerKind].range;

    this.placementPreview
      .fillStyle(color, 0.06)
      .fillCircle(centerX, centerY, range)
      .lineStyle(1, color, 0.8)
      .strokeCircle(centerX, centerY, range)
      .fillStyle(color, 0.25)
      .fillRect(tile.x * TILE, tile.y * TILE, TILE, TILE)
      .lineStyle(2, color)
      .strokeRect(tile.x * TILE + 1, tile.y * TILE + 1, TILE - 2, TILE - 2);
  }

  private hidePlacementPreview(): void {
    this.placementPreview.clear();
  }

  private clearTowerInspection(): void {
    this.towerInspection.clear();
  }

  private cancelSelection(): void {
    if (this.levelPanel.visible) {
      this.toggleLevelPanel();
      return;
    }

    if (this.helpPanel.visible) {
      this.toggleHelp();
      return;
    }

    this.clearTowerInspection();

    if (!this.waves.finished) {
      this.cancelPlacement();
    }
  }

  private cancelPlacement(): void {
    this.towerSelected = false;
    this.refreshTowerControls();
    this.placementText.setText('Choose type, then\nB / BUILD to place.');
    this.hidePlacementPreview();
  }

  private handleMapPointerDown(pointer: Phaser.Input.Pointer): void {
    if (
      this.waves.finished || this.helpPanel.visible || this.levelPanel.visible ||
      !pointer.leftButtonDown()
    ) {
      return;
    }

    if (this.towerSelected) {
      this.placeTower(pointer);
      return;
    }

    const tile = this.pointerTile(pointer);

    if (this.placement.getStatus(tile) === 'outside-map') {
      return;
    }

    this.cancelSelection();
    const tower = this.towers.find(
      (candidate) =>
        candidate.x === (tile.x + 0.5) * TILE &&
        candidate.y === (tile.y + 0.5) * TILE,
    );

    if (!tower) {
      return;
    }

    const profile = tower.profile;
    this.towerInspection
      .fillStyle(0x7eddf5, 0.08)
      .fillCircle(tower.x, tower.y, profile.range)
      .lineStyle(2, 0x7eddf5, 0.9)
      .strokeCircle(tower.x, tower.y, profile.range)
      .strokeRect(tile.x * TILE + 2, tile.y * TILE + 2, TILE - 4, TILE - 4);
    this.placementText.setText(
      `${profile.label} TOWER\n${profile.range}px / ${profile.interval}s\n${profile.damage} DMG / Esc closes.`,
    );
  }

  private placeTower(pointer: Phaser.Input.Pointer): void {
    if (!this.towerSelected || this.waves.finished || !pointer.leftButtonDown()) {
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
      this.towers.push(new Tower(this, tile, this.selectedTowerKind));
      this.towerCountText.setText(`TOWERS  ${this.placement.count}`);
      this.placementText.setText('Tower placed.\nChoose another tile.');
    }

    this.updatePlacementPreview(pointer);
  }

  private createMatchControls(): void {
    this.waveButton = this.add
      .text(786, 360, '', {
        fontFamily: 'monospace',
        fontSize: '13px',
        color: '#ffffff',
        backgroundColor: '#236b88',
        fixedWidth: 148,
        align: 'center',
        padding: { x: 8, y: 8 },
      })
      .setInteractive({ useHandCursor: true });

    this.waveButton.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.leftButtonDown()) {
        this.startNextWave();
      }
    });

    this.add
      .text(786, 470, 'RESTART', {
        fontFamily: 'monospace',
        fontSize: '13px',
        color: '#ffffff',
        backgroundColor: '#33485c',
        fixedWidth: 148,
        align: 'center',
        padding: { x: 8, y: 8 },
      })
      .setInteractive({ useHandCursor: true })
      .on('pointerover', function (this: Phaser.GameObjects.Text) {
        this.setBackgroundColor('#236b88');
      })
      .on('pointerout', function (this: Phaser.GameObjects.Text) {
        this.setBackgroundColor('#33485c');
      })
      .on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        if (pointer.leftButtonDown()) {
          this.restartMatch();
        }
      });
  }

  private startNextWave(event?: KeyboardEvent): void {
    if (
      event?.repeat || this.helpPanel.visible || this.levelPanel.visible ||
      this.waves.state !== 'ready'
    ) {
      return;
    }

    this.waves.startWave();
    this.refreshHud();
  }

  private restartMatch(event?: KeyboardEvent): void {
    if (!event?.repeat) {
      this.scene.restart();
    }
  }

  private createHelpControls(): void {
    this.helpPanel = createHelpPanel(this, () => this.toggleHelp());
    this.helpButton = this.add
      .text(786, 540, 'HOW TO PLAY', {
        fontFamily: 'monospace',
        fontSize: '13px',
        color: '#ffffff',
        backgroundColor: '#33485c',
        fixedWidth: 148,
        align: 'center',
        padding: { x: 8, y: 10 },
      })
      .setInteractive({ useHandCursor: true });

    this.helpButton.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.leftButtonDown()) {
        this.toggleHelp();
      }
    });

    this.add.text(786, 584, 'Help: H / Esc closes', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#aab7bd',
    });
  }

  private createLevelControls(): void {
    this.levelPanel = createLevelPanel(
      this,
      this.levelIndex,
      (index) => this.selectLevel(index),
      () => this.toggleLevelPanel(),
    );
    this.levelPanel.setVisible(!this.campaignIntroShown);
    this.campaignIntroShown = true;
  }

  private toggleLevelPanel(): void {
    if (this.waves.state === 'running') {
      return;
    }

    if (!this.levelPanel.visible) {
      this.helpPanel.setVisible(false);
      this.cancelSelection();
    }

    this.levelPanel.setVisible(!this.levelPanel.visible);
    this.refreshHud();
  }

  private selectLevel(index: number): void {
    if (this.waves.state === 'running' || !LEVELS[index]) {
      return;
    }

    this.levelIndex = index;
    this.scene.restart();
  }

  private createAudioControls(): void {
    this.audioButton = this.add
      .text(786, 608, '', {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#ffffff',
        backgroundColor: this.audioEnabled ? '#236b88' : '#33485c',
        fixedWidth: 148,
        align: 'center',
        padding: { x: 8, y: 6 },
      })
      .setText(this.audioEnabled ? 'AUDIO: ON' : 'AUDIO: OFF');

    if (!this.combatAudio) {
      this.audioButton.setText('AUDIO UNAVAILABLE').setAlpha(0.55);
      return;
    }

    this.audioButton.setInteractive({ useHandCursor: true });
    this.audioButton.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.leftButtonDown()) {
        this.audioEnabled = !this.audioEnabled;
        this.combatAudio?.setEnabled(this.audioEnabled);
        this.audioButton
          .setText(this.audioEnabled ? 'AUDIO: ON' : 'AUDIO: OFF')
          .setBackgroundColor(this.audioEnabled ? '#236b88' : '#33485c');
      }
    });
  }

  private toggleHelp(event?: KeyboardEvent): void {
    if (event?.repeat || this.waves.state === 'running' || this.levelPanel.visible) {
      return;
    }

    if (!this.helpPanel.visible) {
      this.cancelSelection();
    }

    this.helpPanel.setVisible(!this.helpPanel.visible);
    this.refreshHud();
  }

  private spawnEnemy(ageSeconds: number, kind: EnemyKind): void {
    const path = this.level.path.map((point) => ({
      x: (point.x + 0.5) * TILE,
      y: (point.y + 0.5) * TILE,
    }));
    const enemy = new Enemy(this, path, kind);

    enemy.update(ageSeconds * 1000);
    this.enemies.push(enemy);
  }

  private clearProjectiles(): void {
    for (const projectile of this.projectiles) {
      projectile.destroy();
    }

    this.projectiles = [];
  }

  private flashEscape(): void {
    // Restart the visual warning instead of stacking it during a slow frame.
    this.tweens.killTweensOf(this.exitFlash);
    this.exitFlash.setAlpha(0.65);
    this.tweens.add({
      targets: this.exitFlash,
      alpha: 0,
      duration: 240,
    });

    this.tweens.killTweensOf(this.livesText);
    this.livesText.setColor('#ff7373').setAlpha(1);
    this.tweens.add({
      targets: this.livesText,
      alpha: 0.35,
      duration: 100,
      yoyo: true,
      repeat: 1,
      onComplete: () => this.livesText.setColor('#ffffff'),
    });
  }

  private finishMatch(): void {
    this.clearProjectiles();

    for (const enemy of this.enemies) {
      enemy.destroy();
    }

    this.enemies = [];
    this.cancelPlacement();
    this.clearTowerInspection();
    this.towerButton
      .setText('BUILD LOCKED')
      .setAlpha(0.55)
      .disableInteractive();
    this.placementText.setText('Match finished.\nPress RESTART.');

    const won = this.waves.state === 'won';
    const nextLevel = this.levelIndex + 1;
    const hasNextLevel = won && nextLevel < LEVELS.length;
    const panel = this.add
      .rectangle(0, 0, 480, 300, 0x15202b, 0.96)
      .setStrokeStyle(3, won ? 0x91ff9e : 0xff7373);
    const title = this.add
      .text(0, -105, won ? 'VICTORY' : 'DEFEAT', {
        fontFamily: 'monospace',
        fontSize: '30px',
        color: won ? '#91ff9e' : '#ff7373',
      })
      .setOrigin(0.5);
    const stats = this.add
      .text(
        0,
        -25,
        `WAVE ${this.waves.waveNumber}/${this.waves.totalWaves}    KILLS ${this.waves.kills}\nLIVES ${this.waves.lives}     TOWERS ${this.placement.count}`,
        {
          fontFamily: 'monospace',
          fontSize: '18px',
          color: '#b4d9bc',
          align: 'center',
          lineSpacing: 12,
        },
      )
      .setOrigin(0.5);
    const detail = this.add
      .text(
        0,
        55,
        hasNextLevel
          ? 'The road is safe. Continue to the next chapter.'
          : won
            ? 'The last beacon shines again.\nPress RESTART to play again.'
            : 'Press RESTART to play again.',
        {
          fontFamily: 'monospace',
          fontSize: '16px',
          color: '#ffffff',
          align: 'center',
          wordWrap: { width: 430 },
        },
      )
      .setOrigin(0.5);

    const content: Phaser.GameObjects.GameObject[] = [panel, title, stats, detail];

    if (hasNextLevel) {
      const nextButton = this.add
        .text(0, 110, 'NEXT LEVEL', {
          fontFamily: 'monospace', fontSize: '14px', color: '#ffffff',
          backgroundColor: '#236b88', fixedWidth: 200, align: 'center',
          padding: { x: 8, y: 8 },
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
      nextButton.on(
        'pointerdown',
        (
          pointer: Phaser.Input.Pointer,
          _x: number,
          _y: number,
          event: Phaser.Types.Input.EventData,
        ) => {
          event.stopPropagation();
          if (pointer.leftButtonDown()) {
            this.selectLevel(nextLevel);
          }
        },
      );
      content.push(nextButton);
    }

    this.add.container((COLS * TILE) / 2, (ROWS * TILE) / 2, content).setDepth(20);
  }

  private nextWaveSummary(): string {
    const nextWave = this.level.waves[this.waves.waveNumber];

    return Object.entries(ENEMY_TYPES).flatMap(([kind, profile]) => {
      const count = nextWave.filter((enemy) => enemy === kind).length;
      return count > 0 ? [`${profile.label} ${count}`] : [];
    }).join(' / ');
  }

  private refreshHud(): void {
    const waves = this.waves;
    const ready = waves.state === 'ready';
    const panelOpen = this.helpPanel.visible || this.levelPanel.visible;
    const waveAvailable = ready && !panelOpen;
    const readyLabel = this.levelPanel.visible
      ? 'CLOSE LEVEL MENU'
      : this.helpPanel.visible
        ? 'CLOSE HELP FIRST'
        : `START WAVE ${waves.waveNumber + 1}`;

    this.livesText.setText(`LIVES ${waves.lives}`);
    this.matchText.setText(
      `WAVE ${waves.waveNumber}/${waves.totalWaves}\nALIVE ${waves.active}\nKILLS ${waves.kills}`,
    );
    this.waveButton
      .setText(
        ready
          ? readyLabel
          : waves.state === 'running'
            ? 'WAVE RUNNING'
            : 'MATCH OVER',
      )
      .setBackgroundColor(waveAvailable ? '#236b88' : '#33485c')
      .setAlpha(waveAvailable ? 1 : 0.55);

    this.waveButton.input!.enabled = waveAvailable;
    this.refreshTowerControls();

    const helpAvailable = waves.state !== 'running' && !this.levelPanel.visible;
    const helpLabel = this.levelPanel.visible
      ? 'CLOSE LEVEL MENU'
      : this.helpPanel.visible
        ? 'CLOSE HELP'
        : 'HOW TO PLAY';
    this.helpButton
      .setText(
        waves.state === 'running'
          ? 'HELP AFTER WAVE'
          : helpLabel,
      )
      .setAlpha(helpAvailable ? 1 : 0.55);
    this.helpButton.input!.enabled = helpAvailable;
    this.levelButton
      .setText(
        this.levelPanel.visible
          ? 'CLOSE LEVELS'
          : `LEVEL ${this.levelIndex + 1}/${LEVELS.length}`,
      )
      .setAlpha(waves.state === 'running' ? 0.55 : 1);
    this.levelButton.input!.enabled = waves.state !== 'running';

    if (ready) {
      const action = panelOpen ? 'Close panel to prepare.' : 'N starts wave.';
      this.phaseText.setText(
        `Wave ${waves.waveNumber + 1}: ${this.nextWaveSummary()}. ${action}`,
      );
    } else if (waves.state === 'running') {
      this.phaseText.setText(
        `Wave ${waves.waveNumber}: ${waves.spawned}/${waves.waveSize} enemies spawned.`,
      );
    } else {
      this.phaseText.setText(
        waves.state === 'won' ? `${this.level.title}: all waves cleared.` : 'No lives remaining.',
      );
    }
  }

  update(_time: number, delta: number): void {
    this.fpsText?.setText(`FPS: ${Math.round(this.game.loop.actualFps)}`);

    if (this.waves.finished) {
      return;
    }

    for (const enemy of this.enemies) {
      enemy.update(delta);
    }

    const firstSpawnIndex = this.waves.spawned;
    const spawnAges = this.waves.update(delta / 1000);

    for (const [offset, age] of spawnAges.entries()) {
      const kind = this.level.waves[this.waves.waveNumber - 1][firstSpawnIndex + offset];
      this.spawnEnemy(age, kind);
    }

    // Resolve escaped enemies before selecting targets or applying damage.
    this.enemies = this.enemies.filter((enemy) => {
      if (enemy.finished) {
        const livesBefore = this.waves.lives;
        this.waves.resolveEnemy('escaped');

        if (this.waves.lives < livesBefore) {
          this.flashEscape();
          this.combatAudio?.play('escape');
        }

        enemy.destroy();
        return false;
      }

      return true;
    });

    if (!this.waves.finished) {
      const targets = this.enemies.map((enemy) => enemy.target);

      for (const tower of this.towers) {
        const target = tower.updateAttack(delta, targets);

        if (target) {
          this.projectiles.push(new Projectile(this, tower, target, tower.profile));
          this.combatAudio?.play('shot');
        }
      }

      this.projectiles = this.projectiles.filter((projectile) => {
        if (projectile.update(delta)) {
          projectile.destroy();
          return false;
        }

        return true;
      });

      this.enemies = this.enemies.filter((enemy) => {
        if (enemy.dead) {
          this.waves.resolveEnemy('killed');
          enemy.showDeathEffect();
          this.combatAudio?.play('kill');
          enemy.destroy();
          return false;
        }

        if (enemy.refreshHealthBar()) {
          this.combatAudio?.play('hit');
        }
        return true;
      });
    }

    if (this.waves.finished) {
      this.finishMatch();
    } else if (this.waves.state === 'ready') {
      this.clearProjectiles();
    }

    this.refreshHud();
  }
}
