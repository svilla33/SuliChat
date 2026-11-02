// Web Audio API synthesizer for notification sounds
// Guarantees reliable playback without external asset load failures or CORS issues

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export const AVAILABLE_SOUNDS = [
  { id: 'positive-game-sound-4.ogg', name: 'positive-game-sound-4.ogg' },
  { id: 'chime.ogg', name: 'chime.ogg' },
  { id: 'bell.ogg', name: 'bell.ogg' },
  { id: 'pop.ogg', name: 'pop.ogg' },
  { id: 'coin.ogg', name: 'coin.ogg' },
];

export function playNotificationSound(soundId: string = 'positive-game-sound-4.ogg', volumePercent: number = 50) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const gainNode = ctx.createGain();
    const normalizedVol = Math.max(0, Math.min(1, volumePercent / 100));
    gainNode.gain.setValueAtTime(normalizedVol * 0.4, ctx.currentTime);
    gainNode.connect(ctx.destination);

    const now = ctx.currentTime;

    switch (soundId) {
      case 'positive-game-sound-4.ogg': {
        // Pleasant rising 3-tone arpeggio (C5 -> E5 -> G5)
        const notes = [523.25, 659.25, 783.99];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);

          noteGain.gain.setValueAtTime(0, now + idx * 0.08);
          noteGain.gain.linearRampToValueAtTime(1, now + idx * 0.08 + 0.02);
          noteGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.28);

          osc.connect(noteGain);
          noteGain.connect(gainNode);

          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.3);
        });
        break;
      }

      case 'chime.ogg': {
        // Two soft crystal chimes
        [659.25, 880.0].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.1);

          noteGain.gain.setValueAtTime(0.8, now + idx * 0.1);
          noteGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.4);

          osc.connect(noteGain);
          noteGain.connect(gainNode);

          osc.start(now + idx * 0.1);
          osc.stop(now + idx * 0.1 + 0.45);
        });
        break;
      }

      case 'bell.ogg': {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(987.77, now); // B5
        gainNode.gain.setValueAtTime(normalizedVol * 0.5, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.55);
        break;
      }

      case 'pop.ogg': {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);
        gainNode.gain.setValueAtTime(normalizedVol * 0.6, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.14);
        break;
      }

      case 'coin.ogg':
      default: {
        // 8-bit coin sound B5 -> E6
        const osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(987.77, now);
        osc.frequency.setValueAtTime(1318.51, now + 0.08);
        gainNode.gain.setValueAtTime(normalizedVol * 0.25, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.38);
        break;
      }
    }
  } catch (err) {
    console.warn('Audio notification could not be played:', err);
  }
}
