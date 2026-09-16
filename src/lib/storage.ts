/** localStorage 持久化:最高分、历史战绩、静音偏好。全部做 try/catch,隐私模式下也不炸。 */

import type { TierId } from './data/types';

export interface RunRecord {
  handle: string;
  score: number;
  /** 本局到达过的最高档位。 */
  tier: TierId;
  /** 是否通关到 ACM 档并答完。 */
  cleared: boolean;
  /** 正确率 0~1。 */
  accuracy: number;
  /** 最高连击。 */
  combo: number;
  answered: number;
  at: number;
}

const K_BEST = 'csa.raid.best.v1';
const K_HIST = 'csa.raid.history.v1';
const K_SOUND = 'csa.raid.sound.v1';
const K_HANDLE = 'csa.raid.handle.v1';

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* 忽略:无痕模式 / 配额满 */
  }
}

export function loadBest(): RunRecord | null {
  const r = read<RunRecord | null>(K_BEST, null);
  return r && typeof r.score === 'number' ? r : null;
}

export function saveBest(rec: RunRecord): boolean {
  const best = loadBest();
  if (!best || rec.score > best.score) {
    write(K_BEST, rec);
    return true;
  }
  return false;
}

export function loadHistory(): RunRecord[] {
  const h = read<RunRecord[]>(K_HIST, []);
  return Array.isArray(h) ? h.slice(0, 20) : [];
}

export function pushHistory(rec: RunRecord): void {
  const h = loadHistory();
  h.unshift(rec);
  write(K_HIST, h.slice(0, 20));
}

export function loadSoundPref(): boolean {
  return read<boolean>(K_SOUND, true);
}

export function saveSoundPref(on: boolean): void {
  write(K_SOUND, on);
}

export function loadHandle(): string {
  return read<string>(K_HANDLE, '');
}

export function saveHandle(h: string): void {
  write(K_HANDLE, h);
}

export function resetAll(): void {
  try {
    [K_BEST, K_HIST, K_HANDLE].forEach((k) => localStorage.removeItem(k));
  } catch {
    /* 忽略 */
  }
}
