import { ENEMY_MAX_HEALTH, ENEMY_SPEED } from './combatConfig';

export const ENEMY_TYPES = {
  basic: {
    label: 'BASIC',
    maxHealth: ENEMY_MAX_HEALTH,
    speed: ENEMY_SPEED,
    color: 0x9b5de5,
    outline: 0x352044,
    burst: 0xc99aff,
  },
  runner: {
    label: 'RUNNER',
    maxHealth: 2,
    speed: 140,
    color: 0xf2a65a,
    outline: 0x7b3f23,
    burst: 0xffd08a,
  },
  guard: {
    label: 'GUARD',
    maxHealth: 7,
    speed: 65,
    color: 0x6b91a6,
    outline: 0x263d52,
    burst: 0xa8c7d6,
  },
} as const;

export type EnemyKind = keyof typeof ENEMY_TYPES;
