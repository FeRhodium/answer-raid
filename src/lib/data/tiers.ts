import type { TierMeta } from './types';

/**
 * 三个难度档位的元数据(只管结构与数值,展示文案走 i18n 的 `tier.<id>.label` / `.desc`)。
 * 答错允许次数递减,限时递减,基础分递增 —— 越往上越不许犯错。
 */
export const TIERS: TierMeta[] = [
  {
    id: 'novice',
    index: 0,
    name: 'ENTRY',
    hue: 152,
    accent: '#39ff88',
    icon: '▚',
    allowMiss: 2,
    timeLimit: 30,
    baseScore: 100,
  },
  {
    id: 'hacker',
    index: 1,
    name: 'SYSTEMS',
    hue: 45,
    accent: '#ffc93c',
    icon: '◤',
    allowMiss: 1,
    timeLimit: 45,
    baseScore: 250,
  },
  {
    id: 'acm',
    index: 2,
    name: 'ACM',
    hue: 320,
    accent: '#ff3ea5',
    icon: '✶',
    allowMiss: 1,
    timeLimit: 60,
    baseScore: 500,
  },
];

export const TIER_MAP: Record<string, TierMeta> = Object.fromEntries(
  TIERS.map((t) => [t.id, t]),
);

export function tierMeta(id: string): TierMeta {
  return TIER_MAP[id] ?? TIERS[0];
}
