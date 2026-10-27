import { describe, expect, it } from 'vitest';
import { SPAWN_INTERVAL, STARTING_LIVES, WAVE_COUNTS } from '../config/waveConfig';
import { WaveSystem } from '../systems/WaveSystem';

const createMatch = () =>
  new WaveSystem(WAVE_COUNTS, SPAWN_INTERVAL, STARTING_LIVES);

describe('Wave scheduling', () => {
  it('waits for the first wave to be started manually', () => {
    const match = createMatch();

    expect(match.state).toBe('ready');
    expect(match.waveNumber).toBe(0);
    expect(match.lives).toBe(10);
    expect(match.update(100)).toEqual([]);
    expect(match.active).toBe(0);
  });

  it('spawns immediately, then once per second up to the configured count', () => {
    const match = createMatch();
    expect(match.startWave()).toBe(true);
    expect(match.update(0)).toEqual([0]);
    expect(match.update(0.5)).toEqual([]);
    expect(match.update(0.5)).toEqual([0]);
    expect(match.update(10)).toHaveLength(3);
    expect(match.spawned).toBe(5);
    expect(match.active).toBe(5);
    expect(match.update(100)).toEqual([]);
  });

  it('reports each spawn age when a frame crosses multiple spawn times', () => {
    const match = createMatch();
    match.startWave();

    expect(match.update(2.5)).toEqual([2.5, 1.5, 0.5]);
    expect(match.spawned).toBe(3);
  });

  it('does not advance spawn time for a negative delta', () => {
    const match = createMatch();
    match.startWave();
    match.update(0);

    expect(match.update(-5)).toEqual([]);
    expect(match.update(1)).toEqual([0]);
  });

  it('rejects repeated start requests during a wave', () => {
    const match = createMatch();
    match.startWave();
    match.update(2);

    expect(match.startWave()).toBe(false);
    expect(match.spawned).toBe(3);
    expect(match.waveNumber).toBe(1);
  });

  it('waits for unspawned enemies even when no active enemies remain', () => {
    const match = createMatch();
    match.startWave();
    match.update(0);
    match.resolveEnemy('killed');

    expect(match.active).toBe(0);
    expect(match.state).toBe('running');
    expect(match.startWave()).toBe(false);
    expect(match.update(1)).toEqual([0]);
  });

  it('does not advance to the next wave while active enemies remain', () => {
    const match = createMatch();
    match.startWave();
    match.update(10);

    for (let index = 0; index < 4; index++) {
      match.resolveEnemy('killed');
    }

    expect(match.state).toBe('running');
    expect(match.active).toBe(1);
    match.resolveEnemy('killed');
    expect(match.state).toBe('ready');
    expect(match.update(100)).toEqual([]);
    expect(match.waveNumber).toBe(1);
    expect(match.startWave()).toBe(true);
    expect(match.waveSize).toBe(8);
  });
});

describe('Lives and match outcome', () => {
  it('counts kills without losing lives and loses one life per escape', () => {
    const match = createMatch();
    match.startWave();
    match.update(2);

    match.resolveEnemy('killed');
    expect(match.kills).toBe(1);
    expect(match.lives).toBe(10);
    match.resolveEnemy('escaped');
    expect(match.kills).toBe(1);
    expect(match.lives).toBe(9);
    expect(match.active).toBe(1);
  });

  it('wins only after all 5, 8, and 12 enemies have been resolved', () => {
    const match = createMatch();

    for (const size of WAVE_COUNTS) {
      expect(match.startWave()).toBe(true);
      expect(match.update(100)).toHaveLength(size);

      for (let index = 0; index < size; index++) {
        match.resolveEnemy('killed');
      }
    }

    expect(match.state).toBe('won');
    expect(match.finished).toBe(true);
    expect(match.kills).toBe(25);
    expect(match.lives).toBe(10);
    expect(match.startWave()).toBe(false);
    expect(match.update(100)).toEqual([]);
  });

  it('can win with lives remaining after an escape in the final wave', () => {
    const match = new WaveSystem([1], 1, 10);
    match.startWave();
    match.update(0);
    match.resolveEnemy('escaped');

    expect(match.state).toBe('won');
    expect(match.lives).toBe(9);
    expect(match.kills).toBe(0);
  });

  it('loses at zero lives instead of winning on the final escape', () => {
    const match = new WaveSystem([2], 1, 2);
    match.startWave();
    match.update(1);
    match.resolveEnemy('escaped');
    match.resolveEnemy('escaped');

    expect(match.state).toBe('lost');
    expect(match.finished).toBe(true);
    expect(match.lives).toBe(0);
    expect(match.active).toBe(0);
    expect(match.startWave()).toBe(false);
    expect(match.update(100)).toEqual([]);
    match.resolveEnemy('escaped');
    expect(match.lives).toBe(0);
  });

  it('ignores enemy resolution when the match is not running or has no enemies', () => {
    const match = createMatch();
    match.resolveEnemy('escaped');
    match.startWave();
    match.resolveEnemy('killed');

    expect(match.lives).toBe(10);
    expect(match.kills).toBe(0);
    expect(match.active).toBe(0);
  });

  it('creates fresh match state for Restart', () => {
    const oldMatch = createMatch();
    oldMatch.startWave();
    oldMatch.update(2);
    oldMatch.resolveEnemy('escaped');
    oldMatch.resolveEnemy('killed');

    const restarted = createMatch();

    expect(restarted.state).toBe('ready');
    expect(restarted.waveNumber).toBe(0);
    expect(restarted.lives).toBe(10);
    expect(restarted.kills).toBe(0);
    expect(restarted.active).toBe(0);
    expect(restarted.spawned).toBe(0);
  });
});
