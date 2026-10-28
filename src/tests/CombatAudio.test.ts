import { describe, expect, it, vi } from 'vitest';
import { CombatAudio } from '../entities/CombatAudio';

const createVoice = () => ({
  type: 'sine' as OscillatorType,
  frequency: {
    setValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  },
  connect: vi.fn(),
  disconnect: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
  onended: null as (() => void) | null,
});

const createGain = () => ({
  gain: {
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  },
  connect: vi.fn(),
  disconnect: vi.fn(),
});

function createAudio() {
  const voices: ReturnType<typeof createVoice>[] = [];
  const gains: ReturnType<typeof createGain>[] = [];
  const context = {
    state: 'running' as AudioContextState,
    currentTime: 10,
    createOscillator: vi.fn(() => {
      const voice = createVoice();
      voices.push(voice);
      return voice;
    }),
    createGain: vi.fn(() => {
      const gain = createGain();
      gains.push(gain);
      return gain;
    }),
    close: vi.fn(),
    suspend: vi.fn(),
  };
  const audio = new CombatAudio(context as unknown as AudioContext, {} as AudioNode);

  return { audio, context, voices, gains };
}

describe('Combat audio lifecycle', () => {
  it('starts muted and does not queue cues while the context is suspended', () => {
    const { audio, context } = createAudio();
    audio.play('shot');
    expect(context.createOscillator).not.toHaveBeenCalled();

    audio.setEnabled(true);
    context.state = 'suspended';
    audio.play('kill');
    context.state = 'running';
    expect(context.createOscillator).not.toHaveBeenCalled();

    audio.play('hit');
    expect(context.createOscillator).toHaveBeenCalledTimes(1);
  });

  it('stops active sounds on mute and does not replay them on unmute', () => {
    const { audio, context, voices, gains } = createAudio();
    audio.setEnabled(true);
    audio.play('shot');
    audio.play('hit');
    audio.setEnabled(false);

    for (const voice of voices) {
      expect(voice.stop).toHaveBeenLastCalledWith();
      expect(voice.disconnect).toHaveBeenCalledTimes(1);
      expect(voice.onended).toBeNull();
    }

    for (const gain of gains) {
      expect(gain.disconnect).toHaveBeenCalledTimes(1);
    }

    audio.setEnabled(true);
    expect(context.createOscillator).toHaveBeenCalledTimes(2);
    audio.play('kill');
    expect(context.createOscillator).toHaveBeenCalledTimes(3);
  });

  it('releases completed voices so later cleanup does not stop them again', () => {
    const { audio, voices, gains } = createAudio();
    audio.setEnabled(true);
    audio.play('kill');
    voices[0].onended?.();
    audio.stop();

    expect(voices[0].stop).toHaveBeenCalledTimes(1);
    expect(voices[0].disconnect).toHaveBeenCalledTimes(1);
    expect(gains[0].disconnect).toHaveBeenCalledTimes(1);
  });

  it('can clean up twice without closing or suspending the shared context', () => {
    const { audio, context, voices, gains } = createAudio();
    audio.setEnabled(true);
    audio.play('shot');
    audio.play('hit');
    audio.stop();
    audio.stop();

    for (const voice of voices) {
      expect(voice.stop).toHaveBeenCalledTimes(2);
      expect(voice.disconnect).toHaveBeenCalledTimes(1);
    }

    for (const gain of gains) {
      expect(gain.disconnect).toHaveBeenCalledTimes(1);
    }

    expect(context.close).not.toHaveBeenCalled();
    expect(context.suspend).not.toHaveBeenCalled();
  });

  it('lets an escape warning replace existing combat sounds', () => {
    const { audio, context, voices } = createAudio();
    audio.setEnabled(true);
    audio.play('shot');
    audio.play('kill');
    audio.play('escape');

    expect(context.createOscillator).toHaveBeenCalledTimes(3);
    expect(voices[0].disconnect).toHaveBeenCalledTimes(1);
    expect(voices[1].disconnect).toHaveBeenCalledTimes(1);
    expect(voices[2].stop).toHaveBeenCalledTimes(1);
  });
});
