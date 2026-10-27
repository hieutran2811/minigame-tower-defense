import { describe, expect, it } from 'vitest';
import { PathFollower } from '../systems/PathFollower';

describe('PathFollower', () => {
  const path = [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 10, y: 10 },
  ];

  it('moves with elapsed time', () => {
    const follower = new PathFollower(path, 5);

    follower.update(1);

    expect(follower.position).toEqual({ x: 5, y: 0 });
    expect(follower.finished).toBe(false);
  });

  it('crosses a corner without cutting diagonally', () => {
    const follower = new PathFollower(path, 5);

    follower.update(3);

    expect(follower.position).toEqual({ x: 10, y: 5 });
  });

  it('reaches a waypoint exactly and continues along the next segment', () => {
    const follower = new PathFollower(path, 5);

    follower.update(2);
    expect(follower.position).toEqual({ x: 10, y: 0 });
    expect(follower.finished).toBe(false);

    follower.update(1);
    expect(follower.position).toEqual({ x: 10, y: 5 });
  });

  it('crosses multiple corners in one update', () => {
    const follower = new PathFollower(
      [...path, { x: 0, y: 10 }, { x: 0, y: 20 }],
      5,
    );

    follower.update(7);

    expect(follower.position).toEqual({ x: 0, y: 15 });
    expect(follower.finished).toBe(false);
  });

  it('stops at the endpoint and stays there on later updates', () => {
    const follower = new PathFollower(path, 5);

    follower.update(100);
    expect(follower.finished).toBe(true);
    expect(follower.position).toEqual({ x: 10, y: 10 });

    follower.update(1);
    expect(follower.position).toEqual({ x: 10, y: 10 });
  });

  it('ignores zero and negative elapsed time', () => {
    const follower = new PathFollower(path, 5);
    follower.update(1);

    follower.update(0);
    follower.update(-1);

    expect(follower.position).toEqual({ x: 5, y: 0 });
  });

  it('does not change the supplied waypoints', () => {
    const waypoints = path.map((point) => ({ ...point }));
    const follower = new PathFollower(waypoints, 5);

    follower.update(3);

    expect(waypoints).toEqual(path);
  });

  it('rejects paths with fewer than two points', () => {
    expect(() => new PathFollower([], 5)).toThrow();
    expect(() => new PathFollower([{ x: 0, y: 0 }], 5)).toThrow();
  });

  it.each([0, -5])('rejects a nonpositive speed of %s', (speed) => {
    expect(() => new PathFollower(path, speed)).toThrow();
  });
});

describe('Path progress for targeting', () => {
  it('tracks traveled distance across corners and clamps at the endpoint', () => {
    const follower = new PathFollower(
      [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }],
      5,
    );

    expect(follower.distanceTraveled).toBe(0);
    follower.update(3);
    expect(follower.distanceTraveled).toBe(15);
    follower.update(100);
    expect(follower.distanceTraveled).toBe(20);
    follower.update(1);
    expect(follower.distanceTraveled).toBe(20);
  });

  it('counts progress when a path reverses screen direction', () => {
    const follower = new PathFollower(
      [{ x: 10, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 10 }],
      5,
    );

    follower.update(3);
    expect(follower.position).toEqual({ x: 0, y: 5 });
    expect(follower.distanceTraveled).toBe(15);
  });
});
