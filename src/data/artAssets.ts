import type { EnemyKind } from '../config/enemyConfig';
import goblinRaiderUrl from '../../docs/art/m17/walk-v2/goblin.png?url';
import goblinScoutUrl from '../../docs/art/m17/walk-v2/scout-spaced.png?url';
import ogreWalkUrl from '../../docs/art/m17/walk-v2/ogre-spaced.png?url';
import armoredOgreUrl from '../../docs/art/m17/armored-ogre.png?url';
import goblinRaiderAtlas from './art/walk-v2/goblin.atlas.json';
import goblinScoutAtlas from './art/walk-v2/scout.atlas.json';
import ogreWalkAtlas from './art/walk-v2/ogre.atlas.json';
import ogreDeathAtlas from './art/walk-v2/ogre-death.atlas.json';

export interface EnemyAtlasFrame {
  frame: { x: number; y: number; w: number; h: number };
  trimmed: boolean;
  spriteSourceSize: { x: number; y: number; w: number; h: number };
  sourceSize: { w: number; h: number };
  pivot: { x: number; y: number };
  groundContact: { x: number; y: number };
}

export interface EnemyAtlas {
  frames: Record<string, EnemyAtlasFrame>;
  meta: { size: { w: number; h: number }; frameSize: number };
}

export interface EnemyAtlasAsset {
  texture: string;
  file: string;
  atlas: EnemyAtlas;
}

export interface EnemyDeathArt extends EnemyAtlasAsset {
  frames: readonly number[];
  displaySize: number;
  originY: number;
}

export interface EnemyArt extends EnemyAtlasAsset {
  displaySize: number;
  originY: number;
  stride: number;
  death?: EnemyDeathArt;
}

// PNG pixels stay unchanged; metadata registers poses on a common ground plane.
export const ENEMY_ART: Partial<Record<EnemyKind, EnemyArt>> = {
  basic: {
    texture: 'hollow-goblin-v2',
    file: goblinRaiderUrl,
    atlas: goblinRaiderAtlas,
    displaySize: 68,
    originY: 0.8,
    stride: 48,
  },
  runner: {
    texture: 'hollow-scout-v2',
    file: goblinScoutUrl,
    atlas: goblinScoutAtlas,
    displaySize: 60,
    originY: 0.8,
    stride: 56,
  },
  guard: {
    texture: 'hollow-ogre-v2',
    file: ogreWalkUrl,
    atlas: ogreWalkAtlas,
    displaySize: 78,
    originY: 0.8,
    stride: 52,
    // New death poses overlap; retain the verified original death sequence.
    death: {
      texture: 'hollow-ogre-death-v1',
      file: armoredOgreUrl,
      atlas: ogreDeathAtlas,
      frames: [5, 11, 17, 23],
      displaySize: 70,
      originY: 0.8,
    },
  },
};

export const ENEMY_ART_FRAMES = {
  north: { idle: 32, walk: [0, 1, 2, 3, 4, 5, 6, 7] },
  east: { idle: 33, walk: [8, 9, 10, 11, 12, 13, 14, 15] },
  south: { idle: 34, walk: [16, 17, 18, 19, 20, 21, 22, 23] },
  west: { idle: 35, walk: [24, 25, 26, 27, 28, 29, 30, 31] },
} as const;

export const ENEMY_DEATH_FRAMES = [36, 37, 38, 39] as const;
export type EnemyDirection = keyof typeof ENEMY_ART_FRAMES;
