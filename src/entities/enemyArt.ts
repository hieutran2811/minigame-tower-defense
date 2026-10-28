import Phaser from 'phaser';
import {
  ENEMY_ART, ENEMY_ART_FRAMES, ENEMY_DEATH_FRAMES, type EnemyAtlasAsset,
} from '../data/artAssets';

export function preloadEnemyArt(scene: Phaser.Scene): void {
  for (const art of Object.values(ENEMY_ART)) {
    if (!art) continue;
    for (const asset of [art, art.death]) {
      if (asset && !scene.textures.exists(asset.texture)) {
        scene.load.atlas(asset.texture, asset.file, asset.atlas);
      }
    }
  }
}

function hasFrames(scene: Phaser.Scene, asset: EnemyAtlasAsset, frames: readonly number[]): boolean {
  return scene.textures.exists(asset.texture) &&
    frames.every((frame) => scene.textures.get(asset.texture).has(String(frame)));
}

export function createEnemyAnimations(scene: Phaser.Scene): void {
  for (const art of Object.values(ENEMY_ART)) {
    if (!art) continue;
    const movement = Object.values(ENEMY_ART_FRAMES).flatMap(({ idle, walk }) => [idle, ...walk]);
    const deathArt = art.death ?? art;
    const deathFrames = art.death?.frames ?? ENEMY_DEATH_FRAMES;
    // Validate every used pose, including an optional separate death sheet.
    if (!hasFrames(scene, art, movement) || !hasFrames(scene, deathArt, deathFrames)) continue;
    scene.textures.get(art.texture).setFilter(Phaser.Textures.FilterMode.LINEAR);
    if (art.death) {
      scene.textures.get(art.death.texture).setFilter(Phaser.Textures.FilterMode.LINEAR);
    }

    for (const [direction, frames] of Object.entries(ENEMY_ART_FRAMES)) {
      const idle = `${art.texture}:${direction}:idle`;
      if (!scene.anims.exists(idle)) {
        scene.anims.create({
          key: idle,
          frames: [{ key: art.texture, frame: frames.idle }],
          frameRate: 1,
        });
      }
    }

    const death = `${art.texture}:death`;
    if (!scene.anims.exists(death)) {
      scene.anims.create({
        key: death,
        frames: deathFrames.map((frame) => ({ key: deathArt.texture, frame })),
        frameRate: 10,
      });
    }
  }
}
