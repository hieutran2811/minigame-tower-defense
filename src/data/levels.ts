import { PATH_TILES, type Point } from './map';
import type { EnemyKind } from '../config/enemyConfig';
import { WAVE_COUNTS } from '../config/waveConfig';

export type LevelDefinition = {
  id: string;
  title: string;
  story: string;
  path: readonly Point[];
  waves: readonly (readonly EnemyKind[])[];
  colors: {
    grass: readonly [number, number];
    path: number;
    pathEdge: number;
    grassEdge: number;
    grassDark: number;
    grassLight: number;
  };
};

export const LEVELS: readonly LevelDefinition[] = [
  {
    id: 'border-watch',
    title: 'BORDER WATCH',
    story: 'Hollow goblin raiders darken the border lanterns. Hold the watchpost and keep the Dawn Guard road open.',
    path: PATH_TILES,
    waves: WAVE_COUNTS.map((count) => Array.from({ length: count }, (): EnemyKind => 'basic')),
    colors: {
      grass: [0x70a855, 0x669e4d],
      path: 0xb9905e,
      pathEdge: 0x967046,
      grassEdge: 0x598747,
      grassDark: 0x3c753e,
      grassLight: 0x9dc875,
    },
  },
  {
    id: 'whispering-grove',
    title: 'WHISPERING GROVE',
    story: 'Goblin scouts race through the grove while armored ogres follow. Keep the refugee trail open.',
    waves: [
      ['basic', 'basic', 'runner', 'basic', 'runner'],
      ['basic', 'runner', 'basic', 'runner', 'guard', 'basic', 'runner', 'basic'],
      ['basic', 'runner', 'guard', 'basic', 'runner', 'basic',
        'guard', 'runner', 'basic', 'runner', 'guard', 'basic'],
    ],
    path: [
      { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 },
      { x: 2, y: 2 }, { x: 2, y: 3 }, { x: 3, y: 3 },
      { x: 4, y: 3 }, { x: 5, y: 3 }, { x: 5, y: 2 },
      { x: 5, y: 1 }, { x: 6, y: 1 }, { x: 7, y: 1 },
      { x: 8, y: 1 }, { x: 8, y: 2 }, { x: 8, y: 3 },
      { x: 8, y: 4 }, { x: 7, y: 4 }, { x: 6, y: 4 },
      { x: 5, y: 4 }, { x: 4, y: 4 }, { x: 4, y: 5 },
      { x: 4, y: 6 }, { x: 5, y: 6 }, { x: 6, y: 6 },
      { x: 7, y: 6 }, { x: 8, y: 6 }, { x: 9, y: 6 },
      { x: 10, y: 6 }, { x: 11, y: 6 },
    ],
    colors: {
      grass: [0x4a785b, 0x416e52],
      path: 0x969174,
      pathEdge: 0x696b50,
      grassEdge: 0x335941,
      grassDark: 0x284e3b,
      grassLight: 0x88af83,
    },
  },
  {
    id: 'dawn-keep',
    title: 'DAWN KEEP',
    story: 'Armored ogres lead the Hollow Host toward the last beacon. Hold until the Dawn Guard rallies at the gate.',
    waves: [
      ['basic', 'runner', 'guard', 'runner', 'basic'],
      ['runner', 'guard', 'basic', 'runner', 'guard', 'basic', 'runner', 'guard'],
      ['guard', 'runner', 'basic', 'guard', 'runner', 'guard',
        'basic', 'runner', 'guard', 'runner', 'basic', 'guard'],
    ],
    path: [
      { x: 0, y: 6 }, { x: 1, y: 6 }, { x: 2, y: 6 },
      { x: 3, y: 6 }, { x: 3, y: 5 }, { x: 3, y: 4 },
      { x: 3, y: 3 }, { x: 2, y: 3 }, { x: 1, y: 3 },
      { x: 1, y: 2 }, { x: 1, y: 1 }, { x: 2, y: 1 },
      { x: 3, y: 1 }, { x: 4, y: 1 }, { x: 5, y: 1 },
      { x: 6, y: 1 }, { x: 6, y: 2 }, { x: 6, y: 3 },
      { x: 7, y: 3 }, { x: 8, y: 3 }, { x: 9, y: 3 },
      { x: 9, y: 4 }, { x: 9, y: 5 }, { x: 10, y: 5 },
      { x: 11, y: 5 },
    ],
    colors: {
      grass: [0x676d7c, 0x5c6271],
      path: 0xb5aaa0,
      pathEdge: 0x7a7776,
      grassEdge: 0x494e5e,
      grassDark: 0x393f50,
      grassLight: 0x9ba4ae,
    },
  },
];
