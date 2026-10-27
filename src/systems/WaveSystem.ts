export type MatchState = 'ready' | 'running' | 'won' | 'lost';

export class WaveSystem {
  private waveIndex = -1;
  private elapsed = 0;
  private spawnedCount = 0;
  private activeCount = 0;
  private currentState: MatchState = 'ready';
  private remainingLives: number;
  private killCount = 0;

  constructor(
    private readonly counts: readonly number[],
    private readonly spawnInterval: number,
    startingLives: number,
  ) {
    this.remainingLives = startingLives;
  }

  get state(): MatchState {
    return this.currentState;
  }

  get finished(): boolean {
    return this.currentState === 'won' || this.currentState === 'lost';
  }

  get waveNumber(): number {
    return this.waveIndex + 1;
  }

  get totalWaves(): number {
    return this.counts.length;
  }

  get waveSize(): number {
    return this.counts[this.waveIndex] ?? 0;
  }

  get spawned(): number {
    return this.spawnedCount;
  }

  get active(): number {
    return this.activeCount;
  }

  get lives(): number {
    return this.remainingLives;
  }

  get kills(): number {
    return this.killCount;
  }

  startWave(): boolean {
    if (this.currentState !== 'ready') {
      return false;
    }

    this.waveIndex++;
    this.elapsed = 0;
    this.spawnedCount = 0;
    this.currentState = 'running';
    return true;
  }

  // Each result is the time a new enemy has already spent in this frame.
  // This preserves one-second spacing even if a frame crosses several spawns.
  update(deltaSeconds: number): number[] {
    if (this.currentState !== 'running') {
      return [];
    }

    this.elapsed += Math.max(0, deltaSeconds);
    const ages: number[] = [];

    while (
      this.spawnedCount < this.waveSize &&
      this.spawnedCount * this.spawnInterval <= this.elapsed
    ) {
      ages.push(this.elapsed - this.spawnedCount * this.spawnInterval);
      this.spawnedCount++;
      this.activeCount++;
    }

    return ages;
  }

  resolveEnemy(reason: 'killed' | 'escaped'): void {
    if (this.currentState !== 'running' || this.activeCount === 0) {
      return;
    }

    this.activeCount--;

    if (reason === 'escaped') {
      this.remainingLives--;
    } else {
      this.killCount++;
    }

    if (this.remainingLives === 0) {
      this.currentState = 'lost';
      this.activeCount = 0;
    } else if (this.spawnedCount === this.waveSize && this.activeCount === 0) {
      this.currentState =
        this.waveNumber === this.totalWaves ? 'won' : 'ready';
    }
  }
}
