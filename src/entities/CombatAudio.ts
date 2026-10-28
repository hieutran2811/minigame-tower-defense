const CUES = {
  shot: { from: 660, to: 440, duration: 0.05, type: 'square' },
  hit: { from: 880, to: 660, duration: 0.06, type: 'triangle' },
  kill: { from: 440, to: 880, duration: 0.12, type: 'triangle' },
  escape: { from: 220, to: 110, duration: 0.18, type: 'sawtooth' },
} as const;

export class CombatAudio {
  private enabled = false;
  private readonly voices = new Map<OscillatorNode, GainNode>();

  constructor(
    private readonly context: AudioContext,
    private readonly destination: AudioNode,
  ) {}

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;

    if (!enabled) {
      this.stop();
    }
  }

  play(cue: keyof typeof CUES): void {
    // Never queue sounds while muted or while the browser has suspended audio.
    if (!this.enabled || this.context.state !== 'running') {
      return;
    }

    if (cue === 'escape') {
      this.stop();
    }

    // Free towers can fire together; keep the combined loudness bounded.
    if (this.voices.size >= 16) {
      return;
    }

    const tone = CUES[cue];
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    const now = this.context.currentTime;
    const end = now + tone.duration;

    oscillator.type = tone.type;
    oscillator.frequency.setValueAtTime(tone.from, now);
    oscillator.frequency.exponentialRampToValueAtTime(tone.to, end);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.025, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);
    oscillator.connect(gain);
    gain.connect(this.destination);
    this.voices.set(oscillator, gain);

    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
      this.voices.delete(oscillator);
    };

    oscillator.start(now);
    oscillator.stop(end);
  }

  stop(): void {
    for (const [oscillator, gain] of this.voices) {
      oscillator.onended = null;
      oscillator.stop();
      oscillator.disconnect();
      gain.disconnect();
    }

    this.voices.clear();
  }
}
