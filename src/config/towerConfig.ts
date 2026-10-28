import { TOWER_DAMAGE, TOWER_FIRE_INTERVAL, TOWER_RANGE } from './combatConfig';

export const TOWER_TYPES = {
  basic: {
    label: 'BASIC',
    shortLabel: 'BASIC',
    range: TOWER_RANGE,
    interval: TOWER_FIRE_INTERVAL,
    damage: TOWER_DAMAGE,
    color: 0x4bc5e8,
    outline: 0x236b88,
    projectileColor: 0xffdc73,
  },
  rapid: {
    label: 'RAPID',
    shortLabel: 'RAPID',
    range: 96,
    interval: 0.4,
    damage: 1,
    color: 0x91d57c,
    outline: 0x356645,
    projectileColor: 0xb4ffa0,
  },
  longbow: {
    label: 'LONGBOW',
    shortLabel: 'BOW',
    range: 192,
    interval: 1.5,
    damage: 2,
    color: 0xe1b56c,
    outline: 0x80542e,
    projectileColor: 0xffbe73,
  },
} as const;

export const TOWER_KINDS = ['basic', 'rapid', 'longbow'] as const;
export type TowerKind = typeof TOWER_KINDS[number];
export type TowerProfile = typeof TOWER_TYPES[TowerKind];
