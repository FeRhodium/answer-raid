import type { TierMeta } from './types';

/**
 * 五个难度档位。代号沿用音游的难度分级习惯(EZ → HD → IN → AT → SP),
 * 只是**难度标识**,不带任何身份或圈层暗示。
 *
 * 越往上越不许犯错:不灭次数递减、限时收紧、基础分放大。
 * 展示文案(名称与说明)走 i18n 的 `tier.<id>.label` / `.desc`,这里只管数值。
 */
export const TIERS: TierMeta[] = [
  {
    id: 'ez',
    index: 0,
    name: 'EZ',
    hue: 152,
    accent: '#39ff88',
    icon: '▚',
    allowMiss: 2,
    timeLimit: 40,
    baseScore: 100,
  },
  {
    id: 'hd',
    index: 1,
    name: 'HD',
    hue: 190,
    accent: '#3ce0ff',
    icon: '◈',
    allowMiss: 2,
    timeLimit: 35,
    baseScore: 180,
  },
  {
    id: 'in',
    index: 2,
    name: 'IN',
    hue: 268,
    accent: '#a97bff',
    icon: '◆',
    allowMiss: 1,
    timeLimit: 30,
    baseScore: 280,
  },
  {
    id: 'at',
    index: 3,
    name: 'AT',
    hue: 38,
    accent: '#ffc93c',
    icon: '◤',
    allowMiss: 1,
    timeLimit: 25,
    baseScore: 400,
  },
  {
    id: 'sp',
    index: 4,
    name: 'SP',
    hue: 320,
    accent: '#ff3ea5',
    icon: '✶',
    allowMiss: 1,
    timeLimit: 22,
    baseScore: 560,
  },
];

export const TIER_MAP: Record<string, TierMeta> = Object.fromEntries(
  TIERS.map((t) => [t.id, t]),
);

export function tierMeta(id: string): TierMeta {
  return TIER_MAP[id] ?? TIERS[0];
}
