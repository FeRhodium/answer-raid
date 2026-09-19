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
// Node 21+ 自带全局 navigator(language 恒为 'en-US'),会让 i18n 的
// 「浏览器语言」探测在测试环境里把默认语言挑成英文。测试要的是确定性:
// 固定成 zh,与用例里「无任何偏好时默认中文」的断言一致。
Object.defineProperty(globalThis, 'navigator', {
  value: { language: 'zh-CN', languages: ['zh-CN', 'zh', 'en'] },
  configurable: true,
});
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
