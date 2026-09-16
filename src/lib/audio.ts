/** 音效与人声合成:全部用 Web Audio 现场合成,不加载任何音频文件。 */

export type SfxName =
  | 'hover'
  | 'blip'
  | 'select'
  | 'correct'
  | 'wrong'
  | 'tick'
  | 'promote'
  | 'gameover'
  | 'victory'
  | 'glitch'
  | 'power';

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let ambient: { stop: () => void } | null = null;
let enabled = true;

function ac(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const Ctor: typeof AudioContext | undefined =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

export function setSoundEnabled(on: boolean): void {
  enabled = on;
  if (master && ctx) master.gain.setTargetAtTime(on ? 0.5 : 0, ctx.currentTime, 0.01);
  if (!on) stopAmbient();
}

export function isSoundEnabled(): boolean {
  return enabled;
}

/** 用户首次交互时调用,解锁 iOS/Safari 的自动播放限制。 */
export function unlockAudio(): void {
  ac();
}

interface ToneOpts {
  freq: number;
  dur: number;
  type?: OscillatorType;
  gain?: number;
  delay?: number;
  slideTo?: number;
}

function tone(o: ToneOpts): void {
  const c = ac();
  if (!c || !master) return;
  const t0 = c.currentTime + (o.delay ?? 0);
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = o.type ?? 'square';
  osc.frequency.setValueAtTime(o.freq, t0);
  if (o.slideTo !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.slideTo), t0 + o.dur);
  }
  const peak = o.gain ?? 0.14;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur);
  osc.connect(g);
  g.connect(master);
  osc.start(t0);
  osc.stop(t0 + o.dur + 0.02);
}

function noise(dur: number, gain = 0.12, delay = 0): void {
  const c = ac();
  if (!c || !master) return;
  const t0 = c.currentTime + delay;
  const len = Math.max(1, Math.floor(c.sampleRate * dur));
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = c.createBufferSource();
  src.buffer = buf;
  const g = c.createGain();
  g.gain.value = gain;
  const lp = c.createBiquadFilter();
  lp.type = 'bandpass';
  lp.frequency.value = 1400;
  lp.Q.value = 0.7;
  src.connect(lp);
  lp.connect(g);
  g.connect(master);
  src.start(t0);
}

const seq = (notes: number[], step: number, opts: Partial<ToneOpts> = {}): void => {
  notes.forEach((f, i) => tone({ freq: f, dur: step * 1.6, delay: i * step, ...opts }));
};

export function sfx(name: SfxName): void {
  if (!enabled) return;
  switch (name) {
    case 'hover':
      tone({ freq: 1500, dur: 0.03, gain: 0.045, type: 'square' });
      break;
    case 'blip':
      tone({ freq: 880, dur: 0.06, gain: 0.09 });
      break;
    case 'select':
      tone({ freq: 1200, dur: 0.05, gain: 0.1 });
      tone({ freq: 1800, dur: 0.07, gain: 0.07, delay: 0.05 });
      break;
    case 'tick':
      tone({ freq: 2400, dur: 0.022, gain: 0.05, type: 'triangle' });
      break;
    case 'correct':
      seq([784, 1046, 1568], 0.062, { gain: 0.11, type: 'triangle' });
      break;
    case 'wrong':
      tone({ freq: 220, dur: 0.22, gain: 0.13, type: 'sawtooth', slideTo: 90 });
      noise(0.18, 0.08);
      break;
    case 'promote':
      seq([523, 659, 784, 1046, 1318], 0.075, { gain: 0.1, type: 'square' });
      break;
    case 'power':
      tone({ freq: 400, dur: 0.3, gain: 0.1, type: 'sine', slideTo: 1600 });
      break;
    case 'glitch':
      for (let i = 0; i < 7; i++) {
        tone({
          freq: 200 + Math.random() * 2400,
          dur: 0.035,
          gain: 0.06,
          type: 'square',
          delay: i * 0.035,
        });
      }
      noise(0.26, 0.1);
      break;
    case 'gameover':
      seq([392, 330, 262, 196], 0.19, { gain: 0.12, type: 'sawtooth' });
      noise(0.5, 0.09, 0.6);
      break;
    case 'victory':
      seq([523, 659, 784, 1046, 1318, 1568], 0.1, { gain: 0.11, type: 'triangle' });
      seq([1046, 1318, 1568, 2093], 0.1, { gain: 0.06, type: 'sine', delay: 0.6 });
      break;
  }
}

/** 低频环境底噪:开始答题时起,结束/静音时停。 */
export function startAmbient(): void {
  const c = ac();
  if (!c || !master || ambient || !enabled) return;
  const g = c.createGain();
  g.gain.value = 0.02;
  const lp = c.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 320;
  const a = c.createOscillator();
  const b = c.createOscillator();
  a.type = 'sawtooth';
  b.type = 'sawtooth';
  a.frequency.value = 55;
  b.frequency.value = 55.4;
  const lfo = c.createOscillator();
  const lfoGain = c.createGain();
  lfo.frequency.value = 0.12;
  lfoGain.gain.value = 90;
  lfo.connect(lfoGain);
  lfoGain.connect(lp.frequency);
  a.connect(lp);
  b.connect(lp);
  lp.connect(g);
  g.connect(master);
  a.start();
  b.start();
  lfo.start();
  ambient = {
    stop: () => {
      try {
        g.gain.setTargetAtTime(0, c.currentTime, 0.2);
        const t = c.currentTime + 0.8;
        a.stop(t);
        b.stop(t);
        lfo.stop(t);
      } catch {
        /* 已停止 */
      }
    },
  };
}

export function stopAmbient(): void {
  ambient?.stop();
  ambient = null;
}
