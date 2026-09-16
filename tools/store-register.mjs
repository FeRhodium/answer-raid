/** 通过 module.register 装载 TS 解析钩子,并补上 Node 里缺失的浏览器全局。 */
import { register } from 'node:module';

register('./ts-resolve.mjs', import.meta.url);

// store 模块会碰 localStorage / AudioContext,在 Node 下给最小替身
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  clear: () => store.clear(),
};
globalThis.window = undefined;
globalThis.AudioContext = class {
  constructor() {
    this.state = 'running';
    this.currentTime = 0;
    this.sampleRate = 48000;
    this.destination = {};
  }
  resume() {}
  createGain() {
    const noop = () => {};
    return {
      gain: { value: 1, setValueAtTime: noop, setTargetAtTime: noop, exponentialRampToValueAtTime: noop },
      connect: noop,
    };
  }
  createOscillator() {
    const noop = () => {};
    return {
      type: 'square',
      frequency: { value: 0, setValueAtTime: noop, exponentialRampToValueAtTime: noop },
      connect: noop,
      start: noop,
      stop: noop,
    };
  }
  createBuffer() {
    return { getChannelData: () => new Float32Array(8) };
  }
  createBufferSource() {
    const noop = () => {};
    return { buffer: null, connect: noop, start: noop, stop: noop };
  }
  createBiquadFilter() {
    const noop = () => {};
    return { type: 'lowpass', frequency: { value: 0 }, Q: { value: 1 }, connect: noop };
  }
};
