import Phaser from 'phaser';
import {
  TOWER_DAMAGE,
  TOWER_FIRE_INTERVAL,
  TOWER_RANGE,
} from '../config/combatConfig';
import { COLS, ROWS, TILE, WIDTH } from '../config/gameConfig';
import { SPAWN_INTERVAL, STARTING_LIVES, WAVE_COUNTS } from '../config/waveConfig';
import { PATH_TILES, type Point } from '../data/map';
import { CombatAudio } from '../entities/CombatAudio';
import { Enemy } from '../entities/Enemy';
import { Projectile } from '../entities/Projectile';
import { Tower } from '../entities/Tower';
import { TowerPlacement } from '../systems/TowerPlacement';
import { WaveSystem } from '../systems/WaveSystem';
import { createHelpPanel } from './createHelpPanel';
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
  private audioButton!: Phaser.GameObjects.Text;
  private combatAudio?: CombatAudio;
  private audioEnabled = false;
  private fpsText?: Phaser.GameObjects.Text;
  private placement!: TowerPlacement;
  private placementPreview!: Phaser.GameObjects.Graphics;
  private towerInspection!: Phaser.GameObjects.Graphics;
  private towerButton!: Phaser.GameObjects.Text;
  private placementText!: Phaser.GameObjects.Text;
  private towerCountText!: Phaser.GameObjects.Text;
  private towerSelected = false;

  constructor() {
    super('GameScene');
  }

  create(): void {
    this.placement = new TowerPlacement(COLS, ROWS, PATH_TILES);
    this.waves = new WaveSystem(WAVE_COUNTS, SPAWN_INTERVAL, STARTING_LIVES);
    this.towerSelected = false;
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
    drawPathGuides(this);
    this.createHud();
    this.createPlacementControls();
    this.createMatchControls();
    this.createHelpControls();
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

    const exit = PATH_TILES[PATH_TILES.length - 1];
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
    this.add.text(786, 68, 'MILESTONE 10', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#b4d9bc',
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
      ? 'PIXEL DEFENSE  /  DEVELOPMENT BUILD'
      : 'PIXEL DEFENSE';

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
      if (pointer.leftButtonDown()) {
        this.toggleBuild();
      }
    });

    this.add.text(
      786,
      266,
      `${TOWER_RANGE}px / ${TOWER_FIRE_INTERVAL}s / ${TOWER_DAMAGE} DMG`,
      {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#b4d9bc',
      },
    );
    this.placementText = this.add.text(786, 300, 'Select BASIC TOWER\nto start building.', {
      fontFamily: 'monospace',
      fontSize: '13px',
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

  private toggleBuild(event?: KeyboardEvent): void {
    if (event?.repeat || this.waves.finished || this.helpPanel.visible) {
      return;
    }

    if (this.towerSelected) {
      this.cancelPlacement();
    } else {
      this.clearTowerInspection();
      this.towerSelected = true;
      this.towerButton
        .setText('CANCEL BUILD')
        .setBackgroundColor('#236b88');
      this.placementText.setText('Click grass to place.\nB or Esc to cancel.');

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

    this.placementPreview
      .fillStyle(color, 0.06)
      .fillCircle(centerX, centerY, TOWER_RANGE)
      .lineStyle(1, color, 0.8)
      .strokeCircle(centerX, centerY, TOWER_RANGE)
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
    this.towerButton
      .setText('BASIC TOWER')
      .setBackgroundColor('#33485c');
    this.placementText.setText('Select BASIC TOWER\nto start building.');
    this.hidePlacementPreview();
  }

  private handleMapPointerDown(pointer: Phaser.Input.Pointer): void {
    if (this.waves.finished || this.helpPanel.visible || !pointer.leftButtonDown()) {
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

    this.towerInspection
      .fillStyle(0x7eddf5, 0.08)
      .fillCircle(tower.x, tower.y, TOWER_RANGE)
      .lineStyle(2, 0x7eddf5, 0.9)
      .strokeCircle(tower.x, tower.y, TOWER_RANGE)
      .strokeRect(tile.x * TILE + 2, tile.y * TILE + 2, TILE - 4, TILE - 4);
    this.placementText.setText(
      `BASIC TOWER\n${TOWER_RANGE}px / ${TOWER_FIRE_INTERVAL}s / ${TOWER_DAMAGE} DMG\nEsc to close.`,
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
      this.towers.push(new Tower(this, tile));
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
    if (event?.repeat || this.helpPanel.visible || this.waves.state !== 'ready') {
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
    if (event?.repeat || this.waves.state === 'running') {
      return;
    }

    if (!this.helpPanel.visible) {
      this.cancelSelection();
    }

    this.helpPanel.setVisible(!this.helpPanel.visible);
    this.refreshHud();
  }

  private spawnEnemy(ageSeconds: number): void {
    const path = PATH_TILES.map((point) => ({
      x: (point.x + 0.5) * TILE,
      y: (point.y + 0.5) * TILE,
    }));
    const enemy = new Enemy(this, path);

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
    const panel = this.add
      .rectangle(0, 0, 480, 260, 0x15202b, 0.96)
      .setStrokeStyle(3, won ? 0x91ff9e : 0xff7373);
    const title = this.add
      .text(0, -85, won ? 'VICTORY' : 'DEFEAT', {
        fontFamily: 'monospace',
        fontSize: '30px',
        color: won ? '#91ff9e' : '#ff7373',
      })
      .setOrigin(0.5);
    const stats = this.add
      .text(
        0,
        -5,
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
      .text(0, 90, 'Press RESTART to play again.', {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    this.add.container((COLS * TILE) / 2, (ROWS * TILE) / 2, [
      panel,
      title,
      stats,
      detail,
    ]).setDepth(20);
  }

  private refreshHud(): void {
    const waves = this.waves;
    const ready = waves.state === 'ready';
    const waveAvailable = ready && !this.helpPanel.visible;

    this.livesText.setText(`LIVES ${waves.lives}`);
    this.matchText.setText(
      `WAVE ${waves.waveNumber}/${waves.totalWaves}\nALIVE ${waves.active}\nKILLS ${waves.kills}`,
    );
    this.waveButton
      .setText(
        ready
          ? this.helpPanel.visible
            ? 'CLOSE HELP FIRST'
            : `START WAVE ${waves.waveNumber + 1}`
          : waves.state === 'running'
            ? 'WAVE RUNNING'
            : 'MATCH OVER',
      )
      .setBackgroundColor(waveAvailable ? '#236b88' : '#33485c')
      .setAlpha(waveAvailable ? 1 : 0.55);

    this.waveButton.input!.enabled = waveAvailable;
    this.towerButton.input!.enabled = !waves.finished && !this.helpPanel.visible;
    this.towerButton.setAlpha(waves.finished || this.helpPanel.visible ? 0.55 : 1);

    const helpAvailable = waves.state !== 'running';
    this.helpButton
      .setText(
        !helpAvailable
          ? 'HELP AFTER WAVE'
          : this.helpPanel.visible
            ? 'CLOSE HELP'
            : 'HOW TO PLAY',
      )
      .setAlpha(helpAvailable ? 1 : 0.55);
    this.helpButton.input!.enabled = helpAvailable;

    if (ready) {
      this.phaseText.setText(
        `Ready for wave ${waves.waveNumber + 1}. Place towers, then start.`,
      );
    } else if (waves.state === 'running') {
      this.phaseText.setText(
        `Wave ${waves.waveNumber}: ${waves.spawned}/${waves.waveSize} enemies spawned.`,
      );
    } else {
      this.phaseText.setText(
        waves.state === 'won' ? 'All 3 waves cleared.' : 'No lives remaining.',
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

    for (const age of this.waves.update(delta / 1000)) {
      this.spawnEnemy(age);
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
          this.projectiles.push(new Projectile(this, tower, target));
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
