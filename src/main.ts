import Phaser from 'phaser';
import { WIDTH, HEIGHT } from './config/gameConfig';
import { GameScene } from './scenes/GameScene';
import './style.css';

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'app',
  width: WIDTH,
  height: HEIGHT,
  backgroundColor: '#15202b',
  pixelArt: true,
  roundPixels: true,
  render: {
    antialias: false,
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [GameScene],
});
